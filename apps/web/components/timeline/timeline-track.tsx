"use client";

import { MILESTONES, type Milestone } from "@geistloom/core";
import { Badge, cn } from "@geistloom/ui";
import { useState } from "react";

/**
 * The vertical milestone track, 2012 → 2100.
 *
 * History entries: solid node, full detail. Projection entries: dashed
 * node, confidence badge (amber < 0.5, violet otherwise) + PROJECTION tag.
 * Domain filtering is interactive — hence the client boundary.
 */

const DOMAIN_FILTERS: readonly {
  readonly id: string;
  readonly label: string;
}[] = [
  { id: "all", label: "All domains" },
  { id: "genetic-engineering", label: "Genetic engineering" },
  { id: "longevity", label: "Longevity" },
  { id: "ai-science", label: "AI for science" },
  { id: "demography", label: "Demography" },
  { id: "governance", label: "Governance" },
];

type DomainFilter = (typeof DOMAIN_FILTERS)[number]["id"];

const DOMAIN_TONE: Record<
  Exclude<DomainFilter, "all">,
  "violet" | "teal" | "amber" | "mist" | "outline"
> = {
  "genetic-engineering": "violet",
  longevity: "teal",
  "ai-science": "amber",
  demography: "mist",
  governance: "outline",
};

const SORTED: readonly Milestone[] = [...MILESTONES].sort((a, b) => a.year - b.year);

export function TimelineTrack() {
  const [domain, setDomain] = useState<DomainFilter>("all");
  const filtered = domain === "all" ? SORTED : SORTED.filter((m) => m.domain === domain);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-1.5">
        {DOMAIN_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={domain === f.id}
            onClick={() => setDomain(f.id)}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-[11px] transition",
              domain === f.id
                ? "border-bio-teal/60 bg-bio-teal/10 text-bio-teal"
                : "border-charcoal text-mist hover:border-bio-teal/40 hover:text-star-white",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ol className="relative ml-2 border-l border-charcoal pl-0">
        {filtered.map((m) => {
          const isProjection = m.kind === "projection";
          const confidencePct = Math.round(m.confidence * 100);
          return (
            <li key={m.id} className="relative pb-8 pl-8 last:pb-0">
              {/* node */}
              <span
                aria-hidden
                className={cn(
                  "absolute -left-[9px] top-1.5 h-4 w-4 rounded-full",
                  isProjection
                    ? "border-2 border-dashed border-genome-violet bg-abyss"
                    : "border-2 border-abyss bg-bio-teal",
                )}
              />
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-semibold text-star-white">{m.year}</span>
                <Badge tone={DOMAIN_TONE[m.domain]}>{m.domain}</Badge>
                {isProjection && (
                  <>
                    <Badge tone="outline">PROJECTION</Badge>
                    <Badge tone={m.confidence < 0.5 ? "amber" : "violet"}>
                      {confidencePct}% confidence
                    </Badge>
                  </>
                )}
              </div>
              <h3 className="mt-1.5 font-display text-lg font-semibold text-star-white">
                {m.title}
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-mist">{m.detail}</p>
            </li>
          );
        })}
      </ol>

      {filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-charcoal p-8 text-center text-sm text-mist">
          No milestones in this domain.
        </p>
      )}
    </section>
  );
}
