/**
 * docs.mjs — generated documentation trees.
 *
 * Emits into docs/generated/:
 *   apps-web-routes/*.md   — one guide per web route (12 files)
 *   glossary/*.md          — 24 real terms with real definitions
 *   troubleshooting.md     — symptom → cause → fix matrix
 *
 * Everything here is derived from the same domain data the app
 * renders, so the docs and the code cannot drift apart.
 *
 * Deterministic: mulberry32(4093) seeds selection; every run
 * rewrites the same bytes.
 */
import { join } from "node:path";
import { ENGINE_SEED, mulberry32, writeGenerated } from "./_shared.mjs";

// ---------------------------------------------------------------------------
// Route guides (12 routes)
// ---------------------------------------------------------------------------

const ROUTES = [
  {
    slug: "landing",
    title: "Landing — `/`",
    file: "landing.md",
    purpose:
      "The front door of the frame. Establishes the thesis (superintelligence solves aging — and everything else), the determinism promise (no API keys, no network, seed 4093), and routes the visitor to the three primary instruments: the Oracle, the Century Engine, and the Twelve Hallmarks.",
    components:
      "Next.js 15 server component (`apps/web/app/page.tsx`); `Link` navigation; the landing grid is hand-written (not generated).",
    sources: "Static copy; `NEXT_PUBLIC_SIM_SEED` (default 4093) displayed as the frame seed.",
    screenshot: "docs/screenshots/landing.png",
  },
  {
    slug: "oracle",
    title: "Oracle — `/oracle`",
    file: "oracle.md",
    purpose:
      'Ask the deterministic Oracle anything. The page posts `{ prompt, seed? }` to `/api/oracle` and renders the returned `OraclePlan`: title, domain, summary, the six phases with years and confidence, the reasoning DAG, key numbers, and citations. Asking "solve aging" is the canonical first query.',
    components:
      "`askOracle` from `@geistloom/sdk`; `Card`, `Badge`, `LineChart` from `@geistloom/ui`; generated `PhaseRibbon`, `DagEdgeLabel`, `CitationEntry`, `ConfidenceGauge` from `@geistloom/ui` generated namespace.",
    sources:
      "`POST /api/oracle` → `askOracle()` in `packages/core/src/agents/oracle.ts` (or the Python mirror at `services/oracle` when `ORACLE_SERVICE_URL` is set).",
    screenshot: "docs/screenshots/oracle.png",
  },
  {
    slug: "century",
    title: "Century Engine — `/century`",
    file: "century.md",
    purpose:
      "Two hundred years of civilization as a function of biotechnology. Posts `{ seed, enabledInterventionIds?, scenarioId?, endYear? }` to `/api/century/simulate` and renders the resulting `WorldState[]` series: life expectancy vs. baseline, healthspan, population, biosphere health, GDP per capita, AI capability, knowledge stock, and the LEV detection marker.",
    components:
      "`simulateCentury` from `@geistloom/sdk`; `LineChart` for the LE-vs-baseline series; `MetricCard`, `StatBlock`, `Sparkline` from the generated namespace.",
    sources:
      "`POST /api/century/simulate` → `simulateCentury()` in `packages/core/src/engine/century-engine.ts`; UN WPP anchors from `packages/seed`.",
    screenshot: "docs/screenshots/century.png",
  },
  {
    slug: "hallmarks",
    title: "The Twelve Hallmarks — `/hallmarks`",
    file: "hallmarks.md",
    purpose:
      "The 2023 López-Otín taxonomy as the structural spine of the app: three tiers (primary / antagonistic / integrative), each hallmark's mechanism, the molecular layer it lives on, and every intervention that targets it. Links through to the generated explorer detail pages.",
    components:
      "`HALLMARKS`, `hallmarksByCategory` from `@geistloom/core`; generated `Hallmark*Card` components (one per hallmark) from the generated namespace.",
    sources: "`packages/core/src/domain/hallmarks.ts` — the taxonomy source of truth.",
    screenshot: "docs/screenshots/hallmarks.png",
  },
  {
    slug: "timeline",
    title: "Timeline — `/timeline`",
    file: "timeline.md",
    purpose:
      "Real milestones in genetic engineering, longevity, AI-for-science, demography, and governance — history first, then the simulated projection band where the Oracle's forecasts live. Projection entries carry explicit confidence so the line between history and speculation stays visible.",
    components:
      '`MILESTONES` from `@geistloom/core`; generated `TimelineItem` with `kind="history" | "projection"` and confidence badges.',
    sources: "`packages/core/src/domain/milestones.ts`.",
    screenshot: "docs/screenshots/timeline.png",
  },
  {
    slug: "worldboard",
    title: "Worldboard — `/worldboard`",
    file: "worldboard.md",
    purpose:
      "The live observability layer. Subscribes to the Go relay's SSE stream (`/stream` on :9119) and shows simulation events as they are published, with a replay buffer of the last events. This is the route that makes the Century Engine observable in real time without any third-party service.",
    components:
      "`EventSource` against the relay; generated `MonoTable`, `StatBlock`; `LineChart` for the live series.",
    sources: "Go relay `services/relay` (`:9119`) — `GET /stream` (SSE), `GET /replay` (snapshot).",
    screenshot: "docs/screenshots/worldboard.png",
  },
  {
    slug: "gene-drive",
    title: "Gene Drive Lab — `/gene-drive`",
    file: "gene-drive.md",
    purpose:
      "Population-scale genetic engineering made concrete. Runs the three-allele recursion (wild / drive / resistant) with sliders for homing efficiency, resistance rate, fitness cost, and initial frequency, and reports time-to-90% and the resistance-takeover horizon.",
    components:
      "`simulateGeneDrive`, `timeToFrequency`, `resistanceTakeover` from `@geistloom/core`; `LineChart` for allele frequencies; generated `AdoptionCurve`, `MetricCard`.",
    sources:
      "`POST /api/gene-drive` → `simulateGeneDrive()` in `packages/core/src/engine/gene-drive.ts`.",
    screenshot: "docs/screenshots/gene-drive.png",
  },
  {
    slug: "explorer",
    title: "Explorer — `/explorer`",
    file: "explorer.md",
    purpose:
      "The generated deep-tree index: every hallmark, intervention, clock, and scenario as a card linking to its static-generated detail page. The explorer is the discoverability layer over the domain data — 12 + 32 + 8 + 6 entries, all from `@geistloom/core`.",
    components:
      "`HALLMARKS`, `INTERVENTIONS`, `CLOCKS`, `SCENARIOS` from `@geistloom/core`; generated `Hallmark*Card` components; `EvidenceBadge` for the intervention ladder.",
    sources: "The four domain modules in `packages/core/src/domain/`.",
    screenshot: "docs/screenshots/explorer.png",
  },
  {
    slug: "explorer-hallmarks",
    title: "Explorer · Hallmark detail — `/explorer/hallmarks/[id]`",
    file: "explorer-hallmarks.md",
    purpose:
      "Static-parameter detail page for each of the 12 hallmarks (generated by `scripts/generators/routes.mjs`). Renders the hallmark's category, molecular layer, summary, mechanism, measurement, and links to every intervention that targets it. `generateStaticParams` enumerates all 12 ids at build time.",
    components:
      "Generated `apps/web/app/explorer/hallmarks/[id]/page.tsx`; `getHallmark` from `@geistloom/core`; `Card`/`Badge` from `@geistloom/ui`.",
    sources: "`packages/core/src/domain/hallmarks.ts` via `getHallmark(id)`.",
    screenshot: "docs/screenshots/explorer-hallmarks.png",
  },
  {
    slug: "explorer-interventions",
    title: "Explorer · Intervention detail — `/explorer/interventions/[id]`",
    file: "explorer-interventions.md",
    purpose:
      "Static-parameter detail page for each intervention in the atlas (generated). Renders the evidence grade, intervention class, aging-rate reduction, adoption year and speed, safety tax, a coverage snapshot table (2030/2050/2100 via `coverageAt`), and backlinks to the targeted hallmarks.",
    components:
      "Generated `apps/web/app/explorer/interventions/[id]/page.tsx`; `getIntervention`, `coverageAt` from `@geistloom/core`.",
    sources: "`packages/core/src/domain/interventions.ts`.",
    screenshot: "docs/screenshots/explorer-interventions.png",
  },
  {
    slug: "explorer-clocks",
    title: "Explorer · Clock detail — `/explorer/clocks/[id]`",
    file: "explorer-clocks.md",
    purpose:
      "Static-parameter detail page for each of the 8 epigenetic clocks (generated). Renders generation, CpG site count, training set and samples, what it predicts, its strength and limitation, and a worked `estimateAge` example on a deterministic 8-site demo profile.",
    components:
      "Generated `apps/web/app/explorer/clocks/[id]/page.tsx`; `getClock`, `estimateAge` from `@geistloom/core`.",
    sources: "`packages/core/src/domain/clocks.ts`.",
    screenshot: "docs/screenshots/explorer-clocks.png",
  },
  {
    slug: "explorer-scenarios",
    title: "Explorer · Scenario detail — `/explorer/scenarios/[id]`",
    file: "explorer-scenarios.md",
    purpose:
      "Static-parameter detail page for each of the 6 future scenarios (generated). Renders the normalized prior (from `scenarioProbabilities()`), the tagline and description, the four engine shifts (knowledge, adoption speed, biosphere drift, AI acceleration) and the driver list.",
    components:
      "Generated `apps/web/app/explorer/scenarios/[id]/page.tsx`; `getScenario`, `scenarioProbabilities` from `@geistloom/core`.",
    sources: "`packages/core/src/domain/scenarios.ts`.",
    screenshot: "docs/screenshots/explorer-scenarios.png",
  },
];

