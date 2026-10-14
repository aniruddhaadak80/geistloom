"use client";

import { simulateCentury } from "@geistloom/core";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LineChart,
} from "@geistloom/ui";
import { useMemo } from "react";

/**
 * The Divided World view.
 *
 * Two century runs — identical seed, identical interventions,
 * identical everything except adoptionSpeedMultiplier (1.6 vs 0.5).
 * The life-expectancy gap at 2100 is produced by that single
 * parameter: a policy choice, not biology.
 */

const SEED = 4093;
const ENABLED_INTERVENTIONS: readonly string[] = [
  "partial-reprogramming",
  "senolytics-dq",
  "telomerase-therapy",
];

function toYearly(states: ReturnType<typeof simulateCentury>["states"]) {
  return states.filter((s) => Number.isInteger(s.year));
}

export function EthicsDivergence() {
  const { connected, excluded, gap } = useMemo(() => {
    const connectedRun = simulateCentury({
      seed: SEED,
      enabledInterventionIds: ENABLED_INTERVENTIONS,
      scenarioShifts: { adoptionSpeedMultiplier: 1.6 },
      endYear: 2100,
    });
    const excludedRun = simulateCentury({
      seed: SEED,
      enabledInterventionIds: ENABLED_INTERVENTIONS,
      scenarioShifts: { adoptionSpeedMultiplier: 0.5 },
      endYear: 2100,
    });
    const gapYears =
      Math.round(
        (connectedRun.summary.endState.lifeExpectancy -
          excludedRun.summary.endState.lifeExpectancy) *
          100,
      ) / 100;
    return {
      connected: toYearly(connectedRun.states),
      excluded: toYearly(excludedRun.states),
      gap: gapYears,
    };
  }, []);

  const connectedEnd = connected[connected.length - 1];
  const excludedEnd = excluded[excluded.length - 1];

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-semibold text-star-white">
          The gap is a policy choice
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-mist">
          Same seed, same interventions, same century. The only difference: how fast the world
          adopts. Adoption 1.6× is the connected world; 0.5× is the excluded world.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Two worlds, one methylome apart</CardTitle>
          <CardDescription>
            life expectancy, 2026 → 2100 · partial reprogramming + senolytics + telomerase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart
            series={[
              {
                label: "The connected world (adoption 1.6×)",
                points: connected.map((s) => s.lifeExpectancy),
              },
              {
                label: "The excluded world (adoption 0.5×)",
                points: excluded.map((s) => s.lifeExpectancy),
              },
            ]}
            labels={connected.map((s) => s.year)}
            height={300}
            yLabel="life expectancy (years)"
            colors={["#2dd4bf", "#f59e0b", "#8b5cf6"]}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-charcoal bg-abyss-2 p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-mist">
            connected world, 2100
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold text-bio-teal">
            {connectedEnd ? `${connectedEnd.lifeExpectancy.toFixed(1)} yrs` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-charcoal bg-abyss-2 p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-mist">
            excluded world, 2100
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold text-helix-amber">
            {excludedEnd ? `${excludedEnd.lifeExpectancy.toFixed(1)} yrs` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-genome-violet/40 bg-genome-violet/5 p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-genome-violet">
            the divergence
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold text-star-white">
            {gap.toFixed(1)} years
          </p>
        </div>
      </div>

      <p className="max-w-2xl text-sm leading-relaxed text-mist">
        In 2100 the connected world lives to {connectedEnd?.lifeExpectancy.toFixed(1)} years and the
        excluded world to {excludedEnd?.lifeExpectancy.toFixed(1)} — a {gap.toFixed(1)}-year gap
        manufactured entirely by adoption speed. The therapies are identical; the delivery is not.
        That is why access planning ships with the science.
      </p>
    </section>
  );
}
