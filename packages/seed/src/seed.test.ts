import { describe, expect, it } from "vitest";
import { generateWorldSeries, LEAP_WAVE8, SEED, WPP_ANCHORS } from "./index";

describe("seed package", () => {
  it("uses the committed seed 4093", () => {
    expect(SEED).toBe(4093);
  });

  it("anchors the UN WPP life-expectancy series", () => {
    expect(WPP_ANCHORS).toHaveLength(12);
    expect(WPP_ANCHORS[0]).toEqual({ year: 1950, value: 46.4 });
    const latest = WPP_ANCHORS[WPP_ANCHORS.length - 1];
    expect(latest).toEqual({ year: 2100, value: 81.7 });
  });

  it("carries the LEAP Wave 8 survey anchors", () => {
    expect(LEAP_WAVE8.expertsMedianYear).toBe(2050);
    expect(LEAP_WAVE8.superforecastersMedianYear).toBe(2047);
    expect(LEAP_WAVE8.participants).toBe(264);
  });

  it("generates a deterministic 200-year world series", () => {
    const a = generateWorldSeries();
    const b = generateWorldSeries();
    expect(a).toEqual(b);
    expect(a).toHaveLength(201); // 2026..2226 inclusive
    expect(a[0]?.year).toBe(2026);
    expect(a[a.length - 1]?.year).toBe(2226);
  });

  it("the generated series starts at the real 2026 values", () => {
    const series = generateWorldSeries();
    const first = series[0];
    expect(first?.lifeExpectancy).toBeGreaterThan(73);
    expect(first?.lifeExpectancy).toBeLessThan(75);
    expect(first?.population).toBeGreaterThan(8);
    expect(first?.population).toBeLessThan(8.2);
  });

  it("life expectancy rises monotonically in the baseline world", () => {
    const series = generateWorldSeries();
    for (let i = 1; i < series.length; i++) {
      const prev = series[i - 1];
      const cur = series[i];
      expect(cur?.lifeExpectancy).toBeGreaterThanOrEqual(prev?.lifeExpectancy ?? 0);
    }
  });
});
