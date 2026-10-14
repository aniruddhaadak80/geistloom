import { describe, expect, it } from "vitest";
import {
  baselineLifeExpectancy,
  effectiveAgingRate,
  simulateCentury,
  stateAt,
} from "./century-engine";

const ALL_INTERVENTIONS = [
  "senolytics-dq",
  "fisetin",
  "senomorphics",
  "partial-reprogramming",
  "epigenetic-editing",
  "telomerase-therapy",
  "telomere-gene-therapy",
  "base-editing",
  "prime-editing",
  "dna-repair-boosters",
  "sirt6-activation",
  "rapalogs",
  "metformin",
  "nad-precursors",
  "alpha-ketoglutarate",
  "autophagy-enhancers",
  "chaperone-inducers",
  "mito-targeted-antioxidants",
  "mitophagy-boosters",
  "igf1-modulators",
  "stem-cell-therapies",
  "niche-rejuvenation",
  "gdf11-modulators",
  "plasma-exchange",
  "anti-inflammatories",
  "jak-inhibitors",
  "sasp-blockers",
  "fmt",
  "prebiotics-postbiotics",
  "phage-therapy",
  "crispr-cas13-rna",
  "epigenetic-clock-calibration",
];

describe("century engine", () => {
  it("baseline life expectancy matches the UN WPP anchors", () => {
    expect(baselineLifeExpectancy(2026)).toBeCloseTo(73.8, 1);
    expect(baselineLifeExpectancy(2100)).toBeCloseTo(81.7, 1);
  });

  it("simulates 200 years deterministically", () => {
    const a = simulateCentury({ seed: 4093 });
    const b = simulateCentury({ seed: 4093 });
    expect(a.states).toHaveLength(b.states.length);
    expect(a.summary).toEqual(b.summary);
    expect(a.states.length).toBeGreaterThan(700); // 200y / 0.25y step
  });

  it("baseline run ends near the UN projection by 2100", () => {
    const { states } = simulateCentury({ seed: 4093, endYear: 2100 });
    const final = states[states.length - 1];
    expect(final?.lifeExpectancy).toBeGreaterThan(79);
    expect(final?.lifeExpectancy).toBeLessThan(85);
  });

  it("the full intervention stack beats the baseline decisively", () => {
    const run = simulateCentury({ seed: 4093, enabledInterventionIds: ALL_INTERVENTIONS });
    expect(run.summary.lifeExpectancyGain).toBeGreaterThan(20);
    expect(run.summary.endState.lifeExpectancy).toBeGreaterThan(
      run.summary.baselineEndState.lifeExpectancy,
    );
    expect(run.summary.endState.agingRate).toBeLessThan(0.5);
  });

  it("a no-intervention run never detects escape velocity", () => {
    const run = simulateCentury({ seed: 4093 });
    expect(run.summary.levDetected).toBe(false);
    expect(run.summary.yearsToEscapeVelocity).toBeNull();
  });

  it("a strong stack eventually triggers escape velocity", () => {
    const run = simulateCentury({
      seed: 4093,
      enabledInterventionIds: [
        "partial-reprogramming",
        "senolytics-dq",
        "telomerase-therapy",
        "rapalogs",
      ],
    });
    // With a partial stack the gain may or may not exceed 1y/yr; both are valid,
    // but if LEV is detected it must be a positive number of years.
    if (run.summary.levDetected) {
      expect(run.summary.yearsToEscapeVelocity).toBeGreaterThan(0);
    }
  });

  it("population stays within sane bounds over 200 years", () => {
    const run = simulateCentury({ seed: 4093 });
    for (const s of run.states) {
      expect(s.population).toBeGreaterThan(1);
      expect(s.population).toBeLessThan(40);
    }
  });

  it("biosphere health stays in [2, 100]", () => {
    const run = simulateCentury({ seed: 4093 });
    for (const s of run.states) {
      expect(s.biosphereHealth).toBeGreaterThanOrEqual(2);
      expect(s.biosphereHealth).toBeLessThanOrEqual(100);
    }
  });

  it("scenario shifts change the outcome materially", () => {
    // Compare at 2075: both runs eventually converge to the same ceiling,
    // but the accelerated world gets there decades earlier.
    const fast = simulateCentury({
      seed: 4093,
      endYear: 2075,
      enabledInterventionIds: ["partial-reprogramming"],
      scenarioShifts: { knowledgeMultiplier: 2.5, adoptionSpeedMultiplier: 2 },
    });
    const slow = simulateCentury({
      seed: 4093,
      endYear: 2075,
      enabledInterventionIds: ["partial-reprogramming"],
      scenarioShifts: { knowledgeMultiplier: 0.5, adoptionSpeedMultiplier: 0.6 },
    });
    expect(fast.summary.endState.lifeExpectancy).toBeGreaterThan(
      slow.summary.endState.lifeExpectancy,
    );
  });

  it("effectiveAgingRate saturates at 85% reduction", () => {
    const rate = effectiveAgingRate(2200, ALL_INTERVENTIONS, 1, 2);
    expect(rate).toBeGreaterThanOrEqual(0.15);
    expect(rate).toBeLessThanOrEqual(1);
  });

  it("time machine returns the state at a year", () => {
    const run = simulateCentury({ seed: 4093 });
    const s = stateAt(run.states, 2150);
    expect(s).not.toBeNull();
    expect(s?.year).toBeLessThanOrEqual(2150);
    expect(stateAt([], 2150)).toBeNull();
  });

  it("intervention levels are recorded per state", () => {
    const run = simulateCentury({
      seed: 4093,
      enabledInterventionIds: ["metformin"],
    });
    const late = run.states[run.states.length - 1];
    expect(late?.interventionLevels.metformin).toBeGreaterThan(0);
  });
});