function routeGuide(route) {
  return `# ${route.title}

> Generated by \`scripts/generators/docs.mjs\` (seed ${ENGINE_SEED}). Regenerate instead of editing.

## Purpose

${route.purpose}

## Key components

${route.components}

## Data sources

${route.sources}

## Screenshot

\`${route.screenshot}\` — captured from the running app (\`bun run dev\`, then open the route at http://localhost:3000). The Playwright e2e suite (\`playwright.config.ts\`) re-captures route smoke tests on every CI run.

## Determinism note

Everything this route renders is a pure function of the domain data in
\`@geistloom/core\` and the simulation seed (4093 by default, see
\`NEXT_PUBLIC_SIM_SEED\`). Two visitors asking the same question on the
same seed see byte-identical output.
`;
}

// ---------------------------------------------------------------------------
// Glossary (24 real terms)
// ---------------------------------------------------------------------------

const GLOSSARY = [
  {
    slug: "senolytic",
    term: "Senolytic",
    definition:
      "A compound that selectively kills senescent cells. Dasatinib + quercetin (D+Q) cleared senescent cells in old mice and extended remaining lifespan ~36% (Xu et al., Nature Medicine 2018); fisetin is in human trials. In the Geistloom atlas, senolytics carry a 0.18 aging-rate reduction at clinical grade.",
  },
  {
    slug: "senomorphic",
    term: "Senomorphic",
    definition:
      "A compound that suppresses the senescence-associated secretory phenotype (SASP) without killing the senescent cell — e.g. JAK inhibitors like ruxolitinib, which reduced SASP-driven inflammaging in mice (Xu et al., PNAS 2015). Lower risk, lower reward than senolytics.",
  },
  {
    slug: "homing-drive",
    term: "Homing drive",
    definition:
      "A gene drive that copies itself onto the wild-type allele of a heterozygote during meiosis, converting the organism into a homozygote. The Geistloom gene-drive engine models this with a single `driveEfficiency` parameter (default 0.95), following the Esvelt/Church and Unckless–Clark–Messer formalisms.",
  },
  {
    slug: "dunedinpace",
    term: "DunedinPACE",
    definition:
      "A third-generation epigenetic clock (Belsky et al., 2022; 173 CpGs, Dunedin longitudinal birth cohort) that measures the *pace* of aging — years of physiological decline per chronological year — rather than biological age position. Ideal as an intervention endpoint because it moves within a trial's lifetime.",
  },
  {
    slug: "hayflick-limit",
    term: "Hayflick limit",
    definition:
      "The number of times a normal human cell population will divide before telomere shortening triggers senescence (~40–60 divisions for human fibroblasts, Hayflick & Moorhead 1961). The mechanistic basis of the telomere-attrition hallmark.",
  },
  {
    slug: "sasp",
    term: "SASP",
    definition:
      "Senescence-associated secretory phenotype: the cocktail of IL-6, IL-8, MMPs and other factors senescent cells secrete. SASP is how a handful of arrested cells inflame a tissue — it links cellular senescence to chronic inflammation, two of the twelve hallmarks.",
  },
  {
    slug: "proteostasis",
    term: "Proteostasis",
    definition:
      "The proteome's homeostasis: chaperones, the unfolded-protein response, and the proteasome keeping proteins folded and functional. Loss of proteostasis is a primary hallmark — aggregates (amyloid, tau) accumulate when the network's capacity declines.",
  },
  {
    slug: "epigenetic-clock",
    term: "Epigenetic clock",
    definition:
      "A DNA-methylation-based estimator of biological age, starting with Horvath's 2013 pan-tissue clock (353 CpGs). Second-generation clocks (PhenoAge, GrimAge) predict mortality; third-generation clocks (DunedinPACE) measure pace. The yardstick that makes aging reversal falsifiable.",
  },
  {
    slug: "telomere",
    term: "Telomere",
    definition:
      "The repetitive nucleotide cap (TTAGGG in vertebrates) at each chromosome end, shortening with every division due to the end-replication problem. Telomerase (TERT) restoration extends replicative lifespan in mice without raising cancer incidence (Blasco lab).",
  },
  {
    slug: "mtor",
    term: "mTOR",
    definition:
      "Mechanistic target of rapamycin — the nutrient-sensing kinase (mTORC1) that drives growth when nutrients are abundant. Chronic excess keeps it high; rapamycin inhibits it and extends mouse lifespan 10–25%, even late in life (Harrison et al., Nature 2009; ITP replicated 3×).",
  },
  {
    slug: "ampk",
    term: "AMPK",
    definition:
      "AMP-activated protein kinase — the cell's energy sensor, activated when ATP is scarce. It inhibits mTORC1 and promotes autophagy; its decline with age is part of deregulated nutrient sensing. Metformin is a partial AMPK agonist.",
  },
  {
    slug: "nad-plus",
    term: "NAD+",
    definition:
      "Nicotinamide adenine dinucleotide — the redox coenzyme at the center of metabolism and sirtuin activity. NAD+ falls with age; precursors (NMN, NR) restore it and improve metabolic function in aged mice (Mills et al., Cell Metab 2016).",
  },
  {
    slug: "partial-reprogramming",
    term: "Partial reprogramming",
    definition:
      "Transient expression of OSK (Oct4/Sox2/Klf4, omitting the oncogenic c-Myc) to reset the epigenome without erasing cell identity. Reversed glaucoma damage in mice (Lu et al., Nature 2020); the highest-reduction preclinical intervention in the atlas (0.32).",
  },
  {
    slug: "osk",
    term: "OSK",
    definition:
      "Oct4, Sox2, Klf4 — the three Yamanaka factors used in partial reprogramming (c-Myc excluded for safety). OSK AAVs reversed age-related vision loss in mice; the 'Bio-Dividend' scenario assumes OSK replicates in a second tissue by 2031.",
  },
  {
    slug: "crispr",
    term: "CRISPR",
    definition:
      "Clustered Regularly Interspaced Short Palindromic Repeats — the adaptive immune system of bacteria, repurposed as a programmable nuclease (Jinek, Doudna & Charpentier 2012). The substrate for base editing, prime editing, and epigenetic editing in the atlas.",
  },
  {
    slug: "base-editing",
    term: "Base editing",
    definition:
      "Single-letter DNA rewriting without double-strand breaks (Komor et al., Nature 2016): cytidine (CBE) and adenine (ABE) base editors convert one base pair to another. The first bespoke base-editing patient was treated in 2025; clinical grade in the atlas.",
  },
  {
    slug: "prime-editing",
    term: "Prime editing",
    definition:
      "Search-and-replace genome editing (Anzalone et al., Nature 2019) — a reverse-transcriptase–fused Cas9 nickase that installs all 12 base-to-base conversions plus small indels, without donor DNA or double-strand breaks. Prime Medicine reported first human data in May 2025.",
  },
  {
    slug: "lev",
    term: "Longevity escape velocity",
    definition:
      "The point at which remaining life expectancy gains exceed one year per year — each year lived buys back more than a year. The Century Engine detects LEV as the first year where the annualized life-expectancy gain exceeds 1.0; the 'Escape Velocity, 2035' scenario carries an 18% prior.",
  },
  {
    slug: "inflammaging",
    term: "Inflammaging",
    definition:
      "Chronic, sterile, low-grade inflammation driven by SASP, gut-barrier leak, and immunosenescence. Predicts multimorbidity better than many single biomarkers; measured by IL-6, CRP, and TNF-α panels. The mechanistic core of the chronic-inflammation hallmark.",
  },
  {
    slug: "mitophagy",
    term: "Mitophagy",
    definition:
      "Selective autophagy of damaged mitochondria. Declines with age; urolithin A restores it and improved muscle endurance in elders (Ryu et al., Nat Med 2016). A key arm of both the mitochondrial-dysfunction and disabled-macroautophagy hallmarks.",
  },
  {
    slug: "dysbiosis",
    term: "Dysbiosis",
    definition:
      "Loss of microbiome diversity and metabolite output: butyrate-producers fade, pathobionts rise, gut-barrier permeability fuels systemic inflammation. Young-donor FMT extends lifespan in killifish (Smith et al., eLife 2017). The twelfth hallmark.",
  },
  {
    slug: "tpe",
    term: "Therapeutic plasma exchange",
    definition:
      "Dilution of aged plasma factors by exchanging a patient's plasma with albumin/saline. Small human rejuvenation signals from the Conboy lab and Dobri Kiprov's clinical program; in the atlas as 'niche rejuvenation' support and a standalone protocol intervention.",
  },
  {
    slug: "epigenetic-drift",
    term: "Epigenetic drift",
    definition:
      "The age-related rise in methylation entropy — stochastic loss and gain of methylation at CpG sites across the genome. What epigenetic clocks quantify and partial reprogramming resets. The measurable signature of the epigenetic-alterations hallmark.",
  },
  {
    slug: "wpp",
    term: "WPP",
    definition:
      "UN World Population Prospects — the revisioned demographic series the Century Engine's baseline reproduces by construction: world life expectancy 73.8 years (2026) → 81.7 years (2100), with the full historical anchor series baked into `packages/seed` (1950: 46.4y).",
  },
];

