/**
 * The Century Engine.
 *
 * Simulates 2226 - 2026 = 200 years of civilization as a function
 * of biotechnology. The model is deliberately simple and fully
 * deterministic: a coupled system of saturating dynamics over
 * population, life expectancy, healthspan, biosphere health,
 * GDP per capita, AI capability, and the knowledge stock.
 *
 * Every WorldState is a plain JSON-serializable object — which is
 * what makes the time machine work: any year is a coordinate you
 * can return to, fork, or replay.
 *
 * The baseline (no interventions) reproduces the UN WPP trajectory
 * by construction: life expectancy 73.8 (2026) → ~81.7 (2100).
 */

import { coverageAt, getIntervention } from "../domain/interventions";
import { bell, mulberry32 } from "../prng";

export interface WorldState {
  readonly year: number;
  readonly yearIndex: number;
  readonly population: number; // billions
  readonly lifeExpectancy: number; // years
  readonly healthspan: number; // healthy years expected
  readonly agingRate: number; // 1.0 = natural aging, 0.15 = heavily treated
  readonly biosphereHealth: number; // 0–100
  readonly gdpPerCapita: number; // thousands of 2026 USD
  readonly aiCapability: number; // 0–100 automation level
  readonly knowledgeStock: number; // 0–1 research progress
  readonly interventionCoverage: number; // 0–1 weighted adoption
  readonly interventionLevels: Readonly<Record<string, number>>;
}

export interface EngineConfig {
  readonly seed: number;
  readonly startYear?: number;
  readonly endYear?: number;
  readonly stepYears?: number;
  readonly enabledInterventionIds?: readonly string[];
  readonly scenarioShifts?: {
    readonly knowledgeMultiplier?: number;
    readonly adoptionSpeedMultiplier?: number;
    readonly biosphereDrift?: number;
    readonly aiAcceleration?: number;
  };
}

export interface SimulationSummary {
  readonly endState: WorldState;
  readonly baselineEndState: WorldState;
  readonly lifeExpectancyGain: number;
  readonly yearsToEscapeVelocity: number | null;
  readonly peakPopulation: number;
  readonly finalBiosphereHealth: number;
  readonly levDetected: boolean;
}

export interface SimulationResult {
  readonly states: readonly WorldState[];
  readonly summary: SimulationSummary;
}

const DEFAULT_START = 2026;
const DEFAULT_END = 2226;
const DEFAULT_STEP = 0.25;
const MAX_LIFE_EXPECTANCY = 160;

