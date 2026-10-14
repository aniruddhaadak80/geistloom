import { describe, expect, it } from "vitest";
import { getScenario, SCENARIOS, scenarioProbabilities } from "./scenarios";

describe("scenarios", () => {
  it("carries 6 named futures", () => {
    expect(SCENARIOS).toHaveLength(6);
  });

  it("probabilities normalize to 1", () => {
    const probs = scenarioProbabilities();
    const sum = probs.reduce((acc, p) => acc + p.probability, 0);
    expect(sum).toBeCloseTo(1, 10);
    for (const p of probs) {
      expect(p.probability).toBeGreaterThan(0);
      expect(p.probability).toBeLessThan(1);
    }
  });

  it("every scenario has drivers and engine shifts", () => {
    for (const s of SCENARIOS) {
      expect(s.drivers.length).toBeGreaterThanOrEqual(3);
      expect(s.tagline.length).toBeGreaterThan(5);
      expect(s.engineShifts.knowledgeMultiplier).toBeGreaterThan(0);
    }
  });

  it("stagnation slows the engine, bio-dividend accelerates it", () => {
    const stagnation = getScenario("stagnation");
    const dividend = getScenario("bio-dividend");
    expect(stagnation?.engineShifts.knowledgeMultiplier).toBeLessThan(1);
    expect(dividend?.engineShifts.knowledgeMultiplier).toBeGreaterThan(1);
  });

  it("misalignment shadow is the low-probability high-consequence branch", () => {
    const shadow = getScenario("misalignment-shadow");
    expect(shadow?.engineShifts.biosphereDrift).toBeLessThan(-0.2);
    const probs = scenarioProbabilities();
    const entry = probs.find((p) => p.scenario.id === "misalignment-shadow");
    expect(entry?.probability).toBeLessThan(0.15);
  });
});
