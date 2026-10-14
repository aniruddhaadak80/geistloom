/**
 * The Oracle's brain — a finite-state machine with utility scoring.
 *
 * The brain is what the Oracle runs on. It cycles through
 * perceive → decompose → research → synthesize → plan → reflect,
 * and at each state it scores the knowledge nodes it can reach,
 * picks the highest-utility one, and records a trace line. The
 * utility function is deterministic; the seeded noise only breaks
 * ties. This is the whole trick: a superintelligence you can read
 * like a book, because it is one.
 */

import { CLOCKS } from "../domain/clocks";
import { HALLMARKS } from "../domain/hallmarks";
import { INTERVENTIONS } from "../domain/interventions";
import { bell, intRange, mulberry32, pickOne, range } from "../prng";

export type BrainState = "perceive" | "decompose" | "research" | "synthesize" | "plan" | "reflect";

export const BRAIN_TRANSITIONS: Readonly<Record<BrainState, BrainState>> = {
  perceive: "decompose",
  decompose: "research",
  research: "synthesize",
  synthesize: "plan",
  plan: "reflect",
  reflect: "perceive",
};

export interface KnowledgeNode {
  readonly id: string;
  readonly label: string;
  readonly kind: "hallmark" | "intervention" | "clock" | "datum";
  readonly utilityBias: number;
}

export interface BrainTrace {
  readonly step: number;
  readonly state: BrainState;
  readonly thought: string;
  readonly nodeId: string;
  readonly nodeLabel: string;
  readonly utilityScore: number;
}

export interface BrainConfig {
  readonly seed: number;
  readonly focus?: string;
}

/** The knowledge graph the brain reasons over. */
export function buildKnowledgeGraph(focus?: string): readonly KnowledgeNode[] {
  const lower = (focus ?? "").toLowerCase();
  const nodes: KnowledgeNode[] = [];

  for (const h of HALLMARKS) {
    let bias = 1;
    for (const word of h.name.toLowerCase().split(" ")) {
      if (word.length > 3 && lower.includes(word)) bias += 2;
    }
    nodes.push({ id: `hallmark:${h.id}`, label: h.name, kind: "hallmark", utilityBias: bias });
  }
  for (const iv of INTERVENTIONS) {
    let bias = 1;
    for (const word of iv.name.toLowerCase().split(/[^a-z]+/)) {
      if (word.length > 4 && lower.includes(word)) bias += 3;
    }
    nodes.push({
      id: `intervention:${iv.id}`,
      label: iv.name,
      kind: "intervention",
      utilityBias: bias,
    });
  }
  for (const c of CLOCKS) {
    nodes.push({
      id: `clock:${c.id}`,
      label: c.name,
      kind: "clock",
      utilityBias: lower.includes("measure") || lower.includes("clock") ? 4 : 1.5,
    });
  }
  nodes.push({
    id: "datum:wpp",
    label: "UN WPP life-expectancy series",
    kind: "datum",
    utilityBias: lower.includes("world") || lower.includes("population") ? 5 : 2,
  });
  nodes.push({
    id: "datum:lev",
    label: "Longevity escape velocity literature",
    kind: "datum",
    utilityBias: lower.includes("escape") || lower.includes("velocity") ? 5 : 2,
  });
  return nodes;
}

/**
 * Utility of reaching a node in a given brain state.
 * Research state prizes measurement; plan state prizes interventions;
 * decompose prizes hallmarks. Bias + seeded bell noise, never random.
 */