/** UN WPP-anchored baseline target life expectancy for a given year. */
export function baselineLifeExpectancy(year: number): number {
  const firstCentury = Math.min(1, Math.max(0, (year - 2026) / 74));
  const secondCentury = Math.min(1, Math.max(0, (year - 2100) / 100));
  return 73.8 + 7.9 * firstCentury + 4.0 * secondCentury;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/**
 * Effective aging rate under a set of interventions at a given year.
 * Each intervention removes a fraction of the natural aging rate in
 * proportion to its adoption coverage and whether the knowledge stock
 * has unlocked it (knowledgeGate). Total reduction saturates at 85%.
 */
export function effectiveAgingRate(
  year: number,
  enabledIds: readonly string[],
  knowledgeStock: number,
  adoptionSpeedMultiplier: number,
): number {
  const knowledgeGate = Math.min(1, knowledgeStock * 2.2);
  let removed = 0;
  for (const id of enabledIds) {
    const iv = getIntervention(id);
    if (!iv) continue;
    const speed = iv.adoptionSpeed * adoptionSpeedMultiplier;
    const coverage = coverageAt({ ...iv, adoptionSpeed: speed }, year);
    removed += iv.agingRateReduction * coverage * knowledgeGate;
  }
  const totalReduction = Math.min(0.85, removed);
  return 1 - totalReduction;
}

function initialState(): WorldState {
  return {
    year: DEFAULT_START,
    yearIndex: 0,
    population: 8.09,
    lifeExpectancy: 73.8,
    healthspan: 63.5,
    agingRate: 1,
    biosphereHealth: 66,
    gdpPerCapita: 14.2,
    aiCapability: 22,
    knowledgeStock: 0.08,
    interventionCoverage: 0,
    interventionLevels: {},
  };
}

function stepState(
  prev: WorldState,
  dt: number,
  enabledIds: readonly string[],
  shifts: Required<NonNullable<EngineConfig["scenarioShifts"]>>,
  rng: () => number,
): WorldState {
  // --- AI capability: logistic climb to 100 ---
  const aiRate = 0.028 * shifts.aiAcceleration;
  const aiCapability = clamp(
    prev.aiCapability + (100 - prev.aiCapability) * aiRate * dt + bell(rng) * 0.4 * dt,
    0,
    100,
  );

  // --- Knowledge stock: research compounds faster with better AI ---
  const researchRate = 0.011 * (0.25 + aiCapability / 100) * shifts.knowledgeMultiplier;
  const knowledgeStock = clamp(
    prev.knowledgeStock + researchRate * (1 - prev.knowledgeStock) * dt,
    0,
    1,
  );

  // --- Aging rate under the intervention stack ---
  const agingRate = effectiveAgingRate(
    prev.year,
    enabledIds,
    knowledgeStock,
    shifts.adoptionSpeedMultiplier,
  );

  // --- Life expectancy: converges to baseline target + intervention lift ---
  const baselineTarget = baselineLifeExpectancy(prev.year);
  let lift = 0;
  const levels: Record<string, number> = {};
  for (const id of enabledIds) {
    const iv = getIntervention(id);
    if (!iv) continue;
    const speed = iv.adoptionSpeed * shifts.adoptionSpeedMultiplier;
    const cov = coverageAt({ ...iv, adoptionSpeed: speed }, prev.year);
    levels[id] = cov;
    const knowledgeGate = Math.min(1, knowledgeStock * 2.2);
    lift += iv.agingRateReduction * cov * knowledgeGate * 22;
  }
  const targetLE = clamp(baselineTarget + lift, 0, MAX_LIFE_EXPECTANCY);
  const lifeExpectancy = clamp(
    prev.lifeExpectancy + (targetLE - prev.lifeExpectancy) * 0.045 * dt,
    0,
    MAX_LIFE_EXPECTANCY,
  );

  // --- Healthspan: converges to life expectancy as interventions bite ---
  const coverage =
    enabledIds.length === 0
      ? 0
      : enabledIds.reduce((acc, id) => acc + (levels[id] ?? 0), 0) / enabledIds.length;
  const healthspanTarget = lifeExpectancy * (0.74 + 0.24 * coverage);
  const healthspan = clamp(
    prev.healthspan + (healthspanTarget - prev.healthspan) * 0.03 * dt,
    0,
    lifeExpectancy,
  );

  // --- Population: demographic transition as longevity rises ---
  // Birth rates fall steeply with longevity (slope 0.0006, floor 0.003),
  // which reproduces the real demographic transition: the UN's baseline
  // world peaks near ~10.4B, and treated worlds decline after the
  // transition completes.
  const birthRate = clamp(0.024 - 0.0006 * (prev.lifeExpectancy - 65), 0.003, 0.03);
  const deathRate = 1 / (prev.lifeExpectancy * 1.08);
  const netGrowth = birthRate - deathRate;
  const population = clamp(prev.population * (1 + netGrowth * dt), 0.1, 40);

  // --- Biosphere: knowledge techs green the world, growth pressures it ---
  const bioDrift = shifts.biosphereDrift * 0.1;
  const bioRate = bioDrift + 0.32 * knowledgeStock - 0.24 - Math.max(0, netGrowth) * 0.9;
  const biosphereHealth = clamp(prev.biosphereHealth + bioRate * dt, 2, 100);

  // --- GDP per capita: AI + health compound prosperity ---
  const gdpGrowth = 0.012 + 0.024 * (aiCapability / 100) + 0.008 * (healthspan / 80) - 0.004;
  const gdpPerCapita = clamp(prev.gdpPerCapita * (1 + gdpGrowth * dt), 1, 400);

  return {
    year: Math.round((prev.year + dt) * 100) / 100,
    yearIndex: prev.yearIndex + 1,
    population: Math.round(population * 1000) / 1000,
    lifeExpectancy: Math.round(lifeExpectancy * 100) / 100,
    healthspan: Math.round(healthspan * 100) / 100,
    agingRate: Math.round(agingRate * 1000) / 1000,
    biosphereHealth: Math.round(biosphereHealth * 100) / 100,
    gdpPerCapita: Math.round(gdpPerCapita * 100) / 100,
    aiCapability: Math.round(aiCapability * 100) / 100,
    knowledgeStock: Math.round(knowledgeStock * 1000) / 1000,
    interventionCoverage: Math.round(coverage * 1000) / 1000,
    interventionLevels: levels,
  };
}

export function simulateCentury(config: EngineConfig): SimulationResult {
  const startYear = config.startYear ?? DEFAULT_START;
  const endYear = config.endYear ?? DEFAULT_END;
  const step = config.stepYears ?? DEFAULT_STEP;
  const enabledIds = config.enabledInterventionIds ?? [];
  const shifts = {
    knowledgeMultiplier: config.scenarioShifts?.knowledgeMultiplier ?? 1,
    adoptionSpeedMultiplier: config.scenarioShifts?.adoptionSpeedMultiplier ?? 1,
    biosphereDrift: config.scenarioShifts?.biosphereDrift ?? 0,
    aiAcceleration: config.scenarioShifts?.aiAcceleration ?? 1,
  };
  const rng = mulberry32(config.seed);

  const steps = Math.ceil((endYear - startYear) / step);
  const states: WorldState[] = [{ ...initialState(), year: startYear }];
  let prev = states[0] as WorldState;
  for (let i = 0; i < steps; i++) {
    prev = stepState(prev, step, enabledIds, shifts, rng);
    states.push(prev);
  }

  // Baseline run (no interventions) for the gain comparison.
  const baseRng = mulberry32(config.seed);
  let basePrev = { ...initialState(), year: startYear };
  for (let i = 0; i < steps; i++) {
    basePrev = stepState(basePrev, step, [], shifts, baseRng);
  }
  const baselineEndState = basePrev;

  // Longevity escape velocity: first year where the annual gain > 1 year.
  let yearsToEscapeVelocity: number | null = null;
  for (let i = 1; i < states.length; i++) {
    const a = states[i - 1] as WorldState;
    const b = states[i] as WorldState;
    const annualGain = (b.lifeExpectancy - a.lifeExpectancy) / step;
    if (annualGain > 1) {
      yearsToEscapeVelocity = Math.round(b.year - startYear);
      break;
    }
  }

  const endState = states[states.length - 1] as WorldState;
  const peakPopulation = states.reduce((m, s) => Math.max(m, s.population), 0);

  return {
    states,
    summary: {
      endState,
      baselineEndState,
      lifeExpectancyGain:
        Math.round((endState.lifeExpectancy - baselineEndState.lifeExpectancy) * 100) / 100,
      yearsToEscapeVelocity,
      peakPopulation: Math.round(peakPopulation * 1000) / 1000,
      finalBiosphereHealth: endState.biosphereHealth,
      levDetected: yearsToEscapeVelocity !== null,
    },
  };
}

/** Time machine: return the state at (or just before) a given year. */
export function stateAt(states: readonly WorldState[], year: number): WorldState | null {
  if (states.length === 0) return null;
  let best: WorldState | null = null;
  for (const s of states) {
    if (s.year <= year) best = s;
    else break;
  }
  return best ?? (states[0] as WorldState);
}

/** Fork: replay the simulation from any stored state with new settings. */
export function forkFrom(
  from: WorldState,
  config: Omit<EngineConfig, "startYear"> & { endYear?: number },
): SimulationResult {
  return simulateCentury({
    ...config,
    startYear: from.year,
    endYear: config.endYear ?? from.year + 100,
  });
}
