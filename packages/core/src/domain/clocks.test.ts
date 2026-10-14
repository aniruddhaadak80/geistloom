import { describe, expect, it } from "vitest";
import { CLOCKS, estimateAge, getClock } from "./clocks";

describe("epigenetic clocks", () => {
  it("carries the 8 landmark clocks", () => {
    expect(CLOCKS).toHaveLength(8);
  });

  it("orders generations correctly", () => {
    const first = CLOCKS.filter((c) => c.generation === "first");
    const second = CLOCKS.filter((c) => c.generation === "second");
    const third = CLOCKS.filter((c) => c.generation === "third");
    expect(first.map((c) => c.id)).toEqual(["horvath", "hannum"]);
    expect(second.map((c) => c.id)).toEqual(["phenoage", "grimage", "grimage2"]);
    expect(third.map((c) => c.id)).toEqual(["dunedinpace", "universal-mammalian", "time-seq"]);
  });

  it("Horvath clock has the famous 353 CpG sites", () => {
    expect(getClock("horvath")?.cpgSites).toBe(353);
    expect(getClock("horvath")?.trainingSamples).toBe(7844);
  });

  it("GrimAge v2 is the most-validated second-generation clock", () => {
    expect(getClock("grimage2")?.trainingSamples).toBe(13399);
  });

  it("estimateAge is deterministic and bounded", () => {
    const profile = Array.from({ length: 100 }, (_, i) => (i % 7) / 7);
    const a = estimateAge("horvath", profile);
    const b = estimateAge("horvath", profile);
    expect(a).toBe(b);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThanOrEqual(120);
  });

  it("estimateAge throws on unknown clock or empty profile", () => {
    expect(() => estimateAge("nope", [0.5])).toThrow();
    expect(() => estimateAge("horvath", [])).toThrow();
  });
});
