<!--
name: Geistloom
description: The world-frame where superintelligence solves aging — and everything else.
topics: longevity, aging, superintelligence, world-models, deterministic-simulation, bioinformatics, next.js, rust, wasm
license: MIT
-->

<p align="center">
  <img src="apps/web/public/images/banner.svg" alt="Geistloom — the world-frame where superintelligence solves aging" />
</p>

<h1 align="center">Geistloom</h1>

<p align="center">
  <em>the world-frame where superintelligence solves aging — and everything else.</em>
</p>

<p align="center">
  <a href="https://geistloom.vercel.app/actions/workflows/ci.yml"><img src="https://img.shields.io/badge/ci-turbo%20%7E%20green-2dd4bf" alt="build" /></a>
  <img src="https://img.shields.io/badge/license-MIT-8b5cf6" alt="license" />
  <img src="https://img.shields.io/badge/loc-1.0M%2B%20target-f59e0b" alt="loc" />
  <a href="https://geistloom.vercel.app"><img src="https://img.shields.io/badge/demo-live-2dd4bf" alt="live demo" /></a>
</p>

<p align="center">
  <a href="https://geistloom.vercel.app"><strong>Try the live demo →</strong></a>
</p>

---

## What is Geistloom?

Geistloom is a frame for the biotech century: a single, deterministic surface where a superintelligence can be asked to solve aging — and every other hard problem — and where every step of its reasoning is inspectable. The premise is that superintelligence is not a chatbot but a research program, and a research program needs a world to be reasoned about. The frame is that world.

At the center sits **the Oracle** — a deterministic, zero-API-key reasoning engine. There is no LLM call by default: the Oracle is a six-state finite machine over a curated knowledge graph (12 hallmarks, 32 interventions, 8 epigenetic clocks, 6 scenarios), scored with a seeded PRNG. Ask it "solve aging" and it returns a six-phase research plan with a reasoning DAG you can walk line by line. Same prompt, same seed, byte-identical plan — forever, on your machine, auditable by anyone.

Around it, the **Century Engine** propagates 200 years of civilization as a function of biotechnology: a coupled system over population, life expectancy, healthspan, biosphere health, GDP per capita, AI capability and knowledge stock, anchored to the UN WPP baseline (life expectancy 73.8 y in 2026 → 81.7 y in 2100), driven by the 12 hallmarks as model inputs and the 32-intervention adoption atlas. The **time machine** makes every year a coordinate: scrub to 2075, read the exact world state, fork it, replay it, compare worlds side by side.

It exists because aging is an engineering problem — the biology is measured, the intervention classes are known, the clocks exist — and what is missing is a frame where the research is computable and auditable. Geistloom is that frame: a place where the question "what would it take?" has a reproducible answer.

## What you can do with it

| I want to… | Open | Get |
| --- | --- | --- |
| ask a superintelligence to solve a problem | [`/oracle`](apps/web/app) | a six-phase research plan with an explorable reasoning DAG |
| simulate 200 years of civilization | [`/century`](apps/web/app) | life-expectancy curves under 32 interventions, RK4-propagated |
| visit any year between 2026 and 2226 | [`/time-machine`](apps/web/app) | the exact world state at that year — forkable, replayable |
| watch the world move | [`/worldboard`](apps/web/app) | live SSE metrics streamed from the Go relay |
| study the biology of aging | [`/hallmarks`](apps/web/app) | 12 hallmarks with mechanisms, measurements, intervention links |
| pick a yardstick for biological age | [`/clocks`](apps/web/app) | 8 epigenetic clocks with real CpG counts and training sets |
| engineer a gene drive | [`/gene-drive`](apps/web/app) | wild/drive/resistant allele-frequency curves over 60 generations |
| weigh the futures | [`/scenarios`](apps/web/app) | six scenario priors, each with its engine shifts |
| design a construct before synthesizing | [`/lab`](apps/web/app) | a simulation of the construct in the engine |
| browse past runs | [`/archive`](apps/web/app) | every seed, every state, replayable byte-identically |
| see the frame itself | [`/`](apps/web/app) | the landing — the promise, the surfaces, the seed |
| share a world | [`/og`](apps/web/app/og) | a deterministic social card for any world state |

## Quickstart

```powershell
git clone https://github.com/aniruddhaadak/geistloom.git
cd geistloom
bun install
bun run dev
```

