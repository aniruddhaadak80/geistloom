/**
 * Offline seed datasets for Geistloom.
 *
 * The demo never depends on the network: every dataset the
 * app renders is generated deterministically from SEED and
 * committed alongside this package. Real anchors (UN WPP
 * life-expectancy series, LEAP survey numbers) are baked in
 * as the first entries of each series so the simulation starts
 * from reality and diverges only where the model says it should.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mulberry32 } from "@geistloom/core";

export const SEED = 4093;

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(HERE, "data");

/** UN WPP world life expectancy anchors (years, both sexes). */
export const WPP_ANCHORS: ReadonlyArray<{ year: number; value: number }> = [
  { year: 1950, value: 46.4 },
  { year: 1960, value: 52.5 },
  { year: 1970, value: 58.5 },
  { year: 1980, value: 62.9 },
  { year: 1990, value: 64.0 },
  { year: 2000, value: 67.1 },
  { year: 2010, value: 70.0 },
  { year: 2019, value: 72.8 },
  { year: 2026, value: 73.8 },
  { year: 2030, value: 74.4 },
  { year: 2050, value: 77.2 },
  { year: 2100, value: 81.7 },
];

/** LEAP Wave 8 (2026) AGI timeline survey anchors. */
export const LEAP_WAVE8: Readonly<{
  expertsMedianYear: number;
  superforecastersMedianYear: number;
  expertsProbabilityBefore2100: number;
  participants: number;
}> = {
  expertsMedianYear: 2050,
  superforecastersMedianYear: 2047,
  expertsProbabilityBefore2100: 0.8,
  participants: 264,
};

/** Generate the simulated world series 2026→2226 (baseline, no interventions). */
export function generateWorldSeries(): Array<Record<string, number>> {
  const rng = mulberry32(SEED);
  const rows: Array<Record<string, number>> = [];
  let le = 73.8;
  let pop = 8.09;
  for (let year = 2026; year <= 2226; year++) {
    const t = (year - 2026) / 74;
    const baseline =
      73.8 + 7.9 * Math.min(1, t) + 4.0 * Math.min(1, Math.max(0, (year - 2100) / 100));
    le += (baseline - le) * 0.045 + (rng() - 0.5) * 0.02;
    const birthRate = Math.min(0.03, Math.max(0.006, 0.024 - 0.00018 * (le - 65)));
    const deathRate = 1 / (le * 1.08);
    pop *= 1 + (birthRate - deathRate);
    rows.push({
      year,
      lifeExpectancy: Math.round(le * 100) / 100,
      population: Math.round(pop * 1000) / 1000,
    });
  }
  return rows;
}

/** Write the seed JSON datasets into packages/seed/src/data/. */
export function writeSeedDatasets(): void {
  const world = generateWorldSeries();
  const payloads: Array<{ file: string; data: unknown }> = [
    { file: "world-series.json", data: world },
    { file: "wpp-anchors.json", data: WPP_ANCHORS },
    { file: "leap-wave8.json", data: LEAP_WAVE8 },
    {
      file: "manifest.json",
      data: {
        seed: SEED,
        generatedAt: "2026-10-11",
        generator: "packages/seed/seed.ts",
        entries: ["world-series.json", "wpp-anchors.json", "leap-wave8.json"],
      },
    },
  ];
  mkdirSync(DATA_DIR, { recursive: true });
  for (const p of payloads) {
    writeFileSync(join(DATA_DIR, p.file), `${JSON.stringify(p.data, null, 2)}\n`, "utf8");
  }
}
