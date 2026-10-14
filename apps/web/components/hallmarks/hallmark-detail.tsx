"use client";

import {
  coverageAt,
  type Hallmark,
  type Intervention,
  interventionsForHallmark,
} from "@geistloom/core";
import {
  Badge,
  type BadgeTone,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LineChart,
} from "@geistloom/ui";

const EVIDENCE_TONE: Record<Intervention["evidence"], BadgeTone> = {
  approved: "teal",
  clinical: "amber",
  preclinical: "violet",
  theoretical: "mist",
};

const CATEGORY_TONE: Record<Hallmark["category"], BadgeTone> = {
  primary: "teal",
  antagonistic: "violet",
  integrative: "amber",
};

const ADOPTION_START = 2026;
const ADOPTION_END = 2126;
const ADOPTION_STEP = 4;

const ADOPTION_LABELS: number[] = [];
for (let year = ADOPTION_START; year <= ADOPTION_END; year += ADOPTION_STEP) {
  ADOPTION_LABELS.push(year);
}

function adoptionPoints(intervention: Intervention): readonly number[] {
  const points: number[] = [];
  for (let year = ADOPTION_START; year <= ADOPTION_END; year += ADOPTION_STEP) {
    points.push(coverageAt(intervention, year));
  }
  return points;
}

export function HallmarkDetail({ hallmark }: { readonly hallmark: Hallmark }) {
  const interventions = interventionsForHallmark(hallmark.id);

  return (
    <Card className="border-bio-teal/40">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>{hallmark.name}</CardTitle>
          <Badge tone={CATEGORY_TONE[hallmark.category]}>{hallmark.category}</Badge>
        </div>
        <CardDescription>{hallmark.summary}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-mist">Mechanism</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-star-white/90">
              {hallmark.mechanism}
            </p>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-mist">Measured by</h4>
            <p className="mt-1.5 font-mono text-xs leading-relaxed text-star-white/80">
              {hallmark.measuredBy}
            </p>
            <h4 className="mt-4 font-mono text-xs uppercase tracking-wider text-mist">Layer</h4>
            <p className="mt-1.5 font-mono text-xs text-star-white/80">{hallmark.layer}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-mono text-xs uppercase tracking-wider text-mist">
            Targeting interventions · {interventions.length}
          </h4>
          {interventions.length === 0 && (
            <p className="text-sm text-mist">
              No interventions in the atlas target this hallmark yet.
            </p>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            {interventions.map((iv) => (
              <div
                key={iv.id}
                className="flex flex-col gap-3 rounded-lg border border-charcoal bg-abyss p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-sm font-semibold text-star-white">
                    {iv.name}
                  </span>
                  <Badge tone={EVIDENCE_TONE[iv.evidence]}>{iv.evidence}</Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-mist">
                  <span>
                    aging rate{" "}
                    <span className="text-bio-teal">
                      −{Math.round(iv.agingRateReduction * 100)}%
                    </span>
                  </span>
                  <span>
                    adoption <span className="text-star-white/80">{iv.adoptionYear}</span>
                  </span>
                  <span>{iv.klass}</span>
                </div>
                <LineChart
                  series={[{ label: "Adoption coverage", points: adoptionPoints(iv) }]}
                  labels={ADOPTION_LABELS}
                  height={120}
                  yLabel="coverage"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
