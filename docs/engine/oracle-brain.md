# Engine: The Oracle brain

The Oracle is not language-model output. It is a **finite state machine over a
knowledge graph**, scored by a seeded PRNG, that produces research plans the
same way a disciplined program manager would — and shows every step.

## The six states

```
perceive → synthesize → decompose → plan → research → reflect
```

| State | What it does | Utility driver |
| --- | --- | --- |
| `perceive` | classify the domain from prompt vocabulary (hallmark names, intervention classes, model families) | vocabulary overlap |
| `synthesize` | pick the primary hallmark + the intervention set that covers it | coverage × evidence grade |
| `decompose` | split the program into six phases (map → decode → design → prove → trial → ship) | coverage slack |
| `plan` | assign years and confidence per phase; confidence shrinks with distance | remaining uncertainty |
| `research` | pull citations attached to the selected interventions | citation density |
| `reflect` | re-score the plan and stamp `brainTrace` | full-plan utility |

The `brainTrace` in every plan is the literal walk through these states with
the utility the brain assigned each — that is the auditability claim.

## The knowledge graph

`buildKnowledgeGraph(prompt)` grows a node set from the prompt's matched
vocabulary: each hallmark attracts its interventions, each intervention pulls
its citations, and scenario vocabulary contributes priors. Nodes carry a
`utilityBias` — a deterministic bump that focuses the graph when the prompt
matches real vocabulary and leaves it generic otherwise.

## Determinism

- The prompt seed is FNV-1a of the prompt text, so "solve aging" always maps
  to the same graph walk.
- All utility comparisons use the seeded `mulberry32` for tie-breaks only.
- The Python mirror (`services/oracle/brain.py`) implements the same FSM over
  the same policy tables; the shared test-suite pins both to identical plans
  for identical prompts.

## What it deliberately is not

Not a chatbot; it cannot answer outside its domain graph — out-of-domain
prompts return a plan with a candidly low confidence and a note saying so.
Not a search engine; citations are the curated sources the domain data
carries. Not magic; every phase, year, and confidence number is inspectable in
the UI's reasoning DAG.

## Tuning the brain

The constants live in `packages/core/src/agents/`: phase templates, evidence
weights, the 22-years-per-reduction lift, the six-state order. They are data —
change them, run `bun run test`, and the diff is the behavior change you asked
for. See [`docs/guides/authoring-domain-data.md`](../guides/authoring-domain-data.md)
for the review bar.
