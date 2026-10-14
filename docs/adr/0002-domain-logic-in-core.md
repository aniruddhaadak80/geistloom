# ADR-0002: Domain logic lives in packages/core as pure functions

- Status: Accepted
- Date: 2026-10-11

## Context

The same engine results are needed by the Next.js web app, the Python oracle service, the Rust wasm engine, and the Go relay. If domain logic lives in route handlers or service code, it duplicates across four toolchains and drifts — the web UI would show different results than the wasm engine for the same seed, which kills the determinism contract.

## Decision

All domain logic — the Oracle (`askOracle`), the Century Engine (`simulateCentury`), the Gene Drive Engine, and every domain table (hallmarks, interventions, clocks, scenarios) — lives in `packages/core` as pure, dependency-light (zod only), JSON-serializable functions. Route handlers in `apps/web` are thin adapters: parse input with zod, call core, serialize output. Services call core through the same contract (or a faithful port).

## Consequences

- One source of truth: the web app, the wasm port (`crates/loom-engine`), and the Python service all compute the same world for the same seed.
- Engine code is trivially unit-testable — no HTTP, no DOM, no database.
- `packages/core` must stay dependency-light; any new dependency is an architecture review.
- Route handlers stay boring, which is the goal: they hold no logic worth duplicating.
- The Rust port is a manual mirror of core; drift between them is caught by cross-toolchain golden tests on shared seeds.