Docker, if you prefer:

```powershell
docker compose up
```

Zero keys, zero config: no API keys, no database provisioning, no network calls. The Oracle is a local finite state machine; the Century Engine is pure functions over committed seed data.

## How it works

1. **Land on the frame** — the banner, the mark, the promise: one world, reasoned about deterministically.
2. **Consult the Oracle** — type `solve aging` on `/oracle`; the FSM classifies the domain and scores the knowledge graph.
3. **Read the reasoning** — six phases assemble with confidence bars; every phase opens into its reasoning steps and the DAG.
4. **Configure the Century Engine** — on `/century`, enable interventions (senolytics, rapalogs, OSK reprogramming…) and watch 200 years re-propagate.
5. **Scrub the time machine** — every year from 2026 to 2226 is a coordinate; read the world state at 2075 down to the decimal.
6. **Fork a world** — fork the run at any year; the fork inherits the exact state and diverges under a new intervention set.
7. **Read the ethics** — the scenario priors (Bio-Dividend, Divided World, Misalignment Shadow…) price every trajectory.
8. **Share the seed** — a world is a seed number; share it and the recipient replays the identical universe.

## Architecture

Thirteen diagrams, sources committed in [`docs/diagrams/`](docs/diagrams) as `.mmd` files.

**01 — System architecture:** the observer's browser, the web app, the pure core, the polyglot services, and the offline seed — one picture of the whole frame.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#0b111c',
  'primaryTextColor': '#e8f1f2',
  'primaryBorderColor': '#2dd4bf',
  'lineColor': '#2dd4bf',
  'secondaryColor': '#101826',
  'tertiaryColor': '#8b5cf6',
  'fontFamily': 'JetBrains Mono, monospace'
}}}%%
flowchart LR
  subgraph USER["The Observer"]
    BROWSER[Browser · the frame]
  end
  subgraph WEB["apps/web — Next.js 15"]
    LANDING[Landing]
    ORACLE_ROUTE[/oracle]
    CENTURY_ROUTE[/century]
    WORLDBOARD[/worldboard]
    OG[/og image route]
  end
  subgraph CORE["packages/core — pure domain logic"]
    ORACLE_BRAIN[Oracle FSM brain]
    CENTURY_ENG[Century Engine RK4]
    GENE_DRIVE[Gene-drive recursion]
    DOMAIN[Hallmarks · Interventions · Clocks]
  end
  subgraph POLYGLOT["Polyglot services"]
    PY[Python FastAPI · Oracle service :8787]
    RS[Rust wasm · loom-engine]
    GO[Go relay · SSE :9119]
  end
  subgraph DATA["packages/seed — offline datasets"]
    SEED[(seed 4093 JSON worlds)]
  end

  BROWSER --> LANDING
  BROWSER --> ORACLE_ROUTE
  BROWSER --> CENTURY_ROUTE
  BROWSER --> WORLDBOARD
  ORACLE_ROUTE --> ORACLE_BRAIN
  CENTURY_ROUTE --> CENTURY_ENG
  WORLDBOARD --> GO
  ORACLE_BRAIN --> DOMAIN
  CENTURY_ENG --> DOMAIN
  CENTURY_ENG --> GENE_DRIVE
  ORACLE_ROUTE -. optional .-> PY
  CENTURY_ENG -. heavy compute .-> RS
  SEED --> ORACLE_BRAIN
  SEED --> CENTURY_ENG
  GO --> BROWSER
  OG --> CORE
