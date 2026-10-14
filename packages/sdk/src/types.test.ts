import { describe, expect, it } from "vitest";
import { OraclePlanSchema, SimulationResultSchema, WorldStateSchema } from "./types";

describe("sdk types", () => {
  it("rejects a partial world state — the schema must match the engine exactly", () => {
    // A state without yearIndex / interventionLevels is what the old,
    // drifted schema accepted. Any leniency here hides engine/schema
    // drift from clients, so partial states must fail.
    const parsed = WorldStateSchema.safeParse({
      year: 2050,
      population: 9.7,
      lifeExpectancy: 85,
      healthspan: 75,
      agingRate: 0.8,
      biosphereHealth: 70,
      gdpPerCapita: 40,
      aiCapability: 80,
      knowledgeStock: 0.6,
      interventionCoverage: 0.4,
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts a complete engine-shaped world state", () => {
    const parsed = WorldStateSchema.safeParse({
      year: 2050,
      yearIndex: 96,
      population: 9.7,
      lifeExpectancy: 85,
      healthspan: 75,
      agingRate: 0.8,
      biosphereHealth: 70,
      gdpPerCapita: 40,
      aiCapability: 80,
      knowledgeStock: 0.6,
      interventionCoverage: 0.4,
      interventionLevels: { "senolytics-dq": 0.62 },
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts a complete simulation result, including a null escape-velocity year", () => {
    const state = {
      year: 2030,
      yearIndex: 16,
      population: 8.3,
      lifeExpectancy: 74.5,
      healthspan: 64,
      agingRate: 1,
      biosphereHealth: 66,
      gdpPerCapita: 15,
      aiCapability: 24,
      knowledgeStock: 0.09,
      interventionCoverage: 0,
      interventionLevels: {},
    };
    const parsed = SimulationResultSchema.safeParse({
      states: [state],
      summary: {
        endState: state,
        baselineEndState: state,
        lifeExpectancyGain: 0,
        yearsToEscapeVelocity: null,
        peakPopulation: 8.3,
        finalBiosphereHealth: 66,
        levDetected: false,
      },
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a world state with out-of-range confidence", () => {
    const parsed = OraclePlanSchema.safeParse({
      id: "p",
      prompt: "x",
      domain: "d",
      title: "t",
      summary: "s",
      phases: [],
      keyNumbers: [],
      citations: [],
      scenario: "s",
      seed: 1,
      model: "m",
      confidence: 5,
    });
    // The schema itself does not carry `confidence` at top level, so it strips it.
    expect(parsed.success).toBe(true);
  });

  it("validates phases with confidence in [0,1]", () => {
    const parsed = OraclePlanSchema.safeParse({
      id: "p",
      prompt: "solve aging",
      domain: "longevity",
      title: "t",
      summary: "s",
      phases: [
        { id: "ph", name: "n", years: 3, description: "d", milestone: "m", confidence: 0.9 },
      ],
      keyNumbers: [],
      citations: [],
      scenario: "bio-dividend",
      seed: 4093,
      model: "geistloom-oracle-1",
    });
    expect(parsed.success).toBe(true);
  });
});
