/**
 * The Oracle — a deterministic superintelligence simulator.
 *
 * There is no API key and no network call. The Oracle is a finite
 * state machine over a curated knowledge graph (the 12 hallmarks,
 * 30 interventions, 8 clocks, 6 scenarios), scored with a seeded
 * PRNG. The same prompt always produces the same plan — which is
 * the point: a superintelligence whose reasoning you can audit line
 * by line, on your machine, forever.
 *
 * The plan it emits is a research program: phases with durations,
 * milestones, confidence bands, a reasoning DAG you can explore,
 * key numbers, and citations into the real literature.
 */

import { CLOCKS, type EpigeneticClock } from "../domain/clocks";
import { HALLMARKS, type Hallmark } from "../domain/hallmarks";
import { INTERVENTIONS, type Intervention } from "../domain/interventions";
import { SCENARIOS } from "../domain/scenarios";
import { bell, intRange, mulberry32, pickOne, range, seedFromString, shuffle } from "../prng";

export interface ReasoningStep {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
  readonly rationale: string;
  readonly confidence: number;
}

export interface PlanPhase {
  readonly id: string;
  readonly name: string;
  readonly years: number;
  readonly description: string;
  readonly milestone: string;
  readonly confidence: number;
  readonly reasoning: readonly ReasoningStep[];
}

export interface DagNode {
  readonly id: string;
  readonly label: string;
  readonly kind: "question" | "evidence" | "mechanism" | "intervention" | "risk" | "milestone";
}

export interface DagEdge {
  readonly from: string;
  readonly to: string;
  readonly label: string;
}

export interface KeyNumber {
  readonly label: string;
  readonly value: string;
  readonly unit: string;
}

export interface OraclePlan {
  readonly id: string;
  readonly prompt: string;
  readonly domain: string;
  readonly title: string;
  readonly summary: string;
  readonly phases: readonly PlanPhase[];
  readonly reasoningDag: {
    readonly nodes: readonly DagNode[];
    readonly edges: readonly DagEdge[];
  };
  readonly keyNumbers: readonly KeyNumber[];
  readonly citations: readonly string[];
  readonly scenario: string;
  readonly seed: number;
  readonly model: string;
}

export interface OracleQuery {
  readonly prompt: string;
  readonly seed?: number;
}

export const ORACLE_MODEL = "geistloom-oracle-1 (deterministic local simulation)";

const DOMAIN_VOCAB: ReadonlyArray<{ domain: string; terms: readonly string[] }> = [
  {
    domain: "longevity & aging",
    terms: [
      "aging",
      "age",
      "longevity",
      "old",
      "ageing",
      "lifespan",
      "healthspan",
      "rejuvenat",
      "death",
      "mortal",
      "elderly",
      "geriatric",
    ],
  },
  {
    domain: "genetic engineering",
    terms: [
      "crispr",
      "gene",
      "genome",
      "dna",
      "editing",
      "edit",
      "genetic",
      "allele",
      "plasmid",
      "transgenic",
      "knockout",
      "sequenc",
    ],
  },
  {
    domain: "epigenetics",
    terms: ["epigenet", "methylat", "chromatin", "histone", "reprogram", "methylome"],
  },
  {
    domain: "neurodegeneration",
    terms: [
      "alzheimer",
      "parkinson",
      "dementia",
      "neuron",
      "brain",
      "cognitive",
      "neuro",
      "memory",
    ],
  },
  {
    domain: "oncology",
    terms: ["cancer", "tumor", "carcinoma", "oncolog", "metasta", "chemotherapy"],
  },
  {
    domain: "infectious disease",
    terms: [
      "virus",
      "bacteria",
      "infection",
      "malaria",
      "pandemic",
      "pathogen",
      "immune",
      "vaccine",
    ],
  },
  {
    domain: "metabolism",
    terms: ["diabet", "obes", "metabol", "insulin", "liver", "fat", "cholesterol"],
  },
  {
    domain: "cardiovascular",
    terms: ["heart", "cardio", "vascular", "athero", "stroke", "blood pressure"],
  },
  {
    domain: "ecology & biosphere",
    terms: ["climate", "ecosystem", "ocean", "forest", "biodivers", "extinct", "carbon", "planet"],
  },
  {
    domain: "energy & scarcity",
    terms: ["energy", "solar", "fusion", "battery", "power", "scarcity", "food", "hunger"],
  },
  {
    domain: "AI & computation",
    terms: ["ai", "intelligence", "comput", "model", "robot", "autom", "singular", "agi"],
  },
  {
    domain: "governance & ethics",
    terms: ["govern", "ethic", "policy", "law", "regul", "equity", "justice", "fair"],
  },
];

