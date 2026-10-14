# geistloom-relay

The telemetry relay daemon (Go).

## What it is

The observability layer of the frame. Century Engine runs emit
events (`runId`, `year`, `lifeExpectancy`, `population`,
`biosphereHealth`); the relay ingests them over HTTP, buffers
the last 10,000, and fans them out live over SSE. The
Worldboard route streams from this endpoint. Zero external
dependencies — the standard library is enough.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/healthz` | Liveness probe |
| POST | `/events` | Ingest one simulation event |
| GET | `/replay` | Replay the buffered history |
| GET | `/stream` | Live SSE fan-out (Server-Sent Events) |

## Run & test

```powershell
cd services/relay
go test ./...
go run . --addr :9119
```

## Why a separate daemon

The web app is a static-ish Next.js build; the simulation
engines are libraries. Something has to carry live events
between them without a managed service, and that something
should be boring, fast, and dependency-light — which is a
three-line description of Go.
