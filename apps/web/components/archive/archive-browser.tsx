"use client";

import { Badge, cn } from "@geistloom/ui";
import {
  BookOpen,
  Clock3,
  Dna,
  FlaskConical,
  type LucideIcon,
  Microscope,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { type ArchiveKind, buildArchiveCorpus, KIND_ORDER } from "./archive-corpus";

/**
 * The searchable archive browser.
 *
 * Corpus is built client-side from core data (see archive-corpus).
 * Search filters by case-insensitive substring over title, body,
 * and tags; kind buttons filter by entry type.
 */

const KIND_META: Record<ArchiveKind, { label: string; icon: LucideIcon }> = {
  milestone: { label: "Milestones", icon: BookOpen },
  intervention: { label: "Interventions", icon: FlaskConical },
  clock: { label: "Clocks", icon: Clock3 },
  hallmark: { label: "Hallmarks", icon: Dna },
  scenario: { label: "Scenarios", icon: Microscope },
};

type KindFilter = ArchiveKind | "all";

export function ArchiveBrowser() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");

  const corpus = useMemo(() => buildArchiveCorpus(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return corpus.filter((entry) => {
      if (kind !== "all" && entry.kind !== kind) return false;
      if (!q) return true;
      const haystack = `${entry.title} ${entry.body} ${entry.tags.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [corpus, query, kind]);

  return (
    <section className="flex flex-col gap-5">
      {/* search */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search the library — try 'telomere', 'mortality', 'drive'…"
          aria-label="Search the archive"
          className="w-full rounded-lg border border-charcoal bg-abyss-2 py-2 pl-9 pr-3 text-sm text-star-white placeholder:text-mist/60 focus:border-bio-teal focus:outline-none"
        />
      </div>

      {/* kind filters */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          aria-pressed={kind === "all"}
          onClick={() => setKind("all")}
          className={cn(
            "rounded-full border px-3 py-1 font-mono text-[11px] transition",
            kind === "all"
              ? "border-bio-teal/60 bg-bio-teal/10 text-bio-teal"
              : "border-charcoal text-mist hover:text-star-white",
          )}
        >
          All ({corpus.length})
        </button>
        {KIND_ORDER.map((k) => {
          const Icon = KIND_META[k].icon;
          const count = corpus.filter((e) => e.kind === k).length;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] transition",
                kind === k
                  ? "border-bio-teal/60 bg-bio-teal/10 text-bio-teal"
                  : "border-charcoal text-mist hover:text-star-white",
              )}
            >
              <Icon className="h-3 w-3" aria-hidden />
              {KIND_META[k].label} ({count})
            </button>
          );
        })}
      </div>

      <p className="font-mono text-[11px] uppercase tracking-widest text-mist">
        {filtered.length} entries
      </p>

      {filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-charcoal p-8 text-center text-sm text-mist">
          Nothing in the library matches — the corpus is finite and fully deterministic, so the term
          simply isn&apos;t in the frame yet.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((entry) => {
          const Icon = KIND_META[entry.kind].icon;
          return (
            <article
              key={`${entry.kind}-${entry.title}`}
              className="flex flex-col gap-2.5 rounded-xl border border-charcoal bg-abyss-2 p-5 transition hover:border-bio-teal/40"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-mist">
                  <Icon className="h-4 w-4" aria-hidden />
                  <span className="font-mono text-[10px] uppercase tracking-widest">
                    {entry.kind}
                  </span>
                </span>
                {entry.year !== undefined && (
                  <span className="font-mono text-[11px] text-mist">{entry.year}</span>
                )}
              </div>
              <h3 className="font-display text-base font-semibold text-star-white">
                {entry.title}
              </h3>
              <p className="text-sm leading-relaxed text-mist">{entry.body}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                {entry.tags.map((tag) => (
                  <Badge key={tag} tone="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
