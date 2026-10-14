"use client";

import { forkFrom, type SimulationResult, stateAt, type WorldState } from "@geistloom/core";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@geistloom/ui";
import { useMemo, useState } from "react";

interface TimeMachineProps {
  readonly states: readonly WorldState[];
  readonly seed: number;
  readonly enabledInterventionIds: readonly string[];
  readonly endYear: number;
}

function Metric({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[11px] uppercase tracking-wider text-mist">{label}</span>
      <span className="font-mono text-sm text-star-white">{value}</span>
    </div>
  );
}

export function TimeMachine({ states, seed, enabledInterventionIds, endYear }: TimeMachineProps) {
  const firstYear = states[0]?.year ?? 2026;
  const lastState = states[states.length - 1];
  const lastYear = lastState?.year ?? endYear;
  const [year, setYear] = useState<number>(Math.min(2050, lastYear));
  const [forkResult, setForkResult] = useState<SimulationResult | null>(null);

  // Snap the scrubber to the nearest stored WorldState.
  const state = stateAt(states, year) ?? states[0] ?? null;

  const topCoverage = useMemo(() => {
    if (!state) return [];
    return Object.entries(state.interventionLevels)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [state]);

  function forkFromThisYear(): void {
    if (!state) return;
    setForkResult(
      forkFrom(state, {
        seed,
        enabledInterventionIds,
        endYear: state.year + 100,
      }),
    );
  }

  if (!state) return null;

  const originalFinalLE = lastState?.lifeExpectancy ?? 0;
  const forkFinalLE = forkResult?.summary.endState.lifeExpectancy;
  const forkEndYear = forkResult?.summary.endState.year;
  const forkDelta = forkFinalLE === undefined ? null : forkFinalLE - originalFinalLE;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time machine</CardTitle>
        <CardDescription>
          Scrub to any simulated year — every state is a coordinate you can fork.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={firstYear}
            max={lastYear}
            step={1}
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="w-full accent-bio-teal"
            aria-label="Scrub year"
          />
          <span className="w-20 text-right font-mono text-2xl font-semibold text-bio-teal">
            {state.year}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-5">
          <Metric label="Population" value={`${state.population.toFixed(2)} bn`} />
          <Metric label="Life expectancy" value={`${state.lifeExpectancy.toFixed(1)} yrs`} />
          <Metric label="Healthspan" value={`${state.healthspan.toFixed(1)} yrs`} />
          <Metric label="Aging rate" value={`×${state.agingRate.toFixed(3)}`} />
          <Metric label="Biosphere" value={`${state.biosphereHealth.toFixed(1)} / 100`} />
          <Metric label="GDP per capita" value={`$${state.gdpPerCapita.toFixed(1)}k`} />
          <Metric label="AI capability" value={`${state.aiCapability.toFixed(1)} / 100`} />
          <Metric label="Knowledge stock" value={`${(state.knowledgeStock * 100).toFixed(1)}%`} />
          <Metric label="Coverage" value={`${(state.interventionCoverage * 100).toFixed(1)}%`} />
          <Metric label="Year index" value={`${state.yearIndex}`} />
        </div>

        {topCoverage.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-mist">
              Top interventions by coverage
            </span>
            {topCoverage.map(([id, level]) => (
              <div key={id} className="flex items-center gap-3">
                <span className="w-52 truncate font-mono text-xs text-star-white/80">{id}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-charcoal">
                  <div
                    className="h-full rounded-full bg-bio-teal"
                    style={{ width: `${Math.round(level * 100)}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-xs text-mist">
                  {Math.round(level * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-charcoal bg-abyss p-4">
          <Button onClick={forkFromThisYear}>Fork from {state.year}</Button>
          {forkResult && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-sm">
              <span className="text-mist">
                fork → {forkEndYear}:{" "}
                <span className="text-bio-teal">LE {forkFinalLE?.toFixed(1)}</span>
              </span>
              <span className="text-mist">
                original → {lastYear}:{" "}
                <span className="text-star-white">LE {originalFinalLE.toFixed(1)}</span>
              </span>
              {forkDelta !== null && (
                <span className={forkDelta >= 0 ? "text-bio-teal" : "text-helix-amber"}>
                  ({forkDelta >= 0 ? "+" : ""}
                  {forkDelta.toFixed(1)} yrs)
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
