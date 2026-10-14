/**
 * The Timeline — real milestones in biotechnology, genetic engineering, and
 * AI-for-science, plus the simulated projection band where the Oracle's
 * forecasts live. Projection entries carry explicit confidence so the line
 * between history and speculation is always visible.
 */

export interface Milestone {
  readonly id: string;
  readonly year: number;
  readonly title: string;
  readonly detail: string;
  readonly domain: "genetic-engineering" | "longevity" | "ai-science" | "demography" | "governance";
  readonly kind: "history" | "projection";
  /** 0–1 confidence; only meaningful for projections. */
  readonly confidence: number;
}

export const MILESTONES: readonly Milestone[] = [
  {
    id: "m-2012-crispr",
    year: 2012,
    title: "CRISPR-Cas9 becomes programmable",
    detail:
      "Jinek, Chylinski, Doudna & Charpentier show Cas9 can be retargeted with a 20-nt guide RNA — the moment genetic engineering became a word processor.",
    domain: "genetic-engineering",
    kind: "history",
    confidence: 1,
  },
  {
    id: "m-2013-horvath",
    year: 2013,
    title: "The first epigenetic clock",
    detail:
      "Horvath's pan-tissue DNA methylation clock (353 CpGs, 51 tissues) makes biological age measurable — the yardstick every longevity trial now runs on.",
    domain: "longevity",
    kind: "history",
    confidence: 1,
  },
  {
    id: "m-2015-gene-drive",
    year: 2015,
    title: "First synthetic gene drives",
    detail:
      "CRISPR-based homing drives in yeast, fruit flies, and mosquitoes show super-Mendelian inheritance — and launch the global governance debate Esvelt still leads.",
    domain: "genetic-engineering",
    kind: "history",
    confidence: 1,
  },
  {
    id: "m-2018-senolytics",
    year: 2018,
    title: "Senolytics extend mouse lifespan",
    detail:
      "Dasatinib+quercetin clears senescent cells in old mice: physical function up, remaining lifespan +36% (Xu et al., Nature Medicine).",
    domain: "longevity",
    kind: "history",
    confidence: 1,
  },
  {
    id: "m-2019-grimage",
    year: 2019,
    title: "GrimAge predicts lifespan",
    detail:
      "Second-generation clock trained on Framingham: DNA methylation now predicts time-to-death better than smoking or blood pressure in several cohorts.",
    domain: "longevity",
    kind: "history",
    confidence: 1,
  },
  {
    id: "m-2020-alphafold",
    year: 2020,
    title: "AlphaFold2 solves protein folding",
    detail:
      "DeepMind's model predicts single-chain protein structure at near-experimental accuracy — the first proof that AI can collapse a 50-year grand challenge in biology.",
    domain: "ai-science",
    kind: "history",
    confidence: 1,
  },
  {
    id: "m-2023-casgevy",
    year: 2023,
    title: "Casgevy: first CRISPR therapy approved",
    detail:
      "FDA/UK MHRA approve exagamglogene autotemcel for sickle-cell disease and β-thalassemia — genetic engineering becomes medicine, not just research.",
    domain: "genetic-engineering",
    kind: "history",
    confidence: 1,
  },
  {
    id: "m-2023-hallmarks",
    year: 2023,
    title: "Twelve hallmarks of aging",
    detail:
      "López-Otín et al. expand the 2013 taxonomy to twelve hallmarks — the map the Intervention Atlas and Century Engine are built on.",
    domain: "longevity",
    kind: "history",
    confidence: 1,
  },
  {
    id: "m-2024-nobel",
    year: 2024,
    title: "Nobel Chemistry: AI does biology",
    detail:
      "Hassabis, Jumper (AlphaFold2) and Baker (computational protein design) share the prize — 200M+ predicted structures now serve 2M+ researchers.",
    domain: "ai-science",
    kind: "history",
    confidence: 1,
  },
  {
    id: "m-2025-prime",
    year: 2025,
    title: "Prime editing enters humans",
    detail:
      "Prime Medicine reports the first clinical efficacy/safety data for a prime editor (chronic granulomatous disease) — all 12 base conversions, no DSBs.",
    domain: "genetic-engineering",
    kind: "history",
    confidence: 1,
  },
  {
    id: "m-2026-today",
    year: 2026,
    title: "Today: the frame is set",
    detail:
      "UN WPP puts world life expectancy at 73.8 years and population at ~8.09B. LEAP Wave 8 experts give AGI a median of 2050; superforecasters say 2047. Geistloom starts here.",
    domain: "demography",
    kind: "history",
    confidence: 1,
  },
  {
    id: "m-2029-reprogram",
    year: 2029,
    title: "First partial-reprogramming Phase II readout",
    detail:
      "Projected: OSK gene-therapy trials report epigenetic-age reversal in a tissue-specific indication. Confidence: moderate — delivery remains the bottleneck.",
    domain: "longevity",
    kind: "projection",
    confidence: 0.55,
  },
  {
    id: "m-2033-agi",
    year: 2033,
    title: "AGI at 50% (Existential Security Summit)",
    detail:
      "Projected: 59 experts at the 2026 Summit on Existential Security put 50% odds of AGI by 2033 — the year the Oracle's forecasts start compounding.",
    domain: "ai-science",
    kind: "projection",
    confidence: 0.5,
  },
  {
    id: "m-2035-lev",
    year: 2035,
    title: "Longevity escape velocity window",
    detail:
      "Projected: de Grey's 50% window for LEV opens mid-to-late 2030s — remaining life expectancy starts gaining more than a year per year.",
    domain: "longevity",
    kind: "projection",
    confidence: 0.4,
  },
  {
    id: "m-2047-agi",
    year: 2047,
    title: "AGI median (superforecasters)",
    detail:
      "Projected: LEAP Wave 8 superforecasters' median year for majority-panel agreement that AGI exists. Experts say 2050; 25% say by 2039.",
    domain: "ai-science",
    kind: "projection",
    confidence: 0.45,
  },
  {
    id: "m-2050-experts",
    year: 2050,
    title: "AGI median (expert panel)",
    detail:
      "Projected: the LEAP expert median. Also the UN WPP horizon: baseline life expectancy 77.2 years, population ~9.7B without intervention.",
    domain: "ai-science",
    kind: "projection",
    confidence: 0.5,
  },
  {
    id: "m-2100-baseline",
    year: 2100,
    title: "Baseline century closes",
    detail:
      "Projected: with no revolutionary intervention, UN WPP trends end at life expectancy ~81.7 years. The Century Engine shows what happens when the Oracle's plans land on top.",
    domain: "demography",
    kind: "projection",
    confidence: 0.7,
  },
] as const;

export function milestonesInRange(fromYear: number, toYear: number): Milestone[] {
  return MILESTONES.filter((m) => m.year >= fromYear && m.year <= toYear);
}
