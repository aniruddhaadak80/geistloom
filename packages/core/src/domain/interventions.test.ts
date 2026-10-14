import { describe, expect, it } from "vitest";
import { HALLMARKS } from "./hallmarks";
import {
  coverageAt,
  getIntervention,
  INTERVENTIONS,
  interventionsByEvidence,
  interventionsForHallmark,
} from "./interventions";

describe("interventions", () => {
  it("atlas carries 32 interventions", () => {
    expect(INTERVENTIONS).toHaveLength(32);
  });

  it("ids are unique", () => {
    const ids = new Set(INTERVENTIONS.map((i) => i.id));
    expect(ids.size).toBe(INTERVENTIONS.length);
  });

  it("every intervention targets real hallmarks", () => {
    const valid = new Set(HALLMARKS.map((h) => h.id));
    for (const iv of INTERVENTIONS) {
      expect(iv.targetHallmarkIds.length).toBeGreaterThan(0);
      for (const hid of iv.targetHallmarkIds) {
        expect(valid.has(hid)).toBe(true);
      }
      expect(iv.agingRateReduction).toBeGreaterThanOrEqual(0);
      expect(iv.agingRateReduction).toBeLessThanOrEqual(0.9);
      expect(iv.riskMultiplier).toBeGreaterThanOrEqual(1);
      expect(iv.adoptionYear).toBeGreaterThanOrEqual(2026);
    }
  });

  it("evidence grades span the translatability ladder", () => {
    expect(interventionsByEvidence("approved").length).toBeGreaterThanOrEqual(0);
    expect(interventionsByEvidence("clinical").length).toBeGreaterThan(5);
    expect(interventionsByEvidence("preclinical").length).toBeGreaterThan(5);
    expect(interventionsByEvidence("theoretical").length).toBeGreaterThanOrEqual(0);
  });

  it("coverageAt is 0 before adoption and rises monotonically after", () => {
    const iv = getIntervention("senolytics-dq");
    expect(iv).toBeDefined();
    if (!iv) return;
    expect(coverageAt(iv, iv.adoptionYear - 1)).toBe(0);
    expect(coverageAt(iv, iv.adoptionYear)).toBeGreaterThan(0);
    const c1 = coverageAt(iv, 2035);
    const c2 = coverageAt(iv, 2045);
    const c3 = coverageAt(iv, 2060);
    expect(c2).toBeGreaterThan(c1);
    expect(c3).toBeGreaterThan(c2);
    expect(c3).toBeLessThanOrEqual(0.92);
  });

  it("interventionsForHallmark finds the senolytics for senescence", () => {
    const ivs = interventionsForHallmark("cellular-senescence");
    expect(ivs.map((i) => i.id)).toContain("senolytics-dq");
    expect(ivs.map((i) => i.id)).toContain("fisetin");
  });

  it("every intervention headline and origin is populated", () => {
    for (const iv of INTERVENTIONS) {
      expect(iv.headline.length).toBeGreaterThan(10);
      expect(iv.origin.length).toBeGreaterThan(10);
    }
  });
});
