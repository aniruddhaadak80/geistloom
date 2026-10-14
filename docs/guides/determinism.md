# The determinism contract

Geistloom's claim is narrow and testable: **same prompt, same seed,
byte-identical output — forever.**

## What that means in practice

Every quantity the system computes is a pure function of:

1. the domain data in `@geistloom/core` (versioned in git),
2. a seed (4093 by default, or derived from the prompt),
3. the request parameters (interventions, scenario, years, thresholds).

No request depends on wall-clock time, the browser, geography, or a third
party. There is no telemetry, analytics, or error-reporting call anywhere in
the app; the only network activity is the fonts Next.js fetches at build time
and the SSE stream to your own relay.

## Where seeds come from

| Surface | Seed source |
| --- | --- |
| Century Engine runs | the seed you pick (default 4093) |
| Oracle plans | FNV-1a hash of the prompt, so "solve aging" always maps to the same plan |
| Worldboard live stream | `run-<seed>` id, `mulberry32(seed)` — no `Date.now` |
| Generated assets | `mulberry32(seedFromString("banner-stars"))` etc. |
| Generated routes / locales / docs | `ENGINE_SEED = 4093` in `scripts/generators/_shared.mjs` |

## How it is enforced

- **Lint convention.** `Math.random`, `Date.now`, and `new Date()` never
  appear in `packages/core`, `crates/loom-engine`, `services/`, or the
  simulation components. The only legitimate time use is inside the SSE
  relay's fallback timestamp, which exists because the wire format has a
  timestamp field — the client ignores it.
- **Tests.** `rk4_is_deterministic` runs the engine twice and asserts deep
  equality; the oracle tests assert identical plans for identical prompts.
- **Cross-language parity.** The Rust crate's tests reproduce the same
  anchors (UN WPP 73.8 → 81.7) and the same gene-drive dynamics as the
  TypeScript originals.
- **e2e.** The Playwright suite asks the Oracle and asserts the same six
  phases appear for the same prompt.

## Reproducing a run

The Century Engine embeds its full provenance in the run: seed, enabled
interventions, scenario, and every world state per quarter-year. To replay
someone else's run you need only their seed — the state vectors *are* the
replay. The time machine exposes exactly this: any year is a coordinate you
can return to, fork, and compare.
