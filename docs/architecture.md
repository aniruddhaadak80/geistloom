# Geistloom architecture

```
                    ┌────────────────────────────────────────────┐
                    │                 apps/web                   │
                    │  Next.js 15 · React 19 · Tailwind v4       │
                    │  ┌────────┐ ┌──────────┐ ┌──────────────┐  │
                    │  │ AppShell│ │ 13 routes│ │ API routes   │  │
                    │  │ cmdk    │ │ + 4 SSG  │ │ oracle       │  │
                    │  │ palette │ │ explorer │ │ century      │  │
                    │  └────────┘ │ families │ │ gene-drive   │  │
                    │             └──────────┘ │ stream (SSE) │  │
                    └────────────┬─────────────┴──────┬────────┘
                                 │ imports            │ fetches
              ┌──────────────────┼─────────────────────┼───────────────┐
              ▼                  ▼                     ▼               ▼
    ┌──────────────────┐ ┌──────────────┐ ┌────────────────────┐ ┌──────────────┐
    │ packages/core    │ │ packages/ui  │ │ packages/sdk       │ │ services/    │
    │ TypeScript       │ │ React        │ │ zod contracts +    │ │ oracle       │
    │ domain + engines │ │ primitives   │ │ typed fetch client │ │ (FastAPI)    │
    │ · 12 hallmarks   │ │ + generated  │ │ same wire format   │ │ mirrors      │
    │ · 32 measures    │ │ chart kit    │ │ both ends          │ │ OracleBrain  │
    │ · 8 clocks       │ └──────────────┘ └──────────────────────┘ └──────────────┘
    │ · Oracle FSM     │        ▲                  ▲
    │ · RK4 world      │        │ writes            │ reads
    └────────┬─────────┘        │                  │
             │            ┌──────────────┐   ┌───────────────┐
             │            │ packages/ui/ │   │ apps/web/     │
             │            │ src/generated│   │ i18n/locales  │
             │            │ (29 comps)   │   │ (12 locales)  │
             │            └──────────────┘   └───────────────┘
             │ seed 4093
    ┌────────┴─────────┐   ┌──────────────────┐   ┌────────────────────┐
    │ crates/          │   │ services/relay   │   │ packages/seed      │
    │ loom-engine      │   │ Go, zero deps    │   │ seed 4093 → JSON   │
    │ Rust mirror of   │   │ SSE hub + replay │   │ world datasets     │
    │ engines (wasm)   │   └──────────────────┘   └────────────────────┘
    └──────────────────┘
```

Three rules hold the frame together:

1. **One brain, three languages.** Every numeric engine exists in TypeScript
   (`packages/core`), Rust (`crates/loom-engine`), and Python
   (`services/oracle/brain.py`). They are line-by-line ports of the same
   recursions, so a run started in the browser can be replayed by the Rust
   service or audited by a Python script with identical results.

2. **Seeds, never entropy.** Every "random" number in the system comes from
   `mulberry32(4093)` (or a seed derived deterministically from a prompt via
   FNV-1a). `Math.random`, `Date.now`, and `performance.now` are banned from
   simulation code by lint convention and by the gate suite.

3. **Data before render.** Domain facts (hallmarks, interventions, clocks,
   scenarios) are typed TypeScript modules. The API layer is a thin zod
   contract over those modules; the UI never computes world state that the
   engines did not produce.

## The request lifecycle

```
ask "solve aging" → prompt seed (FNV-1a of the prompt) → OracleBrain FSM
   perceive → synthesize → decompose → plan → research → reflect
   → six-phase plan + reasoning DAG + citations
   → POST /api/oracle → plan JSON → PhaseAccordion / ReasoningDag / Citations
```

The Century Engine path is the same shape with more state:

```
pick interventions + scenario + seed → simulateCentury()
  800 RK4-ish steps/year × 200 years → WorldState[]
  → summary (gain, LEV, peak population) → charts + time machine
  → fork any state → new run → compare worlds side by side
```

## Where things live

| Path | What lives there |
| --- | --- |
| `packages/core/src/domain` | hallmarks, interventions, epigenetic clocks, scenarios, history |
| `packages/core/src/engine` | century engine, gene drive, effective aging rate |
| `packages/core/src/agents` | Oracle plan builder + brain FSM |
| `packages/ui` | primitives (`Card`, `Badge`, `LineChart`) + generated chart kit |
| `packages/sdk` | zod contracts (`OraclePlanSchema`, `WorldStateSchema`) and client |
| `apps/web/app` | 13 routes + `/api/*` handlers + `/og` SVG social card |
| `apps/web/components` | route-level consoles (oracle, century, worldboard, …) |
| `apps/web/i18n` | 12 generated locales with identical key sets |
| `crates/loom-engine` | Rust mirrors of both engines |
| `services/oracle` | FastAPI mirror of the Oracle brain |
| `services/relay` | Go SSE relay for the Worldboard stream |
| `scripts/generators` | the scale engine — regenerates explorer routes, components, docs, locales |

Further reading: [`docs/engine/`](engine/), [`docs/api/`](api/),
[`docs/guides/`](guides/), and [`docs/scale-engine.md`](scale-engine.md).
