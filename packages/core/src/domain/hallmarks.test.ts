import { describe, expect, it } from "vitest";
import { getHallmark, HALLMARKS, hallmarksByCategory, hallmarksTargetedBy } from "./hallmarks";

describe("hallmarks", () => {
  it("contains exactly the 12 hallmarks of aging (2023 taxonomy)", () => {
    expect(HALLMARKS).toHaveLength(12);
  });

  it("partitions into primary (7), antagonistic (2), integrative (3)", () => {
    expect(hallmarksByCategory("primary")).toHaveLength(7);
    expect(hallmarksByCategory("antagonistic")).toHaveLength(2);
    expect(hallmarksByCategory("integrative")).toHaveLength(3);
  });

  it("every hallmark has unique id, mechanism and measurement", () => {
    const ids = new Set(HALLMARKS.map((h) => h.id));
    expect(ids.size).toBe(12);
    for (const h of HALLMARKS) {
      expect(h.name.length).toBeGreaterThan(3);
      expect(h.mechanism.length).toBeGreaterThan(40);
      expect(h.measuredBy.length).toBeGreaterThan(5);
      expect(h.interventionIds.length).toBeGreaterThan(0);
    }
  });

  it("lookup by id works and returns undefined for unknowns", () => {
    expect(getHallmark("cellular-senescence")?.name).toBe("Cellular senescence");
    expect(getHallmark("nope")).toBeUndefined();
  });

  it("hallmarksTargetedBy maps interventions to hallmarks", () => {
    const targeted = hallmarksTargetedBy("senolytics-dq");
    expect(targeted.length).toBeGreaterThan(0);
    expect(targeted.map((h) => h.id)).toContain("cellular-senescence");
  });
});
