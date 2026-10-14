"use client";

import {
  type EvidenceGrade,
  getHallmark,
  INTERVENTIONS,
  type InterventionClass,
} from "@geistloom/core";
import { Badge, cn } from "@geistloom/ui";
import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

/**
 * The filterable intervention grid.
 *
 * Filters: evidence grade (all/approved/clinical/preclinical/theoretical),
 * class (all + 7 classes), and a name-search box. Each card carries the
 * klass + evidence badges, target-hallmark badges (linking to /hallmarks),
 * the aging-rate-reduction bar, adoption year, risk multiplier, and origin.
 */

const EVIDENCE_TONE: Record<EvidenceGrade, "teal" | "violet" | "amber" | "mist"> = {
  approved: "teal",
  clinical: "violet",
  preclinical: "amber",
  theoretical: "mist",
};

const EVIDENCE_FILTERS: readonly {
  readonly id: EvidenceGrade | "all";
  readonly label: string;
}[] = [
  { id: "all", label: "All evidence" },
  { id: "approved", label: "Approved" },
  { id: "clinical", label: "Clinical" },
  { id: "preclinical", label: "Preclinical" },
  { id: "theoretical", label: "Theoretical" },
];

const KLASS_FILTERS: readonly {
  readonly id: InterventionClass | "all";
  readonly label: string;
}[] = [
  { id: "all", label: "All classes" },
  { id: "gene-therapy", label: "Gene therapy" },
  { id: "gene-editing", label: "Gene editing" },
  { id: "small-molecule", label: "Small molecule" },
  { id: "biologic", label: "Biologic" },
  { id: "cell-therapy", label: "Cell therapy" },
  { id: "device", label: "Device" },
  { id: "protocol", label: "Protocol" },
];

type EvidenceFilter = (typeof EVIDENCE_FILTERS)[number]["id"];
type KlassFilter = (typeof KLASS_FILTERS)[number]["id"];

export function InterventionsGrid({
  selectedId,
  onSelect,
}: {
  readonly selectedId: string | null;
  readonly onSelect: (id: string) => void;
}) {
  const [evidence, setEvidence] = useState<EvidenceFilter>("all");
  const [klass, setKlass] = useState<KlassFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INTERVENTIONS.filter((iv) => {
      if (evidence !== "all" && iv.evidence !== evidence) return false;
      if (klass !== "all" && iv.klass !== klass) return false;
      if (q && !iv.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [evidence, klass, query]);

  return (
    <div className="flex flex-col gap-5">
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
          placeholder="Search by name…"
          aria-label="Search interventions by name"
          className="w-full rounded-lg border border-charcoal bg-abyss-2 py-2 pl-9 pr-3 text-sm text-star-white placeholder:text-mist/60 focus:border-bio-teal focus:outline-none"
        />
      </div>

      {/* evidence filter */}
      <div className="flex flex-wrap gap-1.5">
        {EVIDENCE_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={evidence === f.id}
            onClick={() => setEvidence(f.id)}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-[11px] transition",
              evidence === f.id
                ? "border-bio-teal/60 bg-bio-teal/10 text-bio-teal"
                : "border-charcoal text-mist hover:border-bio-teal/40 hover:text-star-white",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* class filter */}
      <div className="flex flex-wrap gap-1.5">
        {KLASS_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={klass === f.id}
            onClick={() => setKlass(f.id)}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-[11px] transition",
              klass === f.id
                ? "border-genome-violet/60 bg-genome-violet/10 text-genome-violet"
                : "border-charcoal text-mist hover:border-genome-violet/40 hover:text-star-white",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="font-mono text-[11px] uppercase tracking-widest text-mist">
        showing {filtered.length} of {INTERVENTIONS.length} interventions
      </p>

      {filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-charcoal p-8 text-center text-sm text-mist">
          No interventions match — widen the filters.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((iv) => {
          const selected = selectedId === iv.id;
          return (
            <article
              key={iv.id}
              className={cn(
                "flex flex-col gap-3 rounded-xl border bg-abyss-2 p-5 transition",
                selected
                  ? "border-bio-teal shadow-[0_0_0_1px_var(--color-bio-teal)]"
                  : "border-charcoal hover:border-bio-teal/50",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(iv.id)}
                  className="text-left font-display text-lg font-semibold leading-snug text-star-white"
                >
                  {iv.name}
                </button>
                <Badge tone={EVIDENCE_TONE[iv.evidence]}>{iv.evidence}</Badge>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Badge tone="outline">{iv.klass}</Badge>
                {iv.targetHallmarkIds.map((hid) => {
                  const hallmark = getHallmark(hid);
                  return (
                    <Link
                      key={hid}
                      href={`/hallmarks?id=${hid}`}
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <Badge tone="mist">{hallmark?.name ?? hid}</Badge>
                    </Link>
                  );
                })}
              </div>

              <p className="text-sm leading-relaxed text-mist">{iv.headline}</p>

              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between font-mono text-[11px] text-mist">
                  <span>aging-rate reduction</span>
                  <span className="text-bio-teal">{Math.round(iv.agingRateReduction * 100)}%</span>
                </div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-charcoal"
                  role="img"
                  aria-label={`aging rate reduction ${Math.round(iv.agingRateReduction * 100)} percent`}
                >
                  <div
                    className="h-full rounded-full bg-bio-teal"
                    style={{ width: `${iv.agingRateReduction * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between font-mono text-[11px] text-mist">
                <span>adopts {iv.adoptionYear}</span>
                <span>risk ×{iv.riskMultiplier.toFixed(2)}</span>
              </div>

              <p className="text-xs text-mist">{iv.origin}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
