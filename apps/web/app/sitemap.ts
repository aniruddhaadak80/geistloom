import { CLOCKS, HALLMARKS, INTERVENTIONS, SCENARIOS } from "@geistloom/core";
import type { MetadataRoute } from "next";

/**
 * The sitemap is generated from the same domain sources as the routes:
 * 13 hand-written routes plus every explorer detail id. Adding an
 * intervention to the atlas adds its URL here automatically.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const staticRoutes = [
    "",
    "/oracle",
    "/century",
    "/hallmarks",
    "/interventions",
    "/clocks",
    "/gene-drive",
    "/timeline",
    "/scenarios",
    "/worldboard",
    "/ethics",
    "/archive",
    "/lab",
  ].map((path) => ({
    url: `${base}${path === "" ? "" : path}`,
    lastModified: new Date("2026-10-13"),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const explorer = [
    ...HALLMARKS.map((h) => `/explorer/hallmarks/${h.id}`),
    ...INTERVENTIONS.map((i) => `/explorer/interventions/${i.id}`),
    ...CLOCKS.map((c) => `/explorer/clocks/${c.id}`),
    ...SCENARIOS.map((s) => `/explorer/scenarios/${s.id}`),
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date("2026-10-13"),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...explorer];
}
