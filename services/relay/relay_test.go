package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealthz(t *testing.T) {
	hub := newHub()
	server := httptest.NewServer(testMux(hub))
	defer server.Close()

	res, err := http.Get(server.URL + "/healthz")
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.StatusCode)
	}
	var body map[string]string
	if err := json.NewDecoder(res.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if body["service"] != "geistloom-relay" {
		t.Fatalf("unexpected service name: %v", body)
	}
}

func TestEventIngestAndReplay(t *testing.T) {
	hub := newHub()
	server := httptest.NewServer(testMux(hub))
	defer server.Close()

	ev := Event{RunID: "run-1", Year: 2050.5, Life: 88.4, Pop: 9.9, Bio: 71.2}
	payload, _ := json.Marshal(ev)
	res, err := http.Post(server.URL+"/events", "application/json", bytes.NewReader(payload))
	if err != nil {
		t.Fatal(err)
	}
	res.Body.Close()
	if res.StatusCode != http.StatusAccepted {
		t.Fatalf("expected 202, got %d", res.StatusCode)
	}

	replay, err := http.Get(server.URL + "/replay")
	if err != nil {
		t.Fatal(err)
	}
	defer replay.Body.Close()
	var events []Event
	if err := json.NewDecoder(replay.Body).Decode(&events); err != nil {
		t.Fatal(err)
	}
	if len(events) != 1 {
		t.Fatalf("expected 1 buffered event, got %d", len(events))
	}
	if events[0].RunID != "run-1" || events[0].Life != 88.4 {
		t.Fatalf("event round-trip mismatch: %+v", events[0])
	}
}

func TestBadEventRejected(t *testing.T) {
	hub := newHub()
	server := httptest.NewServer(testMux(hub))
	defer server.Close()

	res, err := http.Post(server.URL+"/events", "application/json", bytes.NewReader([]byte("not-json")))
	if err != nil {
		t.Fatal(err)
	}
	res.Body.Close()
	if res.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", res.StatusCode)
	}
}

func TestEventsRejectNonPost(t *testing.T) {
	hub := newHub()
	server := httptest.NewServer(testMux(hub))
	defer server.Close()

	res, err := http.Get(server.URL + "/events")
	if err != nil {
		t.Fatal(err)
	}
	res.Body.Close()
	if res.StatusCode != http.StatusMethodNotAllowed {
		t.Fatalf("expected 405, got %d", res.StatusCode)
	}
}