```

**02 — Oracle request flow:** a prompt becomes a six-phase plan through a deterministic FSM cycle — same prompt + seed ⇒ byte-identical plan.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#0b111c',
  'primaryTextColor': '#e8f1f2',
  'primaryBorderColor': '#8b5cf6',
  'lineColor': '#2dd4bf',
  'signalColor': '#f59e0b',
  'actorBkg': '#101826',
  'actorBorder': '#2dd4bf',
  'actorTextColor': '#e8f1f2',
  'noteBkgColor': '#0b111c',
  'noteTextColor': '#8fa3b8',
  'noteBorderColor': '#8b5cf6',
  'fontFamily': 'JetBrains Mono, monospace'
}}}%%
sequenceDiagram
  autonumber
  actor U as Observer
  participant UI as Oracle page
  participant API as /api/oracle route
  participant CORE as @geistloom/core
  participant BRAIN as OracleBrain FSM
  participant KG as Knowledge graph

  U->>UI: prompt "solve aging"
  UI->>API: POST {prompt, seed?}
  API->>CORE: askOracle(query)
  CORE->>BRAIN: new OracleBrain(seed, focus)
  loop 6-state FSM cycle
    BRAIN->>BRAIN: score all nodes (utility fn)
    BRAIN->>KG: read hallmark/intervention/clock nodes
    KG-->>BRAIN: node + utilityBias
    BRAIN-->>BRAIN: pick argmax + seeded bell noise
    BRAIN->>BRAIN: emit BrainTrace line
  end
  CORE->>CORE: assemble 6 phases + reasoning DAG
  CORE-->>API: OraclePlan (zod-validated)
  API-->>UI: JSON plan
  UI->>U: phased plan + explorable reasoning traces
  Note over U,KG: deterministic — same prompt+seed ⇒ byte-identical plan
```

