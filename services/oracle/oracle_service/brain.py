"""Oracle brain — the deterministic superintelligence core.

The Oracle is a finite-state machine over the Geistloom knowledge
graph (hallmarks, interventions, clocks, scenarios), scored with a
seeded PRNG. There is no LLM call anywhere: the same prompt always
produces the same plan, and every reasoning step is emitted as data.

This module mirrors packages/core/src/agents/oracle.ts so the web
app and the service produce byte-identical plans for the same
(prompt, seed) pair.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from typing import Any

# --- Deterministic PRNG (mulberry32, same as the TypeScript core) ---


def mulberry32(seed: int) -> Any:
    state = [seed & 0xFFFFFFFF]

    def next_float() -> float:
        state[0] = (state[0] + 0x6D2B79F5) & 0xFFFFFFFF
        t = state[0]
        t = ((t ^ (t >> 15)) * (t | 1)) & 0xFFFFFFFF
        t = (t + ((t ^ (t >> 7)) * (t | 61))) & 0xFFFFFFFF
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296.0

    return next_float


def seed_from_string(prompt: str, salt: int = 4093) -> int:
    digest = hashlib.sha256(f"{prompt}|{salt}".encode()).digest()
    return int.from_bytes(digest[:4], "little")


# --- Knowledge graph (subset mirrors of the TS domain data) ---

HALLMARKS = [
    {"id": "genomic-instability", "name": "Genomic instability", "layer": "nuclear"},
    {"id": "telomere-attrition", "name": "Telomere attrition", "layer": "nuclear"},
    {
        "id": "epigenetic-alterations",
        "name": "Epigenetic alterations",
        "layer": "epigenomic",
    },
    {
        "id": "loss-of-proteostasis",
        "name": "Loss of proteostasis",
        "layer": "proteomic",
    },
    {
        "id": "disabled-macroautophagy",
        "name": "Disabled macroautophagy",
        "layer": "organellar",
    },
    {
        "id": "deregulated-nutrient-sensing",
        "name": "Deregulated nutrient sensing",
        "layer": "systemic",
    },
    {
        "id": "mitochondrial-dysfunction",
        "name": "Mitochondrial dysfunction",
        "layer": "organellar",
    },
    {"id": "cellular-senescence", "name": "Cellular senescence", "layer": "cellular"},
    {"id": "stem-cell-exhaustion", "name": "Stem cell exhaustion", "layer": "cellular"},
    {
        "id": "altered-intercellular-communication",
        "name": "Altered intercellular communication",
        "layer": "intercellular",
    },
    {"id": "chronic-inflammation", "name": "Chronic inflammation", "layer": "systemic"},
    {"id": "dysbiosis", "name": "Dysbiosis", "layer": "systemic"},
]

INTERVENTIONS = [
    {
        "id": "senolytics-dq",
        "name": "Dasatinib + Quercetin",
        "evidence": "clinical",
        "reduction": 0.18,
    },
    {
        "id": "partial-reprogramming",
        "name": "Partial reprogramming (OSK)",
        "evidence": "preclinical",
        "reduction": 0.32,
    },
    {
        "id": "telomerase-therapy",
        "name": "Telomerase gene therapy",
        "evidence": "preclinical",
        "reduction": 0.16,
    },
    {
        "id": "rapalogs",
        "name": "Rapalogs (mTOR inhibitors)",
        "evidence": "clinical",
        "reduction": 0.14,
    },
    {
        "id": "base-editing",
        "name": "Base editing",
        "evidence": "clinical",
        "reduction": 0.10,
    },
    {
        "id": "prime-editing",
        "name": "Prime editing",
        "evidence": "clinical",
        "reduction": 0.12,
    },
    {
        "id": "epigenetic-editing",
        "name": "Epigenetic editing",
        "evidence": "preclinical",
        "reduction": 0.14,
    },
    {"id": "metformin", "name": "Metformin", "evidence": "clinical", "reduction": 0.05},
    {
        "id": "nad-precursors",
        "name": "NAD+ precursors",
        "evidence": "clinical",
        "reduction": 0.06,
    },
    {
        "id": "autophagy-enhancers",
        "name": "Autophagy enhancers",
        "evidence": "clinical",
        "reduction": 0.09,
    },
    {
        "id": "fmt",
        "name": "Fecal microbiota transplant",
        "evidence": "clinical",
        "reduction": 0.06,
    },
    {
        "id": "stem-cell-therapies",
        "name": "Stem cell therapies",
        "evidence": "clinical",
        "reduction": 0.10,
    },
]

CLOCKS = [
    {"id": "horvath", "name": "Horvath clock", "cpg": 353, "year": 2013},
    {"id": "grimage", "name": "DNAm GrimAge", "cpg": 1030, "year": 2019},
    {"id": "dunedinpace", "name": "DunedinPACE", "cpg": 173, "year": 2022},
    {
        "id": "universal-mammalian",
        "name": "Universal mammalian clock",
        "cpg": 15255,
        "year": 2023,
    },
]

SCENARIOS = [
    {"id": "bio-dividend", "name": "The Bio-Dividend", "weight": 0.22},
    {"id": "lev-2035", "name": "Escape Velocity, 2035", "weight": 0.18},
    {"id": "post-scarcity", "name": "Post-Scarcity Biology", "weight": 0.15},
    {"id": "stagnation", "name": "The Long Stagnation", "weight": 0.20},
    {"id": "divided-world", "name": "The Divided World", "weight": 0.17},
    {"id": "misalignment-shadow", "name": "Misalignment Shadow", "weight": 0.08},
]

PHASES = [
    ("Map the problem", (1, 3)),
    ("Decode the mechanism", (2, 4)),
    ("Design the intervention", (2, 5)),
    ("Prove it in models", (3, 6)),
    ("Open the trial", (2, 7)),
    ("Ship it to the world", (4, 10)),
]

DOMAIN_VOCAB = [
    (
        "longevity & aging",
        ["aging", "age", "longevity", "lifespan", "healthspan", "rejuvenat", "old"],
    ),
    (
        "genetic engineering",
        ["crispr", "gene", "genome", "dna", "editing", "genetic", "allele"],
    ),
    ("epigenetics", ["epigenet", "methylat", "chromatin", "histone", "reprogram"]),
    (
        "neurodegeneration",
        ["alzheimer", "parkinson", "dementia", "neuron", "brain", "cognitive"],
    ),
    ("oncology", ["cancer", "tumor", "carcinoma", "oncolog", "metasta"]),
    (
        "infectious disease",
        ["virus", "bacteria", "infection", "malaria", "pandemic", "pathogen", "immune"],
    ),
    ("metabolism", ["diabet", "obes", "metabol", "insulin", "liver", "cholesterol"]),
    ("cardiovascular", ["heart", "cardio", "vascular", "stroke", "blood pressure"]),
    (
        "ecology & biosphere",
        ["climate", "ecosystem", "ocean", "forest", "biodivers", "extinct", "carbon"],
    ),
    (
        "energy & scarcity",
        ["energy", "solar", "fusion", "battery", "power", "scarcity", "food", "hunger"],
    ),
    (
        "AI & computation",
        ["ai", "intelligence", "comput", "model", "robot", "autom", "singular", "agi"],
    ),
    (
        "governance & ethics",
        ["govern", "ethic", "policy", "law", "regul", "equity", "justice", "fair"],
    ),
]


@dataclass
class ReasoningStep:
    id: str
    label: str
    detail: str
    rationale: str
    confidence: float


@dataclass
class PlanPhase:
    id: str
    name: str
    years: int
    description: str
    milestone: str
    confidence: float
    reasoning: list[ReasoningStep] = field(default_factory=list)


@dataclass
class OraclePlan:
    id: str
    prompt: str
    domain: str
    title: str
    summary: str
    phases: list[PlanPhase]
    key_numbers: list[dict[str, str]]
    citations: list[str]
    scenario: str
    seed: int
    model: str = "geistloom-oracle-1 (deterministic local simulation)"

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "prompt": self.prompt,
            "domain": self.domain,
            "title": self.title,
            "summary": self.summary,
            "phases": [
                {
                    "id": p.id,
                    "name": p.name,
                    "years": p.years,
                    "description": p.description,
                    "milestone": p.milestone,
                    "confidence": p.confidence,
                }
                for p in self.phases
            ],
            "keyNumbers": self.key_numbers,
            "citations": self.citations,
            "scenario": self.scenario,
            "seed": self.seed,
            "model": self.model,
        }


def classify(prompt: str, rng) -> tuple[str, float]:
    lower = prompt.lower()
    best_domain, best_score = "general systems", 0.0
    for domain, terms in DOMAIN_VOCAB:
        score = sum(len(t) for t in terms if t in lower)
        score += (rng() * 2 - 1) * 2  # deterministic tie-breaker
        if score > best_score:
            best_domain, best_score = domain, score
    return best_domain, best_score


def match_hallmarks(prompt: str, rng) -> list[dict[str, Any]]:
    lower = prompt.lower()
    scored = []
    for h in HALLMARKS:
        score = sum(3 for w in h["name"].lower().split() if len(w) > 3 and w in lower)
        score += rng() * 0.8
        scored.append((score, h))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [h for s, h in scored if s > 1.5][:3]


def match_interventions(prompt: str, rng) -> list[dict[str, Any]]:
    lower = prompt.lower()
    scored = []
    for iv in INTERVENTIONS:
        score = sum(
            4
            for w in iv["name"].lower().replace("-", " ").split()
            if len(w) > 4 and w in lower
        )
        score += rng() * 1.2
        scored.append((score, iv))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [iv for s, iv in scored if s > 2.5][:4]


def ask(prompt: str, seed: int | None = None) -> OraclePlan:
    prompt = prompt.strip()
    if not prompt:
        raise ValueError("Oracle requires a non-empty prompt")
    resolved_seed = seed if seed is not None else seed_from_string(prompt)
    rng = mulberry32(resolved_seed)

    domain, _ = classify(prompt, rng)
    hallmarks = match_hallmarks(prompt, rng)
    interventions = match_interventions(prompt, rng)
    scenario = SCENARIOS[int(rng() * len(SCENARIOS)) % len(SCENARIOS)]
    primary = hallmarks[0] if hallmarks else None

    phases: list[PlanPhase] = []
    for idx, (name, (lo, hi)) in enumerate(PHASES):
        years = lo + int(rng() * (hi - lo + 1))
        confidence = round(
            max(0.0, min(1.0, 0.92 - idx * 0.11 + (rng() * 0.1 - 0.05))), 2
        )
        reasoning = [
            ReasoningStep(
                id=f"rs-{idx}-{i}",
                label="Evaluate the binding constraint",
                detail=f"Phase '{name}' weighs {primary['name'] if primary else 'the mechanism'} "
                f"against the {interventions[0]['evidence'] if interventions else 'preclinical'} evidence class.",
                rationale="The literature converges on this node as causal, not merely correlational.",
                confidence=round(0.55 + rng() * 0.42, 2),
            )
            for i in range(3 + int(rng() * 3))
        ]
        phases.append(
            PlanPhase(
                id=f"phase-{idx + 1}",
                name=name,
                years=years,
                description=f"Research phase targeting {primary['name'] if primary else 'first principles'} "
                f"in the {domain} domain, executed with deterministic evaluation.",
                milestone=f"Phase gate {idx + 1} cleared with published, reproducible endpoints.",
                confidence=confidence,
                reasoning=reasoning,
            )
        )

    total_years = sum(p.years for p in phases)
    reduction = sum(iv["reduction"] for iv in interventions) * 100
    plan = OraclePlan(
        id=f"plan-{resolved_seed:x}-{len(prompt)}",
        prompt=prompt,
        domain=domain,
        title=f"Sovereign Plan for {primary['name'] if primary else 'the General Problem'} ({domain})",
        summary=(
            f"A {total_years}-year research program to make {domain} solvable, anchored on "
            f"{primary['name'] if primary else 'first principles'} and "
            f"{interventions[0]['name'] if interventions else 'de novo design'}. "
            f"Modeled under the '{scenario['name']}' scenario ({scenario['weight'] * 100:.0f}% prior)."
        ),
        phases=phases,
        key_numbers=[
            {"label": "Program horizon", "value": str(total_years), "unit": "years"},
            {
                "label": "Theoretical aging-rate reduction",
                "value": f"{reduction:.0f}",
                "unit": "%",
            },
            {
                "label": "Lead evidence grade",
                "value": interventions[0]["evidence"] if interventions else "none",
                "unit": "translatability",
            },
            {
                "label": "Hallmarks addressed",
                "value": str(len(hallmarks)),
                "unit": "of 12",
            },
            {
                "label": "Scenario prior",
                "value": f"{scenario['weight'] * 100:.0f}",
                "unit": "%",
            },
        ],
        citations=[
            "López-Otín C. et al. (2023). Hallmarks of aging: An expanding universe. Cell.",
            *(f"{iv['name']} — intervention dossier" for iv in interventions),
            *(f"{c['name']} ({c['year']}) — {c['cpg']} CpG sites" for c in CLOCKS[:2]),
            "UN World Population Prospects (2024 revision): life expectancy 73.8y (2026) → 81.7y (2100).",
        ],
        scenario=scenario["name"],
        seed=resolved_seed,
    )
    return plan
