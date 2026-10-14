# Engine: The Century Engine

The Century Engine is a coupled, saturating dynamical system over eight world
variables, integrated at a configurable step (default: quarterly, 200 years).
It is deterministic, allocation-honest, and mirrored in Rust and Python.

## Variables

| Variable | Range | Dynamics |
| --- | --- | --- |
| `lifeExpectancy` | 0 … 160 | converges to the UN WPP anchor plus intervention lift |
| `healthspan` | ≤ LE | converges to a coverage-weighted fraction of LE |
| `agingRate` | 0.15 … 1 | sum of intervention reductions, saturating at 85% |
| `population` | 0.1 … 40 B | births (falling with LE) minus deaths (rising with LE) |
| `biosphereHealth` | 2 … 100 | knowledge-driven restoration minus growth pressure |
| `gdpPerCapita` | 1 … 400k | AI and health compound growth |
| `aiCapability` | 0 … 100 | logistic climb at 2.8%/yr (scenario-scaled) |
| `knowledgeStock` | 0 … 1 | research compounding, accelerated by AI |

## The three load-bearing formulas

**Baseline anchor (UN WPP):**

```
baselineLifeExpectancy(year) = 73.8 + 7.9·smoothstep(2026→2100) + 4.0·smoothstep(2100→2200)
```

**Intervention lift (the whole premise of the product):**

```
lift(Σ interventions) = Σ agingRateReductionᵢ · coverageᵢ(year) · knowledgeGate · 22
```

with `knowledgeGate = min(1, 2.2·knowledgeStock)` — biology you cannot yet
operate does not count. This is why early runs look boring: the atlas is
real, and real adoption is slow.

**Demographic transition:**

```
birthRate   = clamp(0.024 − 0.0006·(lifeExpectancy − 65), 0.003, 0.03)
deathRate   = 1 / (lifeExpectancy · 1.08)
netGrowth   = birthRate − deathRate
population *= (1 + netGrowth·dt)
```

The steep birth-rate slope reproduces the real transition: a baseline world
peaks near 10.4B, and a treated world *declines* once longevity removes the
quantity-of-children pressure — an inversion the original 0.00018 slope never
produced. That calibration lives in the tests.

## Escape velocity

Longevity escape velocity is *detected*, never assumed: the engine scans for
the first year where the quarterly LE gain exceeds one full year per year.
With a serious intervention stack it lands in the 2040s; with none, never.

## Forking and replay

Every `WorldState` is a complete description of the world at its timestamp.
`forkFrom(state, config)` restarts the engine from that exact state with new
parameters — the fork diverges from a shared provenance, and both branches can
be compared in the UI. The Rust crate's `integrate` reproduces the same
trajectory to float precision; the tests assert the same anchors.

## Honest limits

- It is not a climate model, not a war model, and not an economy. GDP is a
  compounding exponent; biosphere health is a knowledge proxy.
- Adoption curves are S-curves, not sociology.
- Extremes: runs beyond 160 life expectancy or 40B population are clamped, and
  the summary reports the clamp (see `endState`).

Everything here is open to argument in Pull Requests — that is the point of
keeping the formulas in code rather than prose.
