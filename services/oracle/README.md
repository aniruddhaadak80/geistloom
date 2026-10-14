# Geistloom Oracle Service

The deterministic superintelligence simulator.

## What it is

A FastAPI service that answers any prompt with a full research
program — six phases, durations, milestones, confidence bands,
key numbers, and literature citations — using **no LLM and no
network**. The "intelligence" is a finite-state machine over a
curated knowledge graph (the 12 hallmarks of aging, the
intervention atlas, the epigenetic clocks, the scenario set),
scored with a seeded PRNG. The same `(prompt, seed)` always
produces byte-identical output, so the Oracle is auditable,
replayable, and safe to run on any machine, forever.

## Run it

```powershell
cd services/oracle
python -m venv .venv; .\.venv\Scripts\activate
pip install -e ".[dev]"
uvicorn oracle_service.main:app --port 8787
curl -X POST http://localhost:8787/v1/plan -d '{"prompt":"solve aging"}'
```

## Test it

```powershell
pytest
```

## Contract

The wire format is defined by `packages/sdk/src/types.ts`
(zod) and mirrored by the pydantic models in
`oracle_service/main.py`. The Next.js app's `/api/oracle`
route produces the same plan shape from `@geistloom/core`,
so the service is optional at demo time — the web app runs
fully offline by default.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/healthz` | Liveness probe |
| POST | `/v1/plan` | Ask the Oracle `{prompt, seed?}` |
| GET | `/v1/plan/{id}` | Fetch a cached plan |
| POST | `/v1/brain` | Run the FSM brain cycle `{prompt, cycles?}` |
