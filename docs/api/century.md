# API: The Century Engine

```
POST /api/century/simulate
Content-Type: application/json
```

## Request

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `seed` | integer | 4093 | drives the no-information bell noise only |
| `enabledInterventionIds` | string[] | `[]` | intervention ids from the atlas (32 today) |
| `scenarioId` | string | none | resolves to `scenarioShifts`; unknown id ⇒ 400 |
| `startYear` | integer | 2026 | |
| `endYear` | integer | 2226 | 200-year world by default |
| `stepYears` | number | 0.25 | quarterly ticks |

Scenario shifts (applied via `scenarioId`): `knowledgeMultiplier`,
`adoptionSpeedMultiplier`, `biosphereDrift`, `aiAcceleration`.

## Response

```jsonc
{
  "states": [ /* 801 WorldState entries at the default step */ ],
  "summary": {
    "endState": { "year": 2226, "population": 9.7, "lifeExpectancy": 139.4, "…": "…" },
    "baselineEndState": { "…same shape, run with zero interventions…" },
    "lifeExpectancyGain": 54.2,
    "yearsToEscapeVelocity": 2041,
    "peakPopulation": 9.91,
    "finalBiosphereHealth": 78.4,
    "levDetected": true
  }
}
```

A `WorldState` carries: `year`, `yearIndex`, `population` (billions),
`lifeExpectancy`, `healthspan`, `agingRate`, `biosphereHealth`,
`gdpPerCapita`, `aiCapability`, `knowledgeStock`, `interventionCoverage`, and
`interventionLevels` (per-intervention coverage at that instant — that map is
what makes the time machine exact).

## The gene-drive API (same shape)

```
POST /api/gene-drive   { driveEfficiency, resistanceRate, fitnessCost, initialFrequency, generations }
```

Returns the wild / drive / resistant frequency series, generation by
generation. Conversions are capped at the available wild frequency, so
frequency mass is conserved to float precision — the same property the Rust
port's tests assert.

## The stream API

```
GET /api/stream   (text/event-stream)
```

200 ticks at 25ms of `mulberry32(seed ?? 4093)` world metrics, each
`data: {"runId":"run-1001","year":2026.25,"life":73.9,"pop":8.09,"bio":66,"ai":22.3}`.
The `runId` is derived from the seed — no clock rides the wire.
