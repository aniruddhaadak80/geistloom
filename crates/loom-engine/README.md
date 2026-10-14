# geistloom-loom-engine

The Rust century engine — deterministic world dynamics and
gene-drive population genetics, compiled to WebAssembly for
the browser and usable as a plain crate for CI.

## What it does

- **RK4 integrator** for the Century Engine's coupled ODE system:
  life expectancy, knowledge stock, AI capability, population,
  biosphere health. The baseline reproduces the UN WPP anchors
  (73.8y in 2026 → 81.7y in 2100) by construction.
- **Three-allele gene-drive recursion** (wild / drive / resistant)
  with homing efficiency, resistance emergence, and fitness costs —
  the standard model from the gene-drive literature.
- `years_to_escape_velocity` — the first year where the annual
  life-expectancy gain exceeds 1.0 year (LEV detection).

## Build & test

```powershell
cd crates/loom-engine
cargo test
```

## wasm build (optional)

```powershell
cargo build --target wasm32-unknown-unknown --release
```

The crate is `cdylib + rlib`, so the same code serves the web
build (via `wasm-bindgen`) and the Rust test suite. The web app
currently uses the TypeScript mirror in `packages/core` for the
demo; the Rust engine exists to make the heavy-lift claim honest
and to give the polyglot story a real compute core.

## Determinism

No threads, no clocks, no RNG: every function is pure. The same
input state always produces the same output — the frame's
foundational promise.
