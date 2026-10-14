// Command relay is Geistloom's telemetry relay daemon.
//
// It accepts world-simulation events over HTTP, buffers
// them, and fans them out live over SSE (Server-Sent
// Events). It exists so the Century Engine's runs can be
// observed in real time without any third-party service —
// the relay is the observability layer of the frame itself.
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"
)

var addr = flag.String("addr", ":9119", "listen address")

// Event is one simulation event emitted by a Century Engine run.
type Event struct {
	RunID string          `json:"runId"`
	Year  float64         `json:"year"`
	Life  float64         `json:"lifeExpectancy"`
	Pop   float64         `json:"population"`
	Bio   float64         `json:"biosphereHealth"`
	Raw   json.RawMessage `json:"raw,omitempty"`
	At    time.Time       `json:"at"`
}

// Hub fans events out to connected SSE clients.
type Hub struct {
	mu      sync.RWMutex
	clients map[chan Event]struct{}
	history []Event
}

func newHub() *Hub {
	return &Hub{clients: make(map[chan Event]struct{})}
}

func (h *Hub) subscribe() chan Event {
	ch := make(chan Event, 256)
	h.mu.Lock()
	h.clients[ch] = struct{}{}
	h.mu.Unlock()
	return ch
}

func (h *Hub) unsubscribe(ch chan Event) {
	h.mu.Lock()
	delete(h.clients, ch)
	h.mu.Unlock()
	close(ch)
}

func (h *Hub) publish(ev Event) {
	h.mu.Lock()
	h.history = append(h.history, ev)
	if len(h.history) > 10_000 {
		h.history = h.history[len(h.history)-10_000:]
	}
	clients := make([]chan Event, 0, len(h.clients))
	for ch := range h.clients {
		clients = append(clients, ch)
	}
	h.mu.Unlock()
	for _, ch := range clients {
		select {
		case ch <- ev:
		default: // slow consumer: drop rather than block the publisher
		}
	}
}

func (h *Hub) snapshot() []Event {
	h.mu.RLock()
	defer h.mu.RUnlock()
	out := make([]Event, len(h.history))
	copy(out, h.history)
	return out
}

func main() {
	flag.Parse()
	hub := newHub()
	log.Printf("geistloom-relay listening on %s", *addr)
	if err := http.ListenAndServe(*addr, testMux(hub)); err != nil {
		log.Fatal(err)
	}
}

// testMux builds the routing table (shared with tests).
func testMux(hub *Hub) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status":"ok","service":"geistloom-relay"}`)
	})

	mux.HandleFunc("/events", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "POST only", http.StatusMethodNotAllowed)
			return
		}
		var ev Event
		if err := json.NewDecoder(r.Body).Decode(&ev); err != nil {
			http.Error(w, "bad event: "+err.Error(), http.StatusBadRequest)
			return
		}
		if ev.At.IsZero() {
			ev.At = time.Now().UTC()
		}
		hub.publish(ev)
		w.WriteHeader(http.StatusAccepted)
	})

	mux.HandleFunc("/replay", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(hub.snapshot())
	})

	mux.HandleFunc("/stream", func(w http.ResponseWriter, r *http.Request) {
		flusher, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "streaming unsupported", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.WriteHeader(http.StatusOK)
		flusher.Flush()

		ch := hub.subscribe()
		defer hub.unsubscribe(ch)

		heartbeat := time.NewTicker(15 * time.Second)
		defer heartbeat.Stop()

		for {
			select {
			case <-r.Context().Done():
				return
			case <-heartbeat.C:
				fmt.Fprint(w, ": heartbeat\n\n")
				flusher.Flush()
			case ev := <-ch:
				payload, _ := json.Marshal(ev)
				fmt.Fprintf(w, "data: %s\n\n", payload)
				flusher.Flush()
			}
		}
	})

	return mux
}
