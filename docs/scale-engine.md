# The scale engine

`bun run generate` regenerates 83 files across four families. Every generator
is pure: seeded (mulberry32, `ENGINE_SEED = 4093`), no `Math.random`, no
`Date.now`, no appends — files are rewritten or untouched, so two runs on the
same commit produce byte-identical trees and clean diffs.

```
scripts/generate.ts           the orchestrator (bun)
scripts/generators/
  _shared.mjs                 seed, writeGenerated, manifest helpers
  routes.mjs                  → apps/web/app/explorer/**
  components.mjs              → packages/ui/src/generated/**
  docs.mjs                    → docs/generated/**
  i18n.mjs                    → apps/web/i18n/locales/**
```

## 1. routes — 4 family pages, never drifting

`routes.mjs` reads the **literal id strings** out of
`packages/core/src/domain/*.ts` with a regex and renders
`generateStaticParams()` + the detail page for each id:

```
apps/web/app/explorer/
  hallmarks/[id]/page.tsx        (12 hallmarks)
  interventions/[id]/page.tsx    (32 interventions)
  clocks/[id]/page.tsx           (8 clocks)
  scenarios/[id]/page.tsx        (6 scenarios)
```

Because the ids are extracted from the source of truth, a new intervention
cannot exist in the atlas without its detail route existing too — the
"route coverage" class of bug is designed out. Output passes `biome check` as
committed; if you regenerate after editing a generator, re-run
`biome check --write` to re-normalize formatting.

## 2. components — 29 files of chart kit

`components.mjs` writes the generated design system: `Sparkline`, `AreaChart`,
`BarChart`, `DonutChart`, `TimelineItem`, `EvidenceBadge`, `ConfidenceGauge`,
`MetricCard`, `StatBlock`, `PhaseRibbon`, `AdoptionCurve`, `CitationEntry`,
`MonoTable`, `EmptyState`, one card per hallmark, and a barrel `index.ts`.
They are real component code — imported by the route consoles via
`@geistloom/ui` — and the `barrel.test.ts` smoke suite asserts the exported
surface stays stable across regenerations.

## 3. docs — 37 pages

`docs.mjs` writes a guide per route family (`docs/generated/apps-web-routes/*.md`),
the glossary (`docs/generated/glossary/*.md`, 25+ entries), and a
troubleshooting runbook. Each page carries the seed in its provenance footer
so a regenerated page can be traced to the engine run that produced it.

## 4. i18n — 12 locales with identical key sets

`i18n.mjs` writes `apps/web/i18n/locales/{en,es,fr,de,pt,zh,ja,ru,hi,ko,ar,ta}.json`
plus `locales-index.ts` (typed registry with per-locale coverage). Every
locale carries the same 120 keys; partial translations fall back to English
per key, and coverage is recorded in the index comments.

## Regeneration contract

1. edit the generator,
2. `bun run generate`,
3. `bunx biome check --write scripts/generators apps/web/app/explorer packages/ui/src/generated docs/generated apps/web/i18n`,
4. `bun run typecheck && bun run test`,
5. commit generated output **with** the generator change — the tree only
   builds if both land together.
