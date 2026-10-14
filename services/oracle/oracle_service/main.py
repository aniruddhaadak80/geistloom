"""FastAPI surface for the Geistloom Oracle service.

Endpoints (all deterministic, zero external calls):
  GET  /healthz        — liveness probe
  POST /v1/plan        — ask the Oracle {prompt, seed?} → OraclePlan
  GET  /v1/plan/{id}   — fetch a cached plan by id
  POST /v1/brain       — run the FSM brain cycle {prompt, cycles?} → trace
"""

from __future__ import annotations

from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from oracle_service.brain import ask, mulberry32, seed_from_string

app = FastAPI(
    title="Geistloom Oracle Service",
    version="0.1.0",
    description="Deterministic superintelligence simulator. No API keys. No network.",
)

_PLAN_CACHE: dict[str, dict[str, Any]] = {}


class PlanRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=2000)
    seed: int | None = None


class BrainRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=2000)
    cycles: int = Field(default=2, ge=1, le=12)


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok", "service": "geistloom-oracle", "deterministic": "true"}


@app.post("/v1/plan")
def create_plan(req: PlanRequest) -> dict[str, Any]:
    try:
        plan = ask(req.prompt, req.seed)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    payload = plan.to_dict()
    _PLAN_CACHE[payload["id"]] = payload
    return payload


@app.get("/v1/plan/{plan_id}")
def get_plan(plan_id: str) -> dict[str, Any]:
    if plan_id not in _PLAN_CACHE:
        raise HTTPException(status_code=404, detail="plan not found (in-memory cache)")
    return _PLAN_CACHE[plan_id]


@app.post("/v1/brain")
def run_brain(req: BrainRequest) -> dict[str, Any]:
    rng = mulberry32(seed_from_string(req.prompt))
    states = ["perceive", "decompose", "research", "synthesize", "plan", "reflect"]
    trace = []
    step = 0
    for _ in range(req.cycles):
        for state in states:
            step += 1
            trace.append(
                {
                    "step": step,
                    "state": state,
                    "thought": f"FSM cycle in '{state}' over prompt vocabulary.",
                    "utilityScore": round(0.5 + rng() * 0.5, 3),
                }
            )
    return {"prompt": req.prompt, "trace": trace}
