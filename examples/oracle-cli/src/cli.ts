import type { OraclePlan } from "@geistloom/sdk";
import { ApiError, askOracle, configureClient } from "@geistloom/sdk";

/**
 * Geistloom Oracle CLI.
 *
 *   bun run start -- "solve aging"
 *   bun run start -- "how do we clear senescent cells" --seed 7
 *
 * Talks to a running Geistloom web app (default http://localhost:3000)
 * or to the Python service if GEISTLOOM_API is pointed at it.
 */

const argv = process.argv.slice(2);
const prompt = argv.filter((a) => !a.startsWith("--")).join(" ") || "solve aging";
const seedFlag = argv.indexOf("--seed");
const seed = seedFlag >= 0 ? Number(argv[seedFlag + 1]) : undefined;
const baseUrl = process.env.GEISTLOOM_API ?? "http://localhost:3000";
configureClient({ baseUrl });

function renderPlan(plan: OraclePlan): void {
  process.stdout.write(`\n${plan.title}\n`);
  process.stdout.write(
    `domain ${plan.domain} · scenario ${plan.scenario} · seed ${plan.seed} · model ${plan.model}\n`,
  );
  process.stdout.write(`\n${plan.summary}\n\n`);
  for (const phase of plan.phases) {
    const confidence = Math.round(phase.confidence * 100);
    process.stdout.write(
      `  ${phase.id.padStart(6, " ")}  ${phase.name.padEnd(26)} ` +
        `~${phase.years}y  ${String(confidence).padStart(3)}%  ${phase.milestone}\n`,
    );
  }
  if (plan.keyNumbers.length > 0) {
    process.stdout.write(`\n  key numbers\n`);
    for (const kn of plan.keyNumbers) {
      process.stdout.write(`    ${kn.label.padEnd(34)} ${kn.value} ${kn.unit}\n`);
    }
  }
  if (plan.citations.length > 0) {
    process.stdout.write(`\n  citations\n`);
    for (const citation of plan.citations) {
      process.stdout.write(`    · ${citation}\n`);
    }
  }
}

async function main(): Promise<number> {
  process.stdout.write(`asking the oracle (${baseUrl}) …\n  prompt: ${prompt}\n`);
  try {
    renderPlan(await askOracle(prompt, seed));
    return 0;
  } catch (error) {
    if (error instanceof ApiError) {
      process.stderr.write(`oracle rejected the request: ${error.message}\n`);
      return 1;
    }
    process.stderr.write(
      `could not reach ${baseUrl} — start the app (bun run dev) or set GEISTLOOM_API\n`,
    );
    return 2;
  }
}

process.exit(await main());
