/**
 * Gene-drive population dynamics.
 *
 * A deterministic three-allele model (wild / drive / resistant)
 * following the standard homing-drive literature (Esvelt, Church;
 * Unckless, Clark & Messer): each generation, the drive converts
 * wild-type alleles into drive copies at `driveEfficiency`, a
 * fraction of cleavages instead produce resistant alleles at
 * `resistanceRate`, and drive homozygotes pay a `fitnessCost`.
 *
 * This is the engine behind /gene-drive — the route that makes
 * population-scale genetic engineering concrete instead of magical.
 */

export interface GeneDriveParams {
  /** Probability a wild-type allele is converted to drive (homing). */
  readonly driveEfficiency: number;
  /** Probability a cleavage yields a resistant allele instead. */
  readonly resistanceRate: number;
  /** Fitness cost paid by drive homozygotes (0–1). */
  readonly fitnessCost: number;
  /** Starting drive frequency (0–1). */
  readonly initialFrequency: number;
  /** Generations to simulate. */
  readonly generations: number;
}

export interface GeneDriveState {
  readonly generation: number;
  readonly wildFrequency: number;
  readonly driveFrequency: number;
  readonly resistantFrequency: number;
  readonly meanFitness: number;
}

export const DEFAULT_GENE_DRIVE_PARAMS: GeneDriveParams = {
  driveEfficiency: 0.95,
  resistanceRate: 0.02,
  fitnessCost: 0.05,
  initialFrequency: 0.01,
  generations: 60,
};

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

export function nextGeneration(
  state: { wildFrequency: number; driveFrequency: number; resistantFrequency: number },
  params: Pick<GeneDriveParams, "driveEfficiency" | "resistanceRate" | "fitnessCost">,
): { wildFrequency: number; driveFrequency: number; resistantFrequency: number } {
  const { wildFrequency: w, driveFrequency: d, resistantFrequency: r } = state;
  const e = params.driveEfficiency;
  const res = params.resistanceRate;

  // Homing: drive copies itself into wild-type alleles of drive/wild heterozygotes.
  // Conversions are capped at the available wild frequency — you cannot convert
  // more wild alleles than exist, which keeps the population mass conserved.
  const heterozygoteFraction = 2 * w * d;
  const conversions = Math.min(w, e * heterozygoteFraction);
  const newResistances = res * conversions;

  const wNext = w - conversions;
  const dNext = d + conversions - newResistances;
  const rNext = r + newResistances;

  // Selection: drive homozygotes pay the fitness cost.
  const meanFitnessRaw =
    wNext * wNext +
    2 * wNext * dNext +
    2 * wNext * rNext +
    2 * dNext * rNext +
    rNext * rNext +
    dNext * dNext * (1 - params.fitnessCost);
  const safeMean = meanFitnessRaw > 0 ? meanFitnessRaw : 1;
  const driveSelection = dNext * (1 - params.fitnessCost * dNext);
  const wSel = wNext / safeMean;
  const dSel = driveSelection / safeMean;
  const rSel = rNext / safeMean;

  const total = wSel + dSel + rSel;
  const safeTotal = total > 0 ? total : 1;
  return {
    wildFrequency: clamp01(wSel / safeTotal),
    driveFrequency: clamp01(dSel / safeTotal),
    resistantFrequency: clamp01(rSel / safeTotal),
  };
}

export function meanFitnessOf(
  state: { wildFrequency: number; driveFrequency: number; resistantFrequency: number },
  fitnessCost: number,
): number {
  const { wildFrequency: w, driveFrequency: d, resistantFrequency: r } = state;
  return clamp01(w * w + 2 * w * d + 2 * w * r + 2 * d * r + r * r + d * d * (1 - fitnessCost));
}

export function simulateGeneDrive(
  params: Partial<GeneDriveParams> = {},
): readonly GeneDriveState[] {
  const p = { ...DEFAULT_GENE_DRIVE_PARAMS, ...params };
  const states: GeneDriveState[] = [];
  let current = {
    wildFrequency: clamp01(1 - p.initialFrequency),
    driveFrequency: clamp01(p.initialFrequency),
    resistantFrequency: 0,
  };
  states.push({
    generation: 0,
    wildFrequency: current.wildFrequency,
    driveFrequency: current.driveFrequency,
    resistantFrequency: current.resistantFrequency,
    meanFitness: meanFitnessOf(current, p.fitnessCost),
  });
  for (let g = 1; g <= p.generations; g++) {
    current = nextGeneration(current, p);
    states.push({
      generation: g,
      wildFrequency: Math.round(current.wildFrequency * 10000) / 10000,
      driveFrequency: Math.round(current.driveFrequency * 10000) / 10000,
      resistantFrequency: Math.round(current.resistantFrequency * 10000) / 10000,
      meanFitness: Math.round(meanFitnessOf(current, p.fitnessCost) * 10000) / 10000,
    });
  }
  return states;
}

/** Generations until drive frequency crosses a threshold (null if never). */
export function timeToFrequency(
  params: Partial<GeneDriveParams> = {},
  threshold = 0.9,
): number | null {
  const states = simulateGeneDrive(params);
  for (const s of states) {
    if (s.driveFrequency >= threshold) return s.generation;
  }
  return null;
}

/**
 * Resistance horizon: first generation where resistant alleles exceed
 * the drive. High resistanceRate + high fitness cost = drive dies out.
 */
export function resistanceTakeover(params: Partial<GeneDriveParams> = {}): number | null {
  const states = simulateGeneDrive(params);
  for (const s of states) {
    if (s.resistantFrequency > s.driveFrequency && s.resistantFrequency > 0.01) {
      return s.generation;
    }
  }
  return null;
}