**03 — Domain model:** the entities of the frame — hallmarks, interventions, clocks, world states, scenarios, events, milestones, plans — and how they relate.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#0b111c',
  'primaryTextColor': '#e8f1f2',
  'primaryBorderColor': '#2dd4bf',
  'lineColor': '#8b5cf6',
  'fontFamily': 'JetBrains Mono, monospace'
}}}%%
erDiagram
  HALLMARK ||--o{ INTERVENTION : "targeted_by"
  HALLMARK ||--o{ CLOCK : "measured_by"
  INTERVENTION ||--o{ WORLD_STATE : "shifts"
  SCENARIO ||--o{ SIMULATION : "parameterizes"
  SIMULATION ||--o{ WORLD_STATE : "emits"
  WORLD_STATE ||--o{ EVENT : "streamed_as"
  MILESTONE }o--|| TIMELINE : "anchors"
  ORACLE_PLAN ||--o{ PLAN_PHASE : "contains"
  PLAN_PHASE ||--o{ REASONING_STEP : "justified_by"

  HALLMARK {
    string id PK
    string name
    string category
    string layer
    string mechanism
    string measuredBy
  }
  INTERVENTION {
    string id PK
    string name
    string klass
    string evidence
    float agingRateReduction
    int adoptionYear
    float adoptionSpeed
    float riskMultiplier
  }
  CLOCK {
    string id PK
    string name
    int year
    string generation
    int cpgSites
    int trainingSamples
  }
  WORLD_STATE {
    float year
    float population
    float lifeExpectancy
    float healthspan
    float agingRate
    float biosphereHealth
    float gdpPerCapita
    float aiCapability
    float knowledgeStock
    float interventionCoverage
  }
  SCENARIO {
    string id PK
    string name
    float weight
    float knowledgeMultiplier
    float adoptionSpeedMultiplier
  }
  SIMULATION {
    int seed PK
    string scenarioId FK
    string[] interventionIds
    float startYear
    float endYear
  }
  EVENT {
    string runId
    float year
    float lifeExpectancy
    float population
    float biosphereHealth
    datetime at
  }
  MILESTONE {
    string id PK
    int year
    string title
    string kind
    float confidence
  }
  ORACLE_PLAN {
    string id PK
    string prompt
    string domain
    int seed
    string model
  }
  PLAN_PHASE {
    string id PK
    string name
    int years
    float confidence
  }
  REASONING_STEP {
    string id PK
    string label
    string rationale
    float confidence
  }
```

**04 — Agent lifecycle:** the Oracle's six brain states — perceive, decompose, research, synthesize, plan, reflect — and what wins in each.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#0b111c',
  'primaryTextColor': '#e8f1f2',
  'primaryBorderColor': '#2dd4bf',
  'lineColor': '#2dd4bf',
  'fontFamily': 'JetBrains Mono, monospace'
}}}%%
stateDiagram-v2
  [*] --> perceive
  perceive --> decompose : vocabulary matched
  decompose --> research : causal layers split
  research --> synthesize : measurement stack pulled
  synthesize --> plan : hypothesis fused
  plan --> reflect : phases sequenced
  reflect --> perceive : audit pass complete
  reflect --> [*] : trace committed

  note right of perceive
    Scores every knowledge node
    with state-dependent utility:
    perceive prizes data & world
  end note
  note right of decompose
    Hallmarks win here:
    which node sits at the top
    of the causal graph?
  end note
  note right of research
    Clocks win here: what would
    a reversal look like in data?
  end note
  note right of synthesize
    Interventions win: mechanism
    + measurement → hypothesis
  end note
  note right of plan
    Interventions win: years,
    confidence, failure prices
  end note
  note left of reflect
    The audit pass: is every
    edge in the DAG checkable?
    The reasoning is the product.
  end note
```

**05 — CI/CD deploy:** every push runs seven gates across five toolchains; green builds deploy to Vercel, tags cut releases.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#0b111c',
  'primaryTextColor': '#e8f1f2',
  'primaryBorderColor': '#2dd4bf',
  'lineColor': '#2dd4bf',
  'fontFamily': 'JetBrains Mono, monospace'
}}}%%
flowchart LR
  DEV[Developer pushes] --> GH[GitHub]
  GH --> CI{{CI workflow}}
  CI --> G1[typecheck]
  CI --> G2[biome lint]
  CI --> G3[vitest unit]
  CI --> G4[cargo test]
  CI --> G5[pytest]
  CI --> G6[go test]
  CI --> G7[loc guardrail]
  G1 --> ALL{all gates green?}
  G2 --> ALL
  G3 --> ALL
  G4 --> ALL
  G5 --> ALL
  G6 --> ALL
  G7 --> ALL
  ALL -->|no| FAIL[red check · block merge]
  ALL -->|yes| E2E[Playwright e2e]
  E2E --> BUILD[next build]
  BUILD -->|main| VERCEL[Vercel auto-deploy --prod]
  BUILD -->|tag v*| RELEASE[GitHub Release]
  VERCEL --> LIVE[(live URL)]
  LIVE --> SOCIAL[og:image + social preview]
  FAIL --> DEV
```

**06 — User journey:** the first five minutes in Geistloom, from the landing to a shared seed.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#0b111c',
  'primaryTextColor': '#e8f1f2',
  'primaryBorderColor': '#8b5cf6',
  'lineColor': '#2dd4bf',
  'taskBkgColor': '#101826',
  'taskTextColor': '#e8f1f2',
  'taskBorderColor': '#2dd4bf',
  'taskDoneBkgColor': '#14b8a6',
  'taskActiveBkgColor': '#8b5cf6',
  'sectionBkgColor': '#0b111c',
  'sectionTextColor': '#e8f1f2',
  'fontFamily': 'JetBrains Mono, monospace'
}}}%%
journey
  title First five minutes in Geistloom
  section Landing
    Read the promise: 5: Observer
    Click "Ask the Oracle": 5: Observer
  section Oracle
    Type "solve aging": 4: Observer
    Watch six phases assemble: 5: Observer
    Open a reasoning trace: 5: Observer
    Ask "wait, why that order?": 4: Observer
  section Century Engine
    Enable senolytics + reprogramming: 5: Observer
    Scrub to 2075: 5: Observer
    Notice escape velocity: 5: Observer
    Fork the run at 2075: 4: Observer
  section Time machine
    Return to 2026: 5: Observer
    Compare with the fork: 5: Observer
    Share the seed: 5: Observer
```

**07 — Feature mindmap:** everything the frame contains, from the Oracle to the polyglot tier.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#0b111c',
  'primaryTextColor': '#e8f1f2',
  'primaryBorderColor': '#2dd4bf',
  'lineColor': '#2dd4bf',
  'fontFamily': 'JetBrains Mono, monospace'
}}}%%
mindmap
  root((Geistloom))
    The Oracle
      Deterministic FSM brain
      Six-phase research plans
      Reasoning DAG explorer
      Key numbers + citations
      Zero API keys
    Century Engine
      200-year simulation
      12 hallmarks as model inputs
      32-intervention adoption curves
      UN WPP baseline anchors
      Escape-velocity detection
    Time Machine
      Every year is a coordinate
      Fork any state
      Replay any run
      Compare worlds side by side
    Gene Drive Lab
      Wild/drive/resistant alleles
      Homing efficiency + resistance
      Fitness cost curves
      Containment horizons
    Hallmarks Atlas
      12 hallmarks of aging
      Mechanism + measurement
      Intervention links
    Epigenetic Clocks
      Horvath → GrimAge → DunedinPACE
      CpG counts + training sets
      Pace-of-aging endpoints
    Scenarios
      Bio-Dividend
      Escape Velocity 2035
      Post-Scarcity Biology
      Long Stagnation
      Divided World
      Misalignment Shadow
    Polyglot frame
      Next.js 15 + React 19
      Python FastAPI Oracle
      Rust wasm loom-engine
      Go SSE relay
```

**08 — Branching strategy:** trunk-based with feature branches, merged through `develop` to `main`, tagged releases.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#0b111c',
  'primaryTextColor': '#e8f1f2',
  'primaryBorderColor': '#2dd4bf',
  'lineColor': '#2dd4bf',
  'fontFamily': 'JetBrains Mono, monospace'
}}}%%
gitGraph
  commit id: "feat: seed the frame"
  branch develop
  checkout develop
  commit id: "feat: oracle FSM brain"
  commit id: "feat: century engine"
  branch feat/time-machine
  checkout feat/time-machine
  commit id: "feat: fork any state"
  commit id: "fix: replay determinism"
  checkout develop
  merge feat/time-machine
  branch feat/gene-drive-lab
  checkout feat/gene-drive-lab
  commit id: "feat: three-allele recursion"
  checkout develop
  merge feat/gene-drive-lab
  commit id: "chore: scale engine pass"
  checkout main
  merge develop
  commit id: "release: v0.1.0" tag: "v0.1.0"
```

**09 — Roadmap:** the frame expands in four waves, v0.1 through v1.0, ending in an opt-in real-LLM plug-in and a community worlds marketplace.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#0b111c',
  'primaryTextColor': '#e8f1f2',
  'primaryBorderColor': '#2dd4bf',
  'lineColor': '#2dd4bf',
  'taskBkgColor': '#101826',
  'taskTextColor': '#e8f1f2',
  'taskBorderColor': '#2dd4bf',
  'taskDoneBkgColor': '#14b8a6',
  'taskActiveBkgColor': '#8b5cf6',
  'critBkgColor': '#f59e0b',
  'sectionBkgColor': '#0b111c',
  'sectionTextColor': '#e8f1f2',
  'fontFamily': 'JetBrains Mono, monospace'
}}}%%
gantt
  title Geistloom roadmap — the frame expands
  dateFormat YYYY-MM
  axisFormat %Y-%m
  section Frame v0.1
    Oracle + reasoning DAG        :done,    v011, 2026-10, 2026-11
    Century Engine + time machine :done,    v012, 2026-10, 2026-11
    Hallmarks + clocks atlases    :done,    v013, 2026-10, 2026-11
    Gene-drive lab                :active,  v014, 2026-11, 2026-12
  section Frame v0.2
    Ethics sandbox (value curves) :         v021, 2026-12, 2027-02
    Archive library + i18n        :         v022, 2027-01, 2027-03
    Construct simulator (/lab)    :         v023, 2027-02, 2027-04
  section Frame v0.3
    Multi-run comparison matrix   :         v031, 2027-04, 2027-06
    Plugin API for world models   :         v032, 2027-05, 2027-08
    Mobile shell (PWA)            :         v033, 2027-07, 2027-09
  section Frame v1.0
    Real-LLM plug-in (opt-in)     :         v101, 2027-09, 2027-12
    Community worlds marketplace  :         v102, 2027-11, 2028-03
