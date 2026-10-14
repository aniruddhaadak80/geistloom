"use client";

import { coverageAt, getHallmark, type Intervention } from "@geistloom/core";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LineChart,
} from "@geistloom/ui";
import { X } from "lucide-react";
import Link from "next/link";

/**
 * Selected-intervention detail panel.
 *
 * Full field sheet, the logistic adoption curve (coverageAt, 2026 → 2126,
 * step 4), and the mechanism map: every hallmark this intervention touches,
 * linked back to the hallmarks route.
 */

const ADOPTION_YEARS: readonly number[] = (() => {
  const years: number[] = [];
  for (let y = 2026; y <= 2126; y += 4) years.push(y);
  return years;
})();

const EVIDENCE_TONE: Record<Intervention["evidence"], "teal" | "violet" | "amber" | "mist"> = {
  approved: "teal",
  clinical: "violet",
  preclinical: "amber",
  theoretical: "mist",
};

export function InterventionDetail({
  intervention,
  onClose,
}: {
  readonly intervention: Intervention | null;
  readonly onClose: () => void;
}) {
  if (!intervention) {
    return (
      <Card className="flex min-h-96 flex-col items-center justify-center lg:sticky lg:top-6">
        <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-mist">
            no intervention selected
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-mist">
            Pick a card from the atlas to inspect its adoption curve and the hallmarks it targets.
          </p>
        </CardContent>
      </Card>
    );
  }

  const points = ADOPTION_YEARS.map((year) => coverageAt(intervention, year));
  const hallmarks = intervention.targetHallmarkIds
    .map((id) => getHallmark(id))
    .filter((h): h is NonNullable<typeof h> => h !== undefined);

  return (
    <Card className="lg:sticky lg:top-6">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <CardTitle>{intervention.name}</CardTitle>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="outline">{intervention.klass}</Badge>
              <Badge tone={EVIDENCE_TONE[intervention.evidence]}>{intervention.evidence}</Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" aria-label="Close detail panel" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <CardDescription>{intervention.headline}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* full field sheet */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div className="flex flex-col">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-mist">
              aging-rate reduction
            </dt>
            <dd className="font-mono text-sm text-bio-teal">
              {Math.round(intervention.agingRateReduction * 100)}%
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-mist">
              adoption year
            </dt>
            <dd className="font-mono text-sm text-star-white">{intervention.adoptionYear}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-mist">
              adoption speed
            </dt>
            <dd className="font-mono text-sm text-star-white">
              {intervention.adoptionSpeed.toFixed(2)}
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-mist">
              risk multiplier
            </dt>
            <dd className="font-mono text-sm text-star-white">
              ×{intervention.riskMultiplier.toFixed(2)}
            </dd>
          </div>
        </dl>

        {/* adoption curve */}
        <div className="flex flex-col gap-2">
          <h4 className="font-mono text-[11px] uppercase tracking-widest text-mist">
            adoption curve · coverage 2026 → 2126
          </h4>
          <LineChart
            series={[{ label: "coverage", points }]}
            labels={ADOPTION_YEARS}
            height={200}
            yLabel="population coverage"
            colors={["#2dd4bf", "#8b5cf6", "#f59e0b"]}
          />
        </div>

        {/* mechanism map */}
        <div className="flex flex-col gap-2">
          <h4 className="font-mono text-[11px] uppercase tracking-widest text-mist">
            which hallmarks does this touch
          </h4>
          {hallmarks.length === 0 && (
            <p className="text-sm text-mist">No hallmark links recorded for this intervention.</p>
          )}
          <div className="flex flex-col gap-3">
            {hallmarks.map((hallmark) => (
              <Link
                key={hallmark.id}
                href={`/hallmarks?id=${hallmark.id}`}
                className="rounded-lg border border-charcoal bg-abyss p-3 transition hover:border-bio-teal/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-semibold text-star-white">
                    {hallmark.name}
                  </span>
                  <Badge tone="outline">{hallmark.category}</Badge>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-mist">{hallmark.mechanism}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-bio-teal">
                  measured by: {hallmark.measuredBy}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <p className="text-xs text-mist">{intervention.origin}</p>
      </CardContent>
    </Card>
  );
}
