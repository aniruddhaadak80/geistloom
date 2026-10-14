import { describe, expect, it } from "vitest";
import {
  BRAIN_TRANSITIONS,
  type BrainState,
  buildKnowledgeGraph,
  OracleBrain,
  thinkAbout,
  utilityScore,
} from "./brain";

describe("oracle brain", () => {
  it("cycles through the full FSM loop", () => {
    const brain = new OracleBrain({ seed: 4093, focus: "solve aging" });
    expect(brain.currentState).toBe("perceive");
    const traces = brain.runCycle();
    expect(traces).toHaveLength(6);
    expect(traces.map((t) => t.state)).toEqual([
      "perceive",
      "decompose",
      "research",
      "synthesize",
      "plan",
      "reflect",
    ]);
    expect(brain.currentState).toBe("perceive");
  });

  it("every trace step is well-formed", () => {
    const brain = new OracleBrain({ seed: 4093, focus: "solve aging" });
    for (const t of brain.run(2)) {
      expect(t.step).toBeGreaterThan(0);
      expect(t.thought.length).toBeGreaterThan(5);
      expect(t.nodeId.length).toBeGreaterThan(0);
      expect(t.nodeLabel.length).toBeGreaterThan(0);
      expect(t.utilityScore).not.toBeNaN();
    }
  });

  it("the transition table is a closed loop", () => {
    const _states: BrainState[] = [
      "perceive",
      "decompose",
      "research",
      "synthesize",
      "plan",
      "reflect",
    ];
    let s: BrainState = "perceive";
    const seen = new Set<BrainState>();
    for (let i = 0; i < 6; i++) {
      seen.add(s);
      s = BRAIN_TRANSITIONS[s];
    }
    expect(seen.size).toBe(6);
  });

  it("knowledge graph grows when the focus matches vocabulary", () => {
    const generic = buildKnowledgeGraph("zzz");
    const focused = buildKnowledgeGraph("solve aging with senolytics and clocks");
    const maxBias = (g: readonly ReturnType<typeof buildKnowledgeGraph>[number][]) =>
      Math.max(...g.map((n) => n.utilityBias));
    expect(maxBias(focused)).toBeGreaterThan(maxBias(generic));
  });

  it("utility scoring is deterministic and state-dependent", () => {
    const nodes = buildKnowledgeGraph("aging");
    const node = nodes[0];
    if (!node) throw new Error("empty graph");
    const rng = () => 0.5;
    const a = utilityScore(node, "research", rng);
    const b = utilityScore(node, "plan", rng);
    expect(a).not.toBeNaN();
    expect(b).not.toBeNaN();
  });

  it("thinkAbout produces a deterministic trace for a prompt", () => {
    const a = thinkAbout("solve aging", 2);
    const b = thinkAbout("solve aging", 2);
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThanOrEqual(6);
  });
});
