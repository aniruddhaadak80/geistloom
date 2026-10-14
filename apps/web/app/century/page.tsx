import { SCENARIOS, simulateCentury } from "@geistloom/core";
import { SEED } from "@geistloom/seed";
import type { Metadata } from "next";
import { CenturyConsole } from "@/components/century/century-console";

export const metadata: Metadata = {
  title: "The Century Engine",
  description:
    "Two hundred years of civilization as a function of biotechnology. Toggle the intervention stack, pick a scenario, and watch life expectancy, population, and the biosphere respond — deterministic, from seed 4093.",
};

const DEFAULT_SCENARIO = SCENARIOS[0];

export default async function CenturyPage({
  searchParams,
}: {
  searchParams: Promise<{ run?: string | undefined }>;
}) {
  const params = await searchParams;
  const requested = Number(params.run);
  // ?run=<seed> deep-links here from the Worldboard run registry.
  const seed = Number.isFinite(requested) && requested > 0 ? Math.floor(requested) : SEED;

  // Baseline world: no interventions enabled.
  const initialResult = simulateCentury({
    seed,
    enabledInterventionIds: [],
    scenarioShifts: DEFAULT_SCENARIO?.engineShifts,
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-bio-teal">
          century engine · seed {seed}
        </p>
        <h1 className="max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight">
          Two hundred years, propagated from a single <span className="text-bio-teal">seed</span>.
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-mist">
          The Century Engine couples demography, biology, and machine intelligence into one
          deterministic system. Enable interventions, choose a future, and replay any year — then
          fork the timeline from wherever you stop.
        </p>
      </header>
      <CenturyConsole initialResult={initialResult} initialSeed={seed} />
    </main>
  );
}
