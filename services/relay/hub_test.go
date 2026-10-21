package main

import (
	"testing"
	"time"
)

func TestPublishFansOutToEverySubscriber(t *testing.T) {
	hub := newHub()
	a := hub.subscribe()
	b := hub.subscribe()

	hub.publish(Event{RunID: "run-1", Year: 2050.5})

	for name, ch := range map[string]chan Event{"a": a, "b": b} {
		select {
		case ev := <-ch:
			if ev.RunID != "run-1" {
				t.Fatalf("%s: expected run-1, got %q", name, ev.RunID)
			}
			if ev.Year != 2050.5 {
				t.Fatalf("%s: expected year 2050.5, got %v", name, ev.Year)
			}
		case <-time.After(time.Second):
			t.Fatalf("%s: no event was delivered", name)
		}
	}
}

func TestSnapshotIsACopyOfTheHistory(t *testing.T) {
	hub := newHub()
	hub.publish(Event{RunID: "run-1"})

	snapshot := hub.snapshot()
	if len(snapshot) != 1 {
		t.Fatalf("expected 1 event, got %d", len(snapshot))
	}

	// A caller that edits the snapshot must not be able to rewrite the hub's
	// own history.
	snapshot[0].RunID = "mutated"

	again := hub.snapshot()
	if again[0].RunID != "run-1" {
		t.Fatalf("the snapshot was not a copy: history now holds %q", again[0].RunID)
	}
}

func TestHistoryKeepsOnlyTheLastTenThousandEvents(t *testing.T) {
	hub := newHub()
	for i := 0; i < 10_050; i++ {
		hub.publish(Event{Year: float64(i)})
	}

	history := hub.snapshot()
	if len(history) != 10_000 {
		t.Fatalf("expected the history to be capped at 10000 events, got %d", len(history))
	}
	if history[0].Year != 50 {
		t.Fatalf("expected the oldest kept event to be 50, got %v", history[0].Year)
	}
	if last := history[len(history)-1].Year; last != 10_049 {
		t.Fatalf("expected the newest event to be 10049, got %v", last)
	}
}

func TestSlowConsumerDoesNotBlockThePublisher(t *testing.T) {
	hub := newHub()
	ch := hub.subscribe()

	done := make(chan struct{})
	go func() {
		for i := 0; i < 1_000; i++ {
			hub.publish(Event{Year: float64(i)})
		}
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(5 * time.Second):
		t.Fatal("publish blocked on a subscriber that never reads")
	}

	// The subscriber never read, so its buffer filled and the rest was
	// dropped. A publisher that blocked instead of dropping would have hung
	// the run.
	if got, want := len(ch), cap(ch); got != want {
		t.Fatalf("expected the subscriber buffer to be full (%d), got %d", want, got)
	}
}

func TestUnsubscribeClosesTheChannel(t *testing.T) {
	hub := newHub()
	ch := hub.subscribe()

	hub.unsubscribe(ch)

	if _, open := <-ch; open {
		t.Fatal("expected the subscriber's channel to be closed")
	}
}

func TestPublishingAfterUnsubscribeIsSafe(t *testing.T) {
	hub := newHub()
	ch := hub.subscribe()
	hub.unsubscribe(ch)

	// The client is out of the fan-out set, so this must neither reach it nor
	// panic on the closed channel.
	hub.publish(Event{RunID: "run-1"})

	if got := len(hub.snapshot()); got != 1 {
		t.Fatalf("expected the event to be recorded in the history, got %d events", got)
	}
}
