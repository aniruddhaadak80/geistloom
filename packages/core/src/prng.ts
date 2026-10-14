/**
 * Deterministic pseudo-random utilities.
 *
 * Every "intelligence" in Geistloom is a local simulation. These PRNGs are the
 * substrate: same seed → same universe. mulberry32 is a small, fast,
 * statistically decent generator; hashString turns any prompt into a seed.
 */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seedFromString(input: string, salt = 0): number {
  return (hashString(input) ^ Math.imul(salt, 0x9e3779b9)) >>> 0;
}

/** Deterministic pick from a non-empty array. */
export function pickOne<T>(items: readonly T[], rng: () => number): T {
  if (items.length === 0) {
    throw new Error("pickOne requires a non-empty array");
  }
  const index = Math.floor(rng() * items.length);
  return items[index] as T;
}

/** Deterministic shuffle (Fisher–Yates, seeded). */
export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i] as T;
    copy[i] = copy[j] as T;
    copy[j] = tmp;
  }
  return copy;
}

/** Deterministic float in [min, max). */
export function range(min: number, max: number, rng: () => number): number {
  return min + rng() * (max - min);
}

/** Deterministic integer in [min, max]. */
export function intRange(min: number, max: number, rng: () => number): number {
  return Math.floor(range(min, max + 1, rng));
}

/** Deterministic gaussian-ish value in [-1, 1] (sum of three uniforms). */
export function bell(rng: () => number): number {
  return (rng() + rng() + rng()) / 1.5 - 1;
}
