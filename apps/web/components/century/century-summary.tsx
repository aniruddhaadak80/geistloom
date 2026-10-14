"use client";

import type { SimulationResult } from "@geistloom/core";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@geistloom/ui";

interface CenturySummaryProps {
  readonly result: SimulationResult;
}

function signed(value: number, digits = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;
}

function StatCard({
  label,
  value,
  hint,
}: {
  readonly label: string;
  readonly value: string;
  readonly hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 pt-5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-mist">{label}</span>
        <span className="font-display text-2xl font-semibold tracking-tight text-star-white">
          {value}
        </span>
        {hint && <span className="font-mono text-[11px] text-mist">{hint}</span>}
      </CardContent>
    </Card>
  );
}

export function CenturySummary({ result }: CenturySummaryProps) {
  const { summary } = result;
  const finalLE = summary.endState.lifeExpectancy;
  const baselineLE = summary.baselineEndState.lifeExpectancy;
  const delta = finalLE - baselineLE;
  const endYear = summary.endState.year;

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-bio-teal/30">
        <CardHeader>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <CardTitle>Life expectancy, {endYear}</CardTitle>
              <CardDescription>Baseline (untreated): {baselineLE.toFixed(1)} years</CardDescription>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-display text-6xl font-bold tracking-tight text-star-white">
                {finalLE.toFixed(1)}
              </span>
              <span className="font-mono text-xl text-bio-teal">{signed(delta)} yrs</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge tone={summary.levDetected ? "amber" : "mist"}>
            {summary.levDetected ? "ESCAPE VELOCITY" : "no LEV"}
          </Badge>
          {summary.yearsToEscapeVelocity !== null && (
            <Badge tone="outline">LEV in {summary.yearsToEscapeVelocity} yrs</Badge>
          )}
          <Badge tone="outline">gain {signed(summary.lifeExpectancyGain)} yrs</Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="LE gain"
          value={`${signed(summary.lifeExpectancyGain)} yrs`}
          hint="vs untreated baseline"
        />
        <StatCard
          label="Years to LEV"
          value={
            summary.yearsToEscapeVelocity === null ? "—" : `${summary.yearsToEscapeVelocity} yrs`
          }
          hint={summary.levDetected ? "first year gain > 1" : "not reached"}
        />
        <StatCard
          label="Peak population"
          value={`${summary.peakPopulation.toFixed(2)} bn`}
          hint="over the full run"
        />
        <StatCard
          label="Biosphere health"
          value={`${summary.finalBiosphereHealth.toFixed(1)} / 100`}
          hint={`at ${endYear}`}
        />
        <StatCard
          label="Aging rate"
          value={`×${summary.endState.agingRate.toFixed(3)}`}
          hint="share of natural aging"
        />
        <StatCard
          label="Healthspan"
          value={`${summary.endState.healthspan.toFixed(1)} yrs`}
          hint={`at ${endYear}`}
        />
        <StatCard
          label="GDP per capita"
          value={`$${summary.endState.gdpPerCapita.toFixed(1)}k`}
          hint="2026 USD"
        />
        <StatCard
          label="Intervention coverage"
          value={`${(summary.endState.interventionCoverage * 100).toFixed(1)}%`}
          hint="weighted adoption"
        />
      </div>
    </div>
  );
}
