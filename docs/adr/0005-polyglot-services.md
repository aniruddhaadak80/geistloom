# ADR-0005: Three polyglot services — each earns its place

- Status: Accepted
- Date: 2026-10-11

## Context

A polyglot repo is a real cost: four toolchains in CI, four Dockerfiles, four sets of reviewer expertise. Every service beyond the web app must justify itself against "do it in TypeScript in `packages/core`."

## Decision

Three services, three reasons:

- **Python FastAPI** (`services/oracle`, :8787) — the oracle brain service, where Python's data-ecosystem credibility matters for a biotech-facing product and where the knowledge graph's future tooling (notebooks, analysis) lives. Optional at runtime.
- **Rust → wasm** (`crates/loom-engine`) — hot numeric loops: RK4 propagation and the gene-drive recursion, compiled to wasm so the browser computes heavy trajectories without a server round-trip.
- **Go** (`services/relay`, :9119) — the SSE telemetry relay, where cheap concurrent fan-out of world-state events to many browsers is the whole job.

Each is optional: `packages/core` runs the entire demo alone.

## Consequences

- The demo runs on Bun alone; services are additive, not load-bearing.
- Each service ships its own Dockerfile, `/healthz`, and test gate (`pytest`, `cargo test`, `go test` in CI).
- Reviewers only need one toolchain deep; the others are small, isolated surfaces.
- The cost — four toolchains — is accepted because each service is small, independently deployable, and replaceable without touching core.
- Any new service must pass the same "earns its place" test at ADR time, or it goes into `packages/core`.
