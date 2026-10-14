#!/usr/bin/env bun

/**
 * Geistloom — the scale engine.
 *
 * One deterministic command that regenerates every machine-written
 * surface of the repository:
 *
 *   bun scripts/generate.ts        (aliased as `bun run generate`)
 *
 *   1. routes      — apps/web/app/explorer/** detail pages driven by the
 *                    exact id literals in packages/core/src/domain/*.ts
 *                    (detail routes can never drift from their data).
 *   2. components  — packages/ui/src/generated/** chart + display
 *                    primitives, per-hallmark cards, and the barrel.
 *   3. docs        — docs/generated/** route guides + glossary entries.
 *   4. i18n        — apps/web/i18n/locales/*.json + locales index.
 *
 * Every generator is pure and seeded (mulberry32 with ENGINE_SEED 4093):
 * no Math.random, no Date.now, two runs on the same commit produce
 * byte-identical trees. Files are overwritten, never appended, so the
 * command is safe to re-run at any time.
 *
 * Output is a manifest line per file and a final census.
 */

import { generateComponents } from "./generators/components.mjs";
import { generateDocs } from "./generators/docs.mjs";
import { generateI18n } from "./generators/i18n.mjs";
import { generateRoutes } from "./generators/routes.mjs";

interface Job {
  readonly name: string;
  readonly run: () => readonly string[] | Promise<readonly string[]>;
}

const JOBS: readonly Job[] = [
  { name: "routes", run: generateRoutes },
  { name: "components", run: generateComponents },
  { name: "docs", run: generateDocs },
  { name: "i18n", run: generateI18n },
];

async function main(): Promise<number> {
  const started = performance.now();
  const totals: Array<{ name: string; count: number }> = [];
  let grandTotal = 0;

  for (const job of JOBS) {
    process.stdout.write(`\n[generate] ${job.name}\n`);
    const files = await job.run();
    for (const rel of files) {
      process.stdout.write(`  · ${rel}\n`);
    }
    process.stdout.write(`  → ${files.length} files\n`);
    totals.push({ name: job.name, count: files.length });
    grandTotal += files.length;
  }

  const elapsed = Math.round((performance.now() - started) * 100) / 100;
  const summary = totals.map((t) => `${t.name}=${t.count}`).join("  ");
  process.stdout.write(
    `\n[generate] ${grandTotal} files written deterministically in ${elapsed}ms\n` +
      `[generate] ${summary}\n`,
  );
  return 0;
}

main().then((code) => process.exit(code));
