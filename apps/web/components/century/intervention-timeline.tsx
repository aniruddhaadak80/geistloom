"use client";

import { coverageAt, getIntervention, type Intervention } from "@geistloom/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@geistloom/ui";

interface InterventionTimelineProps {
  readonly enabledInterventionIds: readonly string[];
  readonly endYear: number;
}

const SPARK_WIDTH = 260;
const SPARK_HEIGHT = 36;
/** Logistic adoption saturates at 0.92 — the sparkline scale. */
const COVERAGE_CAP = 0.92;

function sparkline(intervention: Intervention, endYear: number): string {
  const years: number[] = [];
  for (let year = 2026; year <= endYear; year += 2) {
    years.push(year);
  }
  const step = years.length > 1 ? SPARK_WIDTH / (years.length - 1) : 0;
  return years
    .map((year, index) => {
      const coverage = coverageAt(intervention, year);
      const x = (index * step).toFixed(1);
      const y = (SPARK_HEIGHT - (coverage / COVERAGE_CAP) * SPARK_HEIGHT).toFixed(1);
      return `${x},${y}`;
    })
    .join(" ");
}

export function InterventionTimeline({
  enabledInterventionIds,
  endYear,
}: InterventionTimelineProps) {
  const interventions = enabledInterventionIds
    .map((id) => getIntervention(id))
    .filter((iv): iv is Intervention => iv !== undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Intervention timeline</CardTitle>
        <CardDescription>
          Adoption curves for the enabled stack — coverage over time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {interventions.length === 0 ? (
          <p className="text-sm text-mist">
            No interventions enabled — the world runs on its natural trajectory.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-charcoal">
            {interventions.map((iv) => (
              <div key={iv.id} className="flex items-center gap-4 py-3">
                <div className="w-56 shrink-0">
                  <p className="text-sm font-medium text-star-white">{iv.name}</p>
                  <p className="font-mono text-xs text-mist">
                    adoption {iv.adoptionYear} · −{Math.round(iv.agingRateReduction * 100)}% aging
                    rate
                  </p>
                </div>
                <svg
                  viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
                  className="h-9 flex-1"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <polyline
                    points={sparkline(iv, endYear)}
                    fill="none"
                    stroke="#2dd4bf"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="w-12 text-right font-mono text-xs text-bio-teal">
                  {Math.round(coverageAt(iv, endYear) * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