function classifyPrompt(prompt: string, rng: () => number): { domain: string; score: number } {
  const lower = prompt.toLowerCase();
  let best = { domain: "general systems", score: 0 };
  for (const entry of DOMAIN_VOCAB) {
    let score = 0;
    for (const term of entry.terms) {
      if (lower.includes(term)) score += term.length;
    }
    score += bell(rng) * 2; // deterministic tie-breaker
    if (score > best.score) best = { domain: entry.domain, score };
  }
  return best;
}

function matchHallmarks(prompt: string, rng: () => number): readonly Hallmark[] {
  const lower = prompt.toLowerCase();
  const scored = HALLMARKS.map((h) => {
    let score = 0;
    for (const word of h.name.toLowerCase().split(" ")) {
      if (word.length > 3 && lower.includes(word)) score += 3;
    }
    for (const id of h.interventionIds) {
      if (lower.includes(id.replace(/-/g, " ")) || lower.includes(id.replace(/-/g, ""))) score += 2;
    }
    score += bell(rng) * 0.8;
    return { h, score };
  });
  return shuffle(
    scored
      .filter((s) => s.score > 1.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.h),
    rng,
  );
}

function matchInterventions(prompt: string, rng: () => number): readonly Intervention[] {
  const lower = prompt.toLowerCase();
  const scored = INTERVENTIONS.map((i) => {
    let score = 0;
    for (const word of i.name.toLowerCase().split(/[^a-z]+/)) {
      if (word.length > 4 && lower.includes(word)) score += 4;
    }
    if (lower.includes(i.klass.replace("-", " ")) || lower.includes(i.klass)) score += 1;
    score += bell(rng) * 1.2;
    return { i, score };
  });
  return scored
    .filter((s) => s.score > 2.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => s.i);
}

const PHASE_TEMPLATES: ReadonlyArray<{
  name: string;
  years: [number, number];
  description: (ctx: PlanContext) => string;
  milestone: (ctx: PlanContext) => string;
}> = [
  {
    name: "Map the problem",
    years: [1, 3],
    description: (ctx) =>
      `Instrument ${ctx.domain} with ${ctx.clocks.length > 0 ? (ctx.clocks[0]?.name ?? "epigenetic clocks") : "high-resolution biomarkers"} and baseline the current trajectory. You cannot solve what you cannot measure — the clocks exist precisely because the field learned this in 2013.`,
    milestone: (ctx) =>
      `Reference cohort (n≥1,000) profiled on ${ctx.primaryHallmark?.name ?? "the target biology"} with published baseline distributions.`,
  },
  {
    name: "Decode the mechanism",
    years: [2, 4],
    description: (ctx) =>
      `Trace ${ctx.primaryHallmark?.name ?? "the core mechanism"} to its causal core: which molecular event, if reversed, moves the phenotype. Use AI-accelerated structure prediction (AlphaFold-class) for every druggable node and single-cell atlases to localize the damage.`,
    milestone: (_ctx) =>
      `Causal model validated in two independent model systems; every edge in the reasoning DAG experimentally confirmed.`,
  },
  {
    name: "Design the intervention",
    years: [2, 5],
    description: (ctx) =>
      `Design against the mechanism: ${ctx.interventions.length > 0 ? ctx.interventions.map((i) => i.name.toLowerCase()).join(", ") : "a novel modality"} — chosen for ${ctx.primaryHallmark ? `coverage of ${ctx.primaryHallmark.name.toLowerCase()}` : "mechanistic fit"}, delivery feasibility, and reversibility. Every construct is simulated before it is synthesized.`,
    milestone: (ctx) =>
      `Lead candidate with ${ctx.bestEvidence ?? "preclinical"}-grade evidence; off-target profile within acceptable bounds.`,
  },
  {
    name: "Prove it in models",
    years: [3, 6],
    description: (_ctx) =>
      `Run the evidence ladder: in vitro → organoid → mouse (lifespan, not just markers) → non-human primate. Pre-register the endpoints. The senolytics field won credibility by measuring remaining lifespan, not just p16.`,
    milestone: (ctx) =>
      `Reproducible effect in two species; effect size ≥ ${range(0.1, 0.35, ctx.rng).toFixed(2)} of the theoretical maximum with p<0.01.`,
  },
  {
    name: "Open the trial",
    years: [2, 7],
    description: (ctx) =>
      `First-in-human with the cheapest honest endpoint: ${ctx.clocks.length > 1 ? `${ctx.clocks[1]?.name ?? "DunedinPACE"} pace-of-aging` : "a validated biomarker"} as surrogate, hard outcomes as confirmation. Adaptive design, interim futility analysis, independent DSMB.`,
    milestone: (_ctx) =>
      `Phase I/IIa readout: safety clean, biomarker moves in the intended direction with dose response.`,
  },
  {
    name: "Ship it to the world",
    years: [4, 10],
    description: (_ctx) =>
      `Manufacturing scale-up, regulatory convergence, and an access framework written before approval — not after. The divided-world scenario is what happens when this phase is an afterthought.`,
    milestone: (_ctx) =>
      `Approved in ≥3 major jurisdictions with a published access covenant; cost curve falling ≥20%/year.`,
  },
];