export function utilityScore(node: KnowledgeNode, state: BrainState, rng: () => number): number {
  const stateAffinity: Record<BrainState, Record<KnowledgeNode["kind"], number>> = {
    perceive: { hallmark: 1.2, intervention: 0.8, clock: 1.0, datum: 1.4 },
    decompose: { hallmark: 2.2, intervention: 0.9, clock: 1.1, datum: 1.0 },
    research: { hallmark: 1.4, intervention: 1.2, clock: 2.4, datum: 1.6 },
    synthesize: { hallmark: 1.6, intervention: 2.0, clock: 1.4, datum: 1.2 },
    plan: { hallmark: 1.3, intervention: 2.6, clock: 1.2, datum: 1.0 },
    reflect: { hallmark: 1.0, intervention: 1.0, clock: 1.0, datum: 1.0 },
  };
  return node.utilityBias * (stateAffinity[state]?.[node.kind] ?? 1) + bell(rng) * 0.6;
}

const THOUGHTS: Readonly<Record<BrainState, readonly string[]>> = {
  perceive: [
    "Reading the query against the knowledge graph.",
    "Which terms light up? Mapping vocabulary to nodes.",
    "Calibrating prior: what does the field already know?",
  ],
  decompose: [
    "Splitting the problem into its causal layers.",
    "Which hallmark sits at the top of the causal graph?",
    "Separating mechanism from marker.",
  ],
  research: [
    "Pulling the measurement stack — what can we actually see?",
    "Cross-checking effect sizes across model organisms.",
    "Reading the clocks: what would a reversal look like in data?",
  ],
  synthesize: [
    "Fusing mechanism + measurement into an intervention hypothesis.",
    "Where do the evidence paths converge?",
    "Naming the binding constraint out loud.",
  ],
  plan: [
    "Sequencing the work: map, decode, design, prove, trial, ship.",
    "Assigning years and confidence per phase.",
    "Pricing every failure mode before we commit.",
  ],
  reflect: [
    "What would make this plan wrong?",
    "Audit pass: is every edge in the DAG experimentally checkable?",
    "Recording the trace. The reasoning is the product.",
  ],
};

export class OracleBrain {
  private state: BrainState = "perceive";
  private readonly rng: () => number;
  private readonly graph: readonly KnowledgeNode[];
  private stepCount = 0;

  constructor(config: BrainConfig) {
    this.rng = mulberry32(config.seed);
    this.graph = buildKnowledgeGraph(config.focus);
  }

  get currentState(): BrainState {
    return this.state;
  }

  /** Run one think cycle: score nodes, pick best, emit trace, transition. */
  step(): BrainTrace {
    const state = this.state;
    let best = this.graph[0] as KnowledgeNode;
    let bestScore = Number.NEGATIVE_INFINITY;
    for (const node of this.graph) {
      const score = utilityScore(node, state, this.rng);
      if (score > bestScore) {
        bestScore = score;
        best = node;
      }
    }
    const thought = pickOne(THOUGHTS[state], this.rng);
    this.stepCount += 1;
    const trace: BrainTrace = {
      step: this.stepCount,
      state,
      thought,
      nodeId: best.id,
      nodeLabel: best.label,
      utilityScore: Math.round(bestScore * 1000) / 1000,
    };
    this.state = BRAIN_TRANSITIONS[state] ?? "perceive";
    return trace;
  }

  /** Run a full perceive→reflect loop (6 steps). */
  runCycle(): readonly BrainTrace[] {
    const traces: BrainTrace[] = [];
    for (let i = 0; i < 6; i++) {
      traces.push(this.step());
    }
    return traces;
  }

  /** Run until a full cycle completes at least `cycles` times. */
  run(cycles: number): readonly BrainTrace[] {
    const all: BrainTrace[] = [];
    for (let i = 0; i < Math.max(1, intRange(1, cycles, this.rng)); i++) {
      all.push(...this.runCycle());
    }
    return all;
  }
}

/** Convenience: one deterministic brain run for a prompt. */
export function thinkAbout(prompt: string, cycles = 2): readonly BrainTrace[] {
  const seed = Math.floor(range(0, 2 ** 31, mulberry32(prompt.length * 2654435761)));
  const brain = new OracleBrain({ seed, focus: prompt });
  return brain.run(cycles);
}