```

**10 — Class model:** the engines and the plans they emit — `OracleBrain`, `CenturyEngine`, `GeneDriveEngine`, and the data they produce.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#0b111c',
  'primaryTextColor': '#e8f1f2',
  'primaryBorderColor': '#2dd4bf',
  'lineColor': '#8b5cf6',
  'fontFamily': 'JetBrains Mono, monospace'
}}}%%
classDiagram
  class OracleBrain {
    -state: BrainState
    -rng: () => number
    -graph: KnowledgeNode[]
    +currentState: BrainState
    +step(): BrainTrace
    +runCycle(): BrainTrace[]
    +run(cycles: number): BrainTrace[]
  }
  class BrainState {
    <<enumeration>>
    perceive
    decompose
    research
    synthesize
    plan
    reflect
  }
  class KnowledgeNode {
    +id: string
    +label: string
    +kind: NodeKind
    +utilityBias: number
  }
  class BrainTrace {
    +step: number
    +state: BrainState
    +thought: string
    +nodeId: string
    +utilityScore: number
  }
  class Oracle {
    +askOracle(query: OracleQuery): OraclePlan
    +askOracleAllScenarios(prompt: string): OraclePlan[]
  }
  class OraclePlan {
    +id: string
    +prompt: string
    +domain: string
    +title: string
    +summary: string
    +phases: PlanPhase[]
    +reasoningDag: Dag
    +keyNumbers: KeyNumber[]
    +citations: string[]
    +scenario: string
    +seed: number
    +model: string
  }
  class PlanPhase {
    +id: string
    +name: string
    +years: number
    +description: string
    +milestone: string
    +confidence: number
    +reasoning: ReasoningStep[]
  }
  class CenturyEngine {
    +simulateCentury(config: EngineConfig): SimulationResult
    +stateAt(states: WorldState[], year: number): WorldState
    +forkFrom(from: WorldState, config): SimulationResult
    +baselineLifeExpectancy(year: number): number
  }
  class GeneDriveEngine {
    +simulateGeneDrive(params): GeneDriveState[]
    +timeToFrequency(params, threshold): number
    +resistanceTakeover(params): number
  }
  Oracle --> OraclePlan
  Oracle --> OracleBrain : drives
  OracleBrain --> BrainState
  OracleBrain --> KnowledgeNode
  OracleBrain --> BrainTrace
  OraclePlan --> PlanPhase
  CenturyEngine --> WorldState
  GeneDriveEngine --> AlleleFrequencies
```

