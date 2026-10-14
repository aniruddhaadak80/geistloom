import { describe, expect, it } from "vitest";
import {
  bell,
  hashString,
  intRange,
  mulberry32,
  pickOne,
  range,
  seedFromString,
  shuffle,
} from "./prng";

describe("prng", () => {
  it("mulberry32 is deterministic for a given seed", () => {
    const a = mulberry32(4093);
    const b = mulberry32(4093);
    for (let i = 0; i < 100; i++) {
      expect(a()).toBe(b());
    }
  });

  it("different seeds produce different streams", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const av = Array.from({ length: 10 }, () => a());
    const bv = Array.from({ length: 10 }, () => b());
    expect(av).not.toEqual(bv);
  });

  it("values are in [0, 1)", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("hashString is stable", () => {
    expect(hashString("solve aging")).toBe(hashString("solve aging"));
    expect(hashString("solve aging")).not.toBe(hashString("solve aginx"));
  });

  it("seedFromString mixes salt", () => {
    expect(seedFromString("x", 0)).not.toBe(seedFromString("x", 1));
  });

  it("pickOne returns an element and respects determinism", () => {
    const items = ["a", "b", "c", "d"] as const;
    expect(items).toContain(pickOne(items, mulberry32(42)));
    const r1 = mulberry32(42);
    const r2 = mulberry32(42);
    expect(pickOne(items, r1)).toBe(pickOne(items, r2));
  });

  it("pickOne throws on empty input", () => {
    expect(() => pickOne([], mulberry32(1))).toThrow();
  });

  it("shuffle preserves elements and is deterministic", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const s1 = shuffle(items, mulberry32(9));
    const s2 = shuffle(items, mulberry32(9));
    expect(s1).toEqual(s2);
    expect([...s1].sort((a, b) => a - b)).toEqual(items);
  });

  it("range and intRange respect bounds", () => {
    const rng = mulberry32(5);
    for (let i = 0; i < 200; i++) {
      const f = range(2, 8, rng);
      expect(f).toBeGreaterThanOrEqual(2);
      expect(f).toBeLessThan(8);
      const n = intRange(2, 8, rng);
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(8);
    }
  });

  it("bell stays within [-1, 1]", () => {
    const rng = mulberry32(11);
    for (let i = 0; i < 500; i++) {
      const v = bell(rng);
      expect(v).toBeGreaterThanOrEqual(-1);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});
