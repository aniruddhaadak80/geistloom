# API: The Oracle

```
POST /api/oracle
Content-Type: application/json
```

## Request

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `prompt` | string ≤ 500 chars | — | required; must be non-empty after trim |
| `seed` | integer 0 … 2³²−1 | derived from prompt | FNV-1a hash of the prompt when omitted |

```json
{ "prompt": "solve aging", "seed": 4093 }
```

## Response — `OraclePlan`

| Field | Shape | Meaning |
| --- | --- | --- |
| `id` | string | `run-<seed>` — the plan's permanent address |
| `prompt` | string | echoed input |
| `seed` | number | the effective seed |
| `title` | string | the program's name |
| `domain` | string | the domain the brain classified |
| `scenarioId` | string | the scenario prior in force |
| `summary` | string | two paragraphs of plain prose |
| `phases` | 6 entries | `{ number, name, years, confidence, milestone, evidenceGrade }` |
| `reasoning` | DAG | `{ nodes: [{ id, label, kind }], edges: [{ from, to, label }] }` |
| `keyNumbers` | object | `{ yearsToFirstReadout, lifeExpectancyTarget, ... }` |
| `citations` | array | `{ label, url }` from the domain sources |
| `brainTrace` | array | `{ state, note, utility }[]` — the FSM's path |
| `model` | string | `geistloom-oracle-1` (no external model is called) |

## Determinism

The plan is a pure function of `prompt` (via its derived seed) and the domain
data. Two identical requests return identical JSON — verified by the e2e
suite.

## Delegating to the Python service

Set `ORACLE_SERVICE_URL=http://localhost:8000` and the route proxies to the
FastAPI mirror, which speaks the identical zod-compatible contract. The
TypeScript engine remains the fallback and the parity target for its tests.

## Errors

| Status | Cause |
| --- | --- |
| 400 | empty prompt, or invalid body (zod message in `{ error }`) |
| 405 | non-POST |
| 500 | the domain graph failed — never expected; report as a bug |

Full client: `packages/sdk/src/client.ts` (`askOracle()`), contracts in
`packages/sdk/src/types.ts`.