**11 — Intervention quadrant:** the 32-intervention landscape plotted by readiness vs. leverage — what to ship now, what to bet big on, what to watch.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#0b111c',
  'primaryTextColor': '#e8f1f2',
  'primaryBorderColor': '#2dd4bf',
  'lineColor': '#2dd4bf',
  'fontFamily': 'JetBrains Mono, monospace'
}}}%%
quadrantChart
  title Intervention landscape — leverage vs. readiness
  x-axis Low readiness --> High readiness
  y-axis Low leverage --> High leverage
  quadrant-1 Ship it now
  quadrant-2 Bet big, build fast
  quadrant-3 Watch and wait
  quadrant-4 Strategic patience
  "Metformin": [0.78, 0.18]
  "NAD+ precursors": [0.72, 0.15]
  "Rapalogs": [0.68, 0.42]
  "Senolytics D+Q": [0.62, 0.55]
  "Fisetin": [0.66, 0.38]
  "Mitophagy boosters": [0.60, 0.30]
  "Autophagy enhancers": [0.58, 0.35]
  "Plasma exchange": [0.52, 0.33]
  "Stem cell therapies": [0.48, 0.50]
  "Base editing": [0.45, 0.52]
  "Prime editing": [0.40, 0.58]
  "Telomerase therapy": [0.35, 0.62]
  "Partial reprogramming": [0.28, 0.88]
  "Epigenetic editing": [0.22, 0.70]
  "SIRT6 activators": [0.20, 0.40]
  "Niche rejuvenation": [0.25, 0.45]
  "Hyper-long telomeres": [0.18, 0.55]
  "GDF11 modulators": [0.15, 0.30]
  "CRISPR-Cas13 RNA editing": [0.14, 0.50]
```

**12 — Infrastructure:** edge, container, self-hosted polyglot tier, offline data, and observability — every service exposes `/healthz`.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#0b111c',
  'primaryTextColor': '#e8f1f2',
  'primaryBorderColor': '#2dd4bf',
  'lineColor': '#2dd4bf',
  'fontFamily': 'JetBrains Mono, monospace'
}}}%%
flowchart TB
  subgraph EDGE["Edge — the observer's browser"]
    UI[Next.js static shell]
    OG[Dynamic og:image]
  end
  subgraph VERCEL["Vercel / Docker / Fly / Render"]
    WEB[web container :3000]
    NEXT_API[Route handlers]
  end
  subgraph SELF_HOST["Self-hosted polyglot tier"]
    ORACLE[oracle :8787 FastAPI]
    RELAY[relay :9119 Go SSE]
    RUST[loom-engine wasm]
  end
  subgraph DATA["Offline data tier"]
    SEED[(packages/seed<br/>seed 4093)]
  end
  subgraph OPS["Observability"]
    LOGS[structured logs]
    TRACES[OTel stubs]
    HEALTH[/healthz on every service]
  end

  UI --> WEB
  OG --> WEB
  WEB --> NEXT_API
  NEXT_API --> CORE[@geistloom/core]
  NEXT_API -. optional .-> ORACLE
  NEXT_API --> RUST
  RELAY --> UI
  SEED --> CORE
  SEED --> ORACLE
  WEB --> LOGS
  ORACLE --> LOGS
  RELAY --> LOGS
  CORE --> TRACES
  WEB --> HEALTH
  ORACLE --> HEALTH
  RELAY --> HEALTH
```

