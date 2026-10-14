# Geistloom examples

Three small, runnable consumers of the frame. Each is a workspace package —
`bun install` once at the repo root and every example is on the same
dependency graph as the app.

## 1. `oracle-cli` — the Oracle in your terminal

```bash
bun run --cwd examples/oracle-cli start -- "solve aging"
GEISTLOOM_API=http://localhost:8000 bun run --cwd examples/oracle-cli start
```

Prints the same six-phase plan, brain trace, and citation count the web app
renders — from the SDK client, against a running web app (or the Python
service via `GEISTLOOM_API`).

## 2. `century-worker` — the Century Engine with no server

```bash
bun run --cwd examples/century-worker start -- \
  --seed 4093 \
  --interventions senolytics-dq,rapamycin-class \
  --scenario bio-dividend \
  --end-year 2226
```

Runs the engine in-process, prints the summary, and writes
`runs/run-<seed>-<interventions>.json`. Re-running the same flags reproduces
the file byte for byte — that is the determinism contract, demonstrated in one
command.

## 3. `replay-webhook` — fork a world from any posted state

```bash
bun run --cwd examples/replay-webhook start     # listens on :8787

curl -X POST http://localhost:8787/replay \
  -H 'content-type: application/json' \
  -d '{"state": <WorldState from any run>, "enabledInterventionIds": ["senolytics-dq"]}'
```

Validates the state against the schema the web app uses, forks a 100-year
world from that exact year, and returns the forked summary. Any `WorldState`
from any run — the UI's time machine, the worker's JSON, a hand-edited
variant — is a complete, replayable coordinate.