interface PlanContext {
  readonly domain: string;
  readonly primaryHallmark: Hallmark | undefined;
  readonly clocks: readonly EpigeneticClock[];
  readonly interventions: readonly Intervention[];
  readonly bestEvidence: string;
  readonly rng: () => number;
}

function buildPlan(prompt: string, seed: number): OraclePlan {
  const rng = mulberry32(seed);
  const classification = classifyPrompt(prompt, rng);
  const hallmarks = matchHallmarks(prompt, rng);
  const interventions = matchInterventions(prompt, rng);
  const clocks = shuffle(CLOCKS, rng).slice(0, 3);
  const scenario = pickOne(SCENARIOS, rng);
  const primaryHallmark = hallmarks[0];

  const ctx: PlanContext = {
    domain: classification.domain,
    primaryHallmark,
    clocks,
    interventions,
    bestEvidence: interventions[0]?.evidence ?? "preclinical",
    rng,
  };

  const phases = PHASE_TEMPLATES.map((tpl, idx) => {
    const years = intRange(tpl.years[0] ?? 1, tpl.years[1] ?? 3, rng);
    const phaseRng = mulberry32(seed ^ (idx * 7919));
    const reasoning = buildReasoning(tpl.name, ctx, phaseRng);
    return {
      id: `phase-${idx + 1}`,
      name: tpl.name,
      years,
      description: tpl.description(ctx),
      milestone: tpl.milestone(ctx),
      confidence: Math.round(clamp01(0.92 - idx * 0.11 + bell(phaseRng) * 0.05) * 100) / 100,
      reasoning,
    };
  });

  const totalYears = phases.reduce((acc, p) => acc + p.years, 0);
  const title = planTitle(classification.domain, primaryHallmark, interventions, rng);
  const dag = buildDag(phases, ctx, seed);

  return {
    id: `plan-${seed.toString(16)}-${prompt.length}`,
    prompt,
    domain: classification.domain,
    title,
    summary: `A ${totalYears}-year research program to make ${classification.domain} solvable, anchored on ${primaryHallmark?.name ?? "first principles"} and ${interventions.length > 0 ? `the ${interventions[0]?.name ?? "lead intervention"} evidence base` : "first-principles design"}. Modeled under the "${scenario.name}" scenario (${(scenario.weight * 100).toFixed(0)}% prior).`,
    phases,
    reasoningDag: dag,
    keyNumbers: [
      { label: "Program horizon", value: String(totalYears), unit: "years" },
      {
        label: "Theoretical aging-rate reduction",
        value: (interventions.reduce((acc, i) => acc + i.agingRateReduction, 0) * 100).toFixed(0),
        unit: "%",
      },
      {
        label: "Lead evidence grade",
        value: interventions[0]?.evidence ?? "none",
        unit: "translatability",
      },
      {
        label: "Hallmarks addressed",
        value: String(hallmarks.length),
        unit: "of 12",
      },
      {
        label: "Scenario prior",
        value: (scenario.weight * 100).toFixed(0),
        unit: "%",
      },
    ],
    citations: buildCitations(primaryHallmark, interventions, clocks),
    scenario: scenario.name,
    seed,
    model: ORACLE_MODEL,
  };
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function buildReasoning(
  phaseName: string,
  ctx: PlanContext,
  rng: () => number,
): readonly ReasoningStep[] {
  const steps: ReasoningStep[] = [];
  const count = intRange(3, 5, rng);
  for (let i = 0; i < count; i++) {
    const stepRng = mulberry32(Math.floor(rng() * 1e9));
    steps.push({
      id: `rs-${phaseName.toLowerCase().replace(/[^a-z]+/g, "-")}-${i + 1}`,
      label: pickOne(
        [
          "Identify the binding constraint",
          "Survey the evidence base",
          "Estimate the effect size",
          "Check for off-target risk",
          "Compare against the alternative",
          "Stress-test the assumption",
          "Price the failure mode",
        ],
        stepRng,
      ),
      detail: `Under "${phaseName}", the Oracle weighs ${ctx.primaryHallmark?.name ?? "the mechanism"} against the ${ctx.interventions[0]?.klass ?? "modality"} evidence class and assigns a confidence of ${range(0.5, 0.95, stepRng).toFixed(2)} after ${intRange(2, 40, stepRng)} deterministic evaluations.`,
      rationale: pickOne(
        [
          "The literature converges on this node as causal, not merely correlational.",
          "Effect sizes in mammals replicate across three independent labs.",
          "The intervention class has a known delivery path, de-risking translation.",
          "Reversibility is preserved, so the downside is bounded.",
          "The measurement exists (a validated clock), so progress is falsifiable.",
        ],
        stepRng,
      ),
      confidence: Math.round(clamp01(range(0.55, 0.97, stepRng)) * 100) / 100,
    });
  }
  return steps;
}

function planTitle(
  domain: string,
  primaryHallmark: Hallmark | undefined,
  interventions: readonly Intervention[],
  rng: () => number,
): string {
  const noun = primaryHallmark
    ? primaryHallmark.name
        .split(" ")
        .map((w) => w[0]?.toUpperCase() + w.slice(1))
        .join(" ")
    : "The General Problem";
  const verb = pickOne(
    [
      "Sovereign Plan for",
      "Deterministic Roadmap to",
      "Audit-Ready Program for",
      "Century Blueprint for",
    ],
    rng,
  );
  const suffix = interventions[0] ? `via ${interventions[0].name}` : "from first principles";
  return `${verb} ${noun} (${domain}) ${suffix}`;
}

function buildDag(
  phases: readonly PlanPhase[],
  ctx: PlanContext,
  seed: number,
): { nodes: readonly DagNode[]; edges: readonly DagEdge[] } {
  const nodes: DagNode[] = [
    { id: "q0", label: "What is the binding constraint?", kind: "question" },
  ];
  const edges: DagEdge[] = [];
  let last = "q0";

  ctx.clocks.forEach((c, i) => {
    const id = `ev-${i}`;
    nodes.push({ id, label: `${c.name} (${c.cpgSites} CpGs)`, kind: "evidence" });
    edges.push({ from: last, to: id, label: "measured by" });
    last = id;
  });

  if (ctx.primaryHallmark) {
    const id = "mech-0";
    nodes.push({ id, label: ctx.primaryHallmark.name, kind: "mechanism" });
    edges.push({ from: last, to: id, label: "causes" });
    last = id;
  }

  ctx.interventions.forEach((iv, i) => {
    const id = `iv-${i}`;
    nodes.push({ id, label: iv.name, kind: "intervention" });
    edges.push({ from: last, to: id, label: "targeted by" });
    last = id;
    const riskId = `risk-${i}`;
    nodes.push({
      id: riskId,
      label: `risk: ×${iv.riskMultiplier.toFixed(2)} safety tax`,
      kind: "risk",
    });
    edges.push({ from: id, to: riskId, label: "carries" });
    last = id;
  });

  phases.forEach((p, i) => {
    const id = `ms-${i}`;
    nodes.push({ id, label: `${p.name} · ${p.years}y`, kind: "milestone" });
    edges.push({ from: last, to: id, label: "resolves into" });
    last = id;
  });

  void seed;
  return { nodes, edges };
}

function buildCitations(
  hallmark: Hallmark | undefined,
  interventions: readonly Intervention[],
  clocks: readonly EpigeneticClock[],
): readonly string[] {
  const citations: string[] = [
    "López-Otín C. et al. (2023). Hallmarks of aging: An expanding universe. Cell.",
  ];
  if (hallmark) {
    citations.push(`Hallmark dossier: ${hallmark.name} — measured by ${hallmark.measuredBy}`);
  }
  for (const iv of interventions) {
    citations.push(`${iv.name} — ${iv.origin}`);
  }
  for (const c of clocks) {
    citations.push(
      `${c.name} (${c.year}) — ${c.creator}; ${c.trainingSamples.toLocaleString()} training samples`,
    );
  }
  citations.push(
    "UN World Population Prospects (2024 revision): life expectancy 73.8y (2026) → 81.7y (2100).",
  );
  return citations;
}

/** Ask the Oracle. Deterministic: same prompt + seed → same plan. */
export function askOracle(query: OracleQuery): OraclePlan {
  const prompt = query.prompt.trim();
  if (!prompt) throw new Error("Oracle requires a non-empty prompt");
  const seed = query.seed ?? seedFromString(prompt, 4093);
  return buildPlan(prompt, seed);
}

/** Batch: ask the same prompt under every scenario prior. */
export function askOracleAllScenarios(prompt: string): readonly OraclePlan[] {
  return SCENARIOS.map((_s, i) =>
    askOracle({ prompt, seed: seedFromString(prompt, 4093 + i * 131) }),
  );
}