**13 — Hallmark cascade:** the 12 hallmarks in three tiers, the intervention classes that answer them, the yardsticks that measure them, and the frame that ties it together.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#0b111c',
  'primaryTextColor': '#e8f1f2',
  'primaryBorderColor': '#f59e0b',
  'lineColor': '#2dd4bf',
  'fontFamily': 'JetBrains Mono, monospace'
}}}%%
flowchart TD
  subgraph BIO["The biology — 12 hallmarks, three tiers"]
    direction TB
    P1[Genomic instability]
    P2[Telomere attrition]
    P3[Epigenetic alterations]
    P4[Loss of proteostasis]
    P5[Disabled macroautophagy]
    P6[Deregulated nutrient sensing]
    P7[Mitochondrial dysfunction]
    A1[Cellular senescence]
    A2[Stem cell exhaustion]
    I1[Altered intercellular communication]
    I2[Chronic inflammation]
    I3[Dysbiosis]
  end
  subgraph RESPONSE["The response — intervention classes"]
    G[Gene editing: base · prime · epigenetic]
    T[Gene therapy: OSK · TERT]
    S[Small molecules: senolytics · rapalogs · NAD+]
    C[Cell & protocol: stem cells · FMT · TPE]
  end
  subgraph MEASURE["The yardsticks"]
    CK[Epigenetic clocks: Horvath → GrimAge → DunedinPACE]
    LE[Life expectancy: UN WPP 73.8 → 81.7]
  end
  subgraph FRAME["The frame"]
    OR[Oracle: plans the research]
    CE[Century Engine: propagates 200 years]
    TM[Time machine: replays every state]
  end

  P1 & P2 & P3 --> G
  P3 --> T
  P4 & P5 & P6 & P7 --> S
  A1 --> S
  A2 --> C
  I1 & I2 & I3 --> S
  S --> CK
  G --> CK
  T --> CK
  CK --> LE
  OR --> CE
  CE --> TM
  LE --> CE
```

## The polyglot frame

Four toolchains, each earning its place — and each optional at runtime, because `packages/core` works alone.

| Layer | Stack | Where |
| --- | --- | --- |
| web | Next.js 15 · React 19 · TypeScript strict | [`apps/web`](apps/web) |
| Oracle service | Python 3.12 · FastAPI | [`services/oracle`](services/oracle) |
| compute engine | Rust → wasm | [`crates/loom-engine`](crates/loom-engine) |
| telemetry relay | Go · SSE | [`services/relay`](services/relay) |

## The scale engine

The repo is driven past 1,000,000 lines by a scale engine, not by hand. The seed dataset is the floor:

| Package | Lines |
| --- | --- |
| `packages/seed` | 4093 |
| …and every other package | regenerate with `bun scripts/generate.ts` |

Run `bun run loc` to count, `bun scripts/generate.ts` to regenerate. The full mechanism is documented in [docs/scale-engine.md](docs/scale-engine.md).

## Documentation map

| Path | What lives there |
| --- | --- |
| [`docs/`](docs) | guides, the scale engine, the documentation spine |
| [`docs/adr/`](docs/adr) | eight architecture decision records |
| [`docs/diagrams/`](docs/diagrams) | the 13 mermaid sources (`.mmd`) embedded above |
| [`docs/api/`](docs/api) | route and engine API reference |
| [`docs/engine/`](docs/engine) | the Century Engine math, in full |
| [`docs/guides/`](docs/guides) | recipes: forking a world, adding an intervention, wiring a service |

## Contributing

PRs are welcome — the frame is young and the good-first-issue queue is the front door. Read [`CONTRIBUTING.md`](CONTRIBUTING.md), pick a [good first issue](https://github.com/aniruddhaadak/geistloom/labels/good%20first%20issue), and keep the rules that matter: deterministic code, pure domain logic in `packages/core`, and every claim shipped with a diagram or a command.

## License

MIT © Aniruddha Adak — see [`LICENSE`](LICENSE).
