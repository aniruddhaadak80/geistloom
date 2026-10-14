import { describe, expect, it } from "vitest";
import { MILESTONES, milestonesInRange } from "./milestones";

describe("milestones", () => {
  it("carries 17 milestones: 11 history, 6 projection", () => {
    expect(MILESTONES).toHaveLength(17);
    const history = MILESTONES.filter((m) => m.kind === "history");
    const projection = MILESTONES.filter((m) => m.kind === "projection");
    expect(history).toHaveLength(11);
    expect(projection).toHaveLength(6);
  });

  it("history milestones are fully confident, projections are not", () => {
    for (const m of MILESTONES) {
      if (m.kind === "history") expect(m.confidence).toBe(1);
      else expect(m.confidence).toBeGreaterThan(0);
      expect(m.confidence).toBeLessThanOrEqual(1);
    }
  });

  it("sorts by year", () => {
    const years = MILESTONES.map((m) => m.year);
    expect([...years].sort((a, b) => a - b)).toEqual(years);
  });

  it("range queries work", () => {
    const next = milestonesInRange(2026, 2040);
    expect(next.map((m) => m.id)).toContain("m-2029-reprogram");
    expect(next.map((m) => m.id)).toContain("m-2033-agi");
    expect(next.map((m) => m.id)).not.toContain("m-2012-crispr");
  });

  it("anchors the 2026 present with real UN numbers", () => {
    const today = MILESTONES.find((m) => m.id === "m-2026-today");
    expect(today).toBeDefined();
    expect(today?.detail).toContain("73.8");
  });
});
