import {
  INTERVENTIONS,
  intRange,
  mulberry32,
  pickOne,
  SCENARIOS,
  shuffle,
  simulateCentury,
} from "@geistloom/core";
import { SEED } from "@geistloom/seed";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@geistloom/ui";
import Link from "next/link";

const ADJECTIVES = [
  "Crimson",
  "Silent",
  "Golden",
  "Verdant",
  "Hollow",
  "Radiant",
  "Obsidian",
  "Azure",
  "Umbral",
  "Vivid",
  "Patient",
  "Sleepless",
] as const;

const NOUNS = [
  "Meridian",
  "Covenant",
  "Horizon",
  "Lattice",
  "Vessel",
  "Garden",
  "Engine",
  "Chorus",
  "Anchor",
  "Mirror",
  "Spire",
  "Loom",
] as const;

const RUN_COUNT = 8;

interface SavedRun {
  readonly id: string;
  readonly name: string;
  readonly seed: number;
  readonly scenarioId: string;
  readonly scenarioName: string;
  readonly interventionIds: readonly string[];
  readonly summaryLine: string;
}

/**
 * The registry is generated once per request from a fixed rng —
 * the same eight runs appear for every visitor, every time.
 */
function buildRuns(): readonly SavedRun[] {
  const rng = mulberry32(SEED);
  const runs: SavedRun[] = [];
  for (let index = 0; index < RUN_COUNT; index++) {
    const seed = intRange(1000, 99999, rng);
    const name = `${pickOne(ADJECTIVES, rng)} ${pickOne(NOUNS, rng)}`;
    const scenario = pickOne(SCENARIOS, rng);
    const interventionIds = shuffle(INTERVENTIONS, rng)
      .slice(0, intRange(2, 6, rng))
      .map((intervention) => intervention.id);
    const summary = simulateCentury({
      seed,
      enabledInterventionIds: interventionIds,
      scenarioShifts: scenario.engineShifts,
    }).summary;
    const gain = summary.lifeExpectancyGain;
    runs.push({
      id: `run-${index + 1}`,
      name,
      seed,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      interventionIds,
      summaryLine: `LE ${summary.endState.lifeExpectancy.toFixed(1)} (${gain >= 0 ? "+" : ""}${gain.toFixed(1)} vs baseline) · peak ${summary.peakPopulation.toFixed(2)} bn · ${summary.levDetected ? "LEV reached" : "no LEV"}`,
    });
  }
  return runs;
}

export function RunRegistry() {
  const runs = buildRuns();

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-1.5">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-star-white">
          Run registry
        </h2>
        <p className="text-sm leading-relaxed text-mist">
          Eight saved futures, generated deterministically from seed {SEED}. Open a run to reload
          the Century Engine with its seed.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {runs.map((run) => (
          <Link key={run.id} href={`/century?run=${run.seed}`} className="group">
            <Card className="h-full transition group-hover:border-bio-teal">
              <CardHeader>
                <CardTitle className="transition group-hover:text-bio-teal">{run.name}</CardTitle>
                <CardDescription>
                  <Badge tone="outline">seed {run.seed}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="violet">{run.scenarioName}</Badge>
                  <Badge tone="mist">{run.interventionIds.length} interventions</Badge>
                </div>
                <p className="font-mono text-xs leading-relaxed text-mist">{run.summaryLine}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