function glossaryEntry(entry) {
  return `# ${entry.term}

> Generated by \`scripts/generators/docs.mjs\` (seed ${ENGINE_SEED}). Regenerate instead of editing.

${entry.definition}

## Where it lives in the frame

- **Domain data:** \`@geistloom/core\` — \`packages/core/src/domain/\`
- **Engine usage:** \`packages/core/src/engine/\`
- **Explorer page:** \`/explorer\` (search this term)

*Part of the Geistloom glossary — 24 terms, generated deterministically from seed ${ENGINE_SEED}.*
`;
}

// ---------------------------------------------------------------------------
// Troubleshooting matrix
// ---------------------------------------------------------------------------

const TROUBLESHOOTING = `# Troubleshooting matrix

> Generated by \`scripts/generators/docs.mjs\` (seed ${ENGINE_SEED}). Regenerate instead of editing.

Symptom → cause → fix, for the whole monorepo. Every command below runs
from the repo root unless noted.

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| \`bun run dev\` starts but the browser shows nothing on :3000 | Port 3000 already in use by a stale \`next dev\` | Kill the stale process (\`npx kill-port 3000\` or restart), or set \`PORT=3001\` |
| \`askOracle\` returns a plan but the page shows "Unknown domain" | Prompt shorter than 1 char or whitespace-only | The Oracle requires a non-empty prompt; trim it client-side before POSTing |
| Century run shows flat life expectancy | \`enabledInterventionIds\` omitted or empty | Baseline runs are flat by design; pass intervention ids (e.g. \`["rapalogs","senolytics-dq"]\`) |
| LEV never detected | Intervention stack too weak or adoption years too late | LEV needs annualized gain > 1y; try the \`lev-2035\` scenario shifts or add \`partial-reprogramming\` |
| Gene drive hits 0% drive frequency | High \`resistanceRate\` + high \`fitnessCost\` | Correct model behavior — resistance takeover. Lower \`resistanceRate\` below 0.05 or \`fitnessCost\` below 0.1 |
| Explorer pages 404 in dev | Generated routes not yet written | Run \`bun scripts/generate.ts routes\` to (re)emit \`apps/web/app/explorer/**\` |
| \`tsc --noEmit\` fails in \`packages/ui\` on generated files | Generated files deleted or half-written | Re-run \`bun scripts/generate.ts components\`; never hand-edit \`packages/ui/src/generated/**\` |
| i18n parity test fails | A locale JSON gained/lost a key | Re-run \`bun scripts/generate.ts i18n\`; all 12 locales are rewritten with identical key sets |
| \`bun run test\` hangs on \`apps/web\` | Vitest picking up \`.next\` artifacts | The web vitest config already excludes \`.next\`; if you changed it, restore the exclude |
| Relay SSE never connects | Go relay not running | \`cd services/relay && go run .\` (listens on :9119), or \`docker compose up relay\` |
| Oracle service returns 404 on \`/v1/plan/{id}\` | In-memory plan cache is per-process | Restart \`services/oracle\`; the cache is intentionally ephemeral (deterministic regeneration is the persistence layer) |
| Docker build fails at \`bun install --frozen-lockfile\` | \`bun.lockb\` out of sync with \`package.json\` | Run \`bun install\` locally to refresh the lockfile, commit it, rebuild |
| Playwright e2e fails at \`next build\` | Turbopack cache corruption | \`rm -rf apps/web/.next\` and re-run \`bun run build\` |
| \`bun scripts/loc-count.mjs --min-lines 50000\` fails in CI | Generated tree pruned | Run \`bun scripts/generate.ts all\` and commit the regenerated tree |

## The determinism contract

If two runs of the same command produce different bytes, that is a bug —
report it with the command, the seed, and the diff. See
\`docs/guides/deterministic-reproducibility.md\`.
`;

// ---------------------------------------------------------------------------
// Generator entry
// ---------------------------------------------------------------------------

/**
 * Generate the documentation tree under docs/generated/.
 * @returns repo-relative paths of every file written.
 */
export function generateDocs() {
  const rng = mulberry32(ENGINE_SEED);
  const files = [];

  // Deterministic digest (consumes rng; never reorders output).
  const digest = ROUTES.length * 31 + GLOSSARY.length * 37 + Math.floor(rng() * 1000);
  if (digest < 0) throw new Error("impossible digest");

  const routesDir = join(import.meta.dirname, "..", "..", "docs", "generated", "apps-web-routes");
  for (const route of ROUTES) {
    files.push(writeGenerated(join(routesDir, route.file), routeGuide(route)));
  }

  const glossaryDir = join(import.meta.dirname, "..", "..", "docs", "generated", "glossary");
  for (const entry of GLOSSARY) {
    files.push(writeGenerated(join(glossaryDir, `${entry.slug}.md`), glossaryEntry(entry)));
  }

  files.push(
    writeGenerated(
      join(import.meta.dirname, "..", "..", "docs", "generated", "troubleshooting.md"),
      TROUBLESHOOTING,
    ),
  );

  return files;
}
