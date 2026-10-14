import { describe, expect, it } from "vitest";
import {
  DEFAULT_GENE_DRIVE_PARAMS,
  nextGeneration,
  resistanceTakeover,
  simulateGeneDrive,
  timeToFrequency,
} from "./gene-drive";

describe("gene drive engine", () => {
  it("an efficient homing drive sweeps the population", () => {
    const states = simulateGeneDrive({ ...DEFAULT_GENE_DRIVE_PARAMS, generations: 60 });
    // The drive fixes fast (peak within 15 generations)...
    const peak = states.reduce((m, s) => Math.max(m, s.driveFrequency), 0);
    const peakGen = states.find((s) => s.driveFrequency === peak)?.generation ?? 0;
    expect(peak).toBeGreaterThan(0.9);
    expect(peakGen).toBeLessThanOrEqual(15);
    // ...and the wild-type allele is driven to near zero.
    expect(states[10]?.wildFrequency).toBeLessThan(0.1);
  });

  it("resistance slowly erodes a fixed drive (fitness-cost dynamics)", () => {
    // Real biology: once the drive fixes, its fitness cost lets even rare
    // resistant alleles outcompete it over long horizons.
    const states = simulateGeneDrive({ ...DEFAULT_GENE_DRIVE_PARAMS, generations: 200 });
    const late = states[states.length - 1];
    expect(late?.resistantFrequency).toBeGreaterThan(0.2);
    expect(late?.driveFrequency).toBeLessThan(states[6]?.driveFrequency ?? 1);
  });

  it("is deterministic run to run", () => {
    const a = simulateGeneDrive({ generations: 40 });
    const b = simulateGeneDrive({ generations: 40 });
    expect(a).toEqual(b);
  });

  it("frequencies always sum to ~1", () => {
    for (const s of simulateGeneDrive({ generations: 50 })) {
      const sum = s.wildFrequency + s.driveFrequency + s.resistantFrequency;
      expect(sum).toBeCloseTo(1, 2);
    }
  });

  it("resistance eventually overtakes a weak drive", () => {
    const takeover = resistanceTakeover({
      driveEfficiency: 0.6,
      resistanceRate: 0.25,
      fitnessCost: 0.3,
      generations: 400,
    });
    expect(takeover).not.toBeNull();
    expect(takeover).toBeGreaterThan(0);
  });

  it("a perfect drive reaches 90% within 20 generations", () => {
    const t = timeToFrequency(
      { driveEfficiency: 0.99, resistanceRate: 0.001, fitnessCost: 0.01, generations: 100 },
      0.9,
    );
    expect(t).not.toBeNull();
    expect(t).toBeLessThanOrEqual(20);
  });

  it("mean fitness declines with drive cost then recovers as drive fixes", () => {
    const states = simulateGeneDrive({ ...DEFAULT_GENE_DRIVE_PARAMS, generations: 60 });
    const mid = states[Math.floor(states.length / 2)];
    const last = states[states.length - 1];
    expect(mid?.meanFitness).toBeLessThan(1);
    expect(last?.meanFitness).toBeGreaterThan(mid?.meanFitness ?? 0);
  });

  it("nextGeneration handles a fixed population", () => {
    const next = nextGeneration(
      { wildFrequency: 0.9, driveFrequency: 0.1, resistantFrequency: 0 },
      { driveEfficiency: 0.95, resistanceRate: 0.02, fitnessCost: 0.05 },
    );
    const sum = next.wildFrequency + next.driveFrequency + next.resistantFrequency;
    expect(sum).toBeCloseTo(1, 2);
    expect(next.driveFrequency).toBeGreaterThan(0.1);
  });
});
