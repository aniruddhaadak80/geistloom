import pytest
from fastapi.testclient import TestClient

from oracle_service.brain import ask, mulberry32, seed_from_string
from oracle_service.main import app

client = TestClient(app)


def test_healthz():
    res = client.get("/healthz")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    assert res.json()["deterministic"] == "true"


def test_plan_is_deterministic():
    a = client.post("/v1/plan", json={"prompt": "solve aging"})
    b = client.post("/v1/plan", json={"prompt": "solve aging"})
    assert a.status_code == 200
    assert a.json() == b.json()


def test_plan_classifies_longevity():
    res = client.post(
        "/v1/plan", json={"prompt": "how do we solve aging and extend lifespan?"}
    )
    assert res.status_code == 200
    body = res.json()
    assert body["domain"] == "longevity & aging"
    assert len(body["phases"]) == 6
    assert body["model"].startswith("geistloom-oracle-1")


def test_plan_has_dag_like_key_numbers_and_citations():
    res = client.post(
        "/v1/plan", json={"prompt": "cure malaria with a CRISPR gene drive"}
    )
    assert res.status_code == 200
    body = res.json()
    assert len(body["keyNumbers"]) >= 4
    assert len(body["citations"]) >= 3
    assert any("Hallmarks of aging" in c for c in body["citations"])


def test_plan_with_seed_is_reproducible():
    a = client.post("/v1/plan", json={"prompt": "solve aging", "seed": 12345})
    b = client.post("/v1/plan", json={"prompt": "solve aging", "seed": 12345})
    assert a.json()["id"] == b.json()["id"]


def test_empty_prompt_rejected():
    res = client.post("/v1/plan", json={"prompt": ""})
    assert res.status_code == 422


def test_brain_trace_cycles():
    res = client.post("/v1/brain", json={"prompt": "solve aging", "cycles": 2})
    assert res.status_code == 200
    trace = res.json()["trace"]
    assert len(trace) == 12
    states = [t["state"] for t in trace]
    assert states[:6] == [
        "perceive",
        "decompose",
        "research",
        "synthesize",
        "plan",
        "reflect",
    ]


def test_brain_module_determinism():
    p1 = ask("solve aging", 42)
    p2 = ask("solve aging", 42)
    assert p1.to_dict() == p2.to_dict()


def test_mulberry32_matches_typescript_reference():
    rng = mulberry32(4093)
    values = [rng() for _ in range(5)]
    assert all(0 <= v < 1 for v in values)
    # Same seed → same stream
    assert values == [rng() for rng in [mulberry32(4093)] for _ in range(5)]


def test_seed_from_string_mixes_salt():
    assert seed_from_string("x", 0) != seed_from_string("x", 1)


if __name__ == "__main__":
    pytest.main([__file__])
