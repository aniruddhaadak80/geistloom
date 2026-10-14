"use client";

import { getIntervention, HALLMARKS, type Hallmark, type HallmarkCategory } from "@geistloom/core";
import { Badge, type BadgeTone } from "@geistloom/ui";
import { X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { HallmarkDetail } from "./hallmark-detail";

type CategoryFilter = "all" | HallmarkCategory;

const FILTERS: readonly { readonly id: CategoryFilter; readonly label: string }[] = [
  { id: "all", label: "All twelve" },
  { id: "primary", label: "Primary" },
  { id: "antagonistic", label: "Antagonistic" },
  { id: "integrative", label: "Integrative" },
];

const CATEGORY_TONE: Record<HallmarkCategory, BadgeTone> = {
  primary: "teal",
  antagonistic: "violet",
  integrative: "amber",
};

export function HallmarkGrid() {
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visible: readonly Hallmark[] =
    filter === "all" ? HALLMARKS : HALLMARKS.filter((h) => h.category === filter);
  const selected = selectedId ? (HALLMARKS.find((h) => h.id === selectedId) ?? null) : null;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={
              filter === f.id
                ? "rounded-full border border-bio-teal bg-bio-teal/10 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-bio-teal"
                : "rounded-full border border-charcoal px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-mist transition hover:border-bio-teal/50 hover:text-star-white"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {selected && (
        <div className="relative">
          <button
            type="button"
            aria-label="Close hallmark detail"
            onClick={() => setSelectedId(null)}
            className="absolute right-0 top-0 z-10 rounded-full border border-charcoal bg-abyss p-1.5 text-mist transition hover:border-bio-teal hover:text-bio-teal"
          >
            <X className="h-4 w-4" />
          </button>
          <HallmarkDetail hallmark={selected} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((hallmark) => (
          <article
            key={hallmark.id}
            className="group flex flex-col gap-2 rounded-xl border border-charcoal bg-abyss-2 p-5 transition hover:border-bio-teal"
          >
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                aria-expanded={selectedId === hallmark.id}
                onClick={() => setSelectedId((prev) => (prev === hallmark.id ? null : hallmark.id))}
                className="text-left"
              >
                <h3 className="font-display text-lg font-semibold tracking-tight text-star-white group-hover:text-bio-teal">
                  {hallmark.name}
                </h3>
              </button>
              <Badge tone={CATEGORY_TONE[hallmark.category]}>{hallmark.category}</Badge>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-mist">
              {hallmark.layer} layer
            </p>
            <p className="text-sm leading-relaxed text-star-white/90">{hallmark.summary}</p>
            <p className="text-sm leading-relaxed text-mist">{hallmark.mechanism}</p>
            <p className="mt-1 font-mono text-xs leading-relaxed text-mist">
              Measured by <span className="text-star-white/80">{hallmark.measuredBy}</span>
            </p>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
              {hallmark.interventionIds.map((id) => {
                const intervention = getIntervention(id);
                if (!intervention) return null;
                return (
                  <Link
                    key={id}
                    href={`/interventions?id=${id}`}
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <Badge tone="outline" className="transition group-hover:border-bio-teal/40">
                      {intervention.name}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
