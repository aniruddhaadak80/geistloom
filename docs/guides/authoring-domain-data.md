# Authoring domain data

The frame's knowledge is code. Adding a new intervention, hallmark, epigenetic
clock, or scenario is a Pull Request against `packages/core/src/domain`, and
the regeneration step does the rest.

## Anatomy of an intervention

```ts
// packages/core/src/domain/interventions.ts
{
  id: "senolytics-dq",              // kebab-case, stable forever
  name: "Dasatinib + Quercetin",
  klass: "small-molecule",          // drives the /interventions class filter
  evidence: "clinical",             // theoretical | preclinical | clinical | approved
  targetHallmarkIds: ["cellular-senescence"],
  adoptionYear: 2028,               // when the adoption curve starts rising
  adoptionSpeed: 0.09,              // S-curve slope
  agingRateReduction: 0.13,         // share of natural aging removed at full coverage
  knowledgeUnlockYear: 2030,        // needs this much knowledge stock to bite
  costIndex: 0.4,                   // relative cost, feeds the ethical review
  riskMultiplier: 1.15,             // risk index, feeds /ethics value tuning
  summary: "...",                   // one screen of plain prose
  mechanism: "...",                 // the biology, precisely stated
  measuredBy: "SA-β-gal, p16INK4a", // what proves it worked
  citations: [{ label: "...", url: "https://..." }],
}
```

Field by field:

- **`evidence`** powers the quadrant chart (readiness axis) — be conservative.
- **`agingRateReduction`** is the number the Century Engine multiplies into
  life-expectancy lift. A 0.13 intervention at full coverage adds roughly
  `0.13 × 22 ≈ 2.9` years of life expectancy at equilibrium. Sanity-check your
  value against the existing atlas before claiming more than that.
- **`adoptionYear` + `adoptionSpeed`** form an S-curve `coverageAt(year)`;
  the century engine samples it every step and stores it in
  `interventionLevels` for replay.

## Adding a hallmark

Same file family — `hallmarks.ts` — with `layer`, `category` (primary /
antagonistic / integrative, matching the 2023 hallmarks paper), `mechanism`,
`measuredBy`, and `interventionIds` back-references.

## After editing domain data

```bash
bun run generate        # explorer detail routes pick up new ids automatically
bun run test            # the atlas counts test will tell you the new numbers
bun run lint
```

`scripts/generators/routes.mjs` extracts the literal ids from the domain
sources at generation time, so `/explorer/interventions/<your-id>` exists the
moment the data lands — no route authoring, no drift.

## Review bar

New entries are reviewed for: (1) a real citation the reviewer can open,
(2) internal consistency with existing hallmarks, (3) a conservative evidence
grade, and (4) determinism — nothing in the file may call random APIs.
