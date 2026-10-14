import { CLOCKS, HALLMARKS, INTERVENTIONS, MILESTONES, SCENARIOS } from "@geistloom/core";

/**
 * The archive corpus — built deterministically from the core
 * domain models. Shared by the (client) browser and the
 * (server) stats so both count the same library.
 */

export type ArchiveKind = "milestone" | "intervention" | "clock" | "hallmark" | "scenario";

export interface ArchiveEntry {
  readonly kind: ArchiveKind;
  readonly title: string;
  readonly body: string;
  readonly year?: number;
  readonly tags: readonly string[];
}

export function buildArchiveCorpus(): readonly ArchiveEntry[] {
  const entries: ArchiveEntry[] = [];

  for (const m of MILESTONES) {
    entries.push({
      kind: "milestone",
      title: m.title,
      body: m.detail,
      year: m.year,
      tags: [m.domain, m.kind],
    });
  }

  for (const iv of INTERVENTIONS) {
    entries.push({
      kind: "intervention",
      title: iv.name,
      body: `${iv.headline} ${iv.origin}`,
      year: iv.adoptionYear,
      tags: [iv.klass, iv.evidence],
    });
  }

  for (const clock of CLOCKS) {
    entries.push({
      kind: "clock",
      title: clock.name,
      body: `${clock.trainingSet} ${clock.strength} ${clock.limitation}`,
      year: clock.year,
      tags: [clock.generation, "epigenetic-clock"],
    });
  }

  for (const hallmark of HALLMARKS) {
    entries.push({
      kind: "hallmark",
      title: hallmark.name,
      body: `${hallmark.summary} ${hallmark.mechanism}`,
      tags: [hallmark.category, hallmark.layer],
    });
  }

  for (const scenario of SCENARIOS) {
    entries.push({
      kind: "scenario",
      title: scenario.name,
      body: `${scenario.tagline} ${scenario.description}`,
      tags: ["future", ...scenario.drivers],
    });
  }

  return entries;
}

export const KIND_ORDER: readonly ArchiveKind[] = [
  "milestone",
  "intervention",
  "clock",
  "hallmark",
  "scenario",
];
