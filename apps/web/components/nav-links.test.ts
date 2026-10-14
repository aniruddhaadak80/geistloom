import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ROUTES } from "./nav-links";

const appDir = fileURLToPath(new URL("../app/", import.meta.url));

/**
 * The nav bar, the mobile menu and the command palette all read ROUTES,
 * and the e2e suite walks every one of these links — so a drift between
 * this table and the router is a real bug class. These tests make that
 * drift impossible without a red suite.
 */
describe("ROUTES", () => {
  it("lists exactly the twelve surfaces of the world-frame", () => {
    expect(ROUTES).toHaveLength(12);
  });

  it("uses unique absolute hrefs", () => {
    const hrefs = ROUTES.map((r) => r.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const href of hrefs) {
      expect(href.startsWith("/")).toBe(true);
    }
  });

  it("gives every route a label and a blurb worth reading", () => {
    for (const route of ROUTES) {
      expect(route.label.length).toBeGreaterThan(2);
      expect(route.blurb.length).toBeGreaterThan(20);
    }
  });

  it("has a real page.tsx on disk for every href", () => {
    for (const route of ROUTES) {
      const slug = route.href.replace(/^\//, "");
      expect(existsSync(`${appDir}${slug}/page.tsx`)).toBe(true);
    }
  });
});
