import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getScenario, getIntervention, simulateCentury, stateAt } from "@geistloom/core";

/**
 * Geistloom Century Worker — the Century Engine with no server in sight.
 *
 *   bun run start -- --seed 4093 --interventions senolytics-dq,rapamycin-class
 *                   --scenario bio-dividend --end-year 2226 --out runs/
 *
 * Writes the full run (states + summary) to `runs/run-<seed>.json`. Because
 * the engine is deterministic, re-running the same flags reproduces the file
 * byte for byte — diff two runs from different forks to see exactly which
 * policy moved which year.
 */

interface Args {
  seed: number;
  interventions: string[];
  scenarioId?: string;
  endYear: number;
  outDir: string;
}

function parseArgs(argv: readonly string[]): Args {
  const args: Args = {
    seed: 4093,
    interventions: [],
    endYear: 2226,
    outDir: "runs",
  };
  const flag = (name: string): string | undefined => {
    const i = argv.indexOf(`--${name}`);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const seed = flag("seed");
  if (seed !== undefined) args.seed = Number(seed);
  const interventions = flag("interventions");
  if (interventions)
    args.interventions = interventions
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  const scenarioId = flag("scenario");
  if (scenarioId) args.scenarioId = scenarioId;
  const endYear = flag("end-year");
  if (endYear !== undefined) args.endYear = Number(endYear);
  const outDir = flag("out");
  if (outDir) args.outDir = outDir;
  return args;
}

const args = parseArgs(process.argv.slice(2));

const unknown = args.interventions.filter((id) => !getIntervention(id));
if (unknown.length > 0) {
  process.stderr.write(
    `unknown intervention(s): ${unknown.join(", ")} — refusing to run a silently-empty stack\n`,
  );
  process.exit(1);
}

const scenario = args.scenarioId ? getScenario(args.scenarioId) : undefined;
if (args.scenarioId && !scenario) {
  process.stderr.write(
    `unknown scenario "${args.scenarioId}" — known: bio-dividend, lev-2035, post-scarcity, …\n`,
  );
  process.exit(1);
}

const result = simulateCentury({
  seed: args.seed,
  enabledInterventionIds: args.interventions,
  scenarioShifts: scenario?.engineShifts,
  endYear: args.endYear,
});

const summary = result.summary;
process.stdout.write(
  `run ${result.states[0] ? "run-" + args.seed.toString(16) : "?"} — ${result.states.length} states\n`,
);
process.stdout.write(
  `  end life expectancy : ${summary.endState.lifeExpectancy.toFixed(1)} y ` +
    `(baseline ${summary.baselineEndState.lifeExpectancy.toFixed(1)} y, gain ${summary.lifeExpectancyGain.toFixed(1)} y)\n`,
);
process.stdout.write(
  `  escape velocity     : ${summary.levDetected ? `year ${String(summary.yearsToEscapeVelocity)}` : "not detected"}\n`,
);
process.stdout.write(`  peak population     : ${summary.peakPopulation.toFixed(2)} B\n`);
process.stdout.write(`  final biosphere     : ${summary.finalBiosphereHealth.toFixed(1)} / 100\n`);

const probe = stateAt(result.states, 2100);
if (probe) {
  process.stdout.write(
    `  world @ 2100        : LE ${probe.lifeExpectancy.toFixed(1)} y, pop ${probe.population.toFixed(2)} B\n`,
  );
}

mkdirSync(args.outDir, { recursive: true });
const outPath = join(
  args.outDir,
  `run-${args.seed}-${args.interventions.join("-") || "baseline"}.json`,
);
writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`written ${outPath}\n`);
