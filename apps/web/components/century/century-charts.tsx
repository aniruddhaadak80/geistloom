"use client";

import type { SimulationResult, WorldState } from "@geistloom/core";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LineChart,
} from "@geistloom/ui";
import { useEffect, useState } from "react";

interface CenturyChartsProps {
  readonly result: SimulationResult;
  readonly seed: number;
  readonly endYear: number;
  readonly scenarioId: string;
}

/** Engine steps are 0.25y — keep every 4th state for 1y points. */
function downsample(states: readonly WorldState[]): WorldState[] {
  return states.filter((_, index) => index % 4 === 0);
}

export function CenturyCharts({ result, seed, endYear, scenarioId }: CenturyChartsProps) {
  const [baseline, setBaseline] = useState<SimulationResult | null>(null);

  // Baseline comparison run: identical scenario, empty intervention stack.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/century/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seed,
        enabledInterventionIds: [],
        endYear,
        scenarioId,
      }),
    })
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)),
      )
      .then((data: SimulationResult) => {
        if (!cancelled) setBaseline(data);
      })
      .catch(() => {
        if (!cancelled) setBaseline(null);
      });
    return () => {
      cancelled = true;
    };
  }, [seed, endYear, scenarioId]);

  const run = downsample(result.states);
  const base = baseline === null ? null : downsample(baseline.states);
  const labels = run.map((state) => state.year);

  const lifeExpectancySeries = [
    { label: "With interventions", points: run.map((s) => s.lifeExpectancy) },
    ...(base ? [{ label: "Baseline (untreated)", points: base.map((s) => s.lifeExpectancy) }] : []),
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Life expectancy</CardTitle>
          <CardDescription>The intervention stack vs. the untreated world.</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart series={lifeExpectancySeries} labels={labels} height={220} yLabel="years" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Population</CardTitle>
          <CardDescription>Demographic transition as longevity rises.</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart
            series={[{ label: "Population", points: run.map((s) => s.population) }]}
            labels={labels}
            height={220}
            yLabel="billions"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Biosphere health</CardTitle>
          <CardDescription>Knowledge techs the world; growth pressures it.</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart
            series={[{ label: "Biosphere health", points: run.map((s) => s.biosphereHealth) }]}
            labels={labels}
            height={220}
            yLabel="0–100"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Knowledge &amp; AI</CardTitle>
          <CardDescription>
            The research stock compounds against machine capability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart
            series={[
              { label: "Knowledge stock", points: run.map((s) => s.knowledgeStock) },
              { label: "AI capability", points: run.map((s) => s.aiCapability) },
            ]}
            labels={labels}
            height={220}
            yLabel="level"
          />
        </CardContent>
      </Card>
    </div>
  );
}
