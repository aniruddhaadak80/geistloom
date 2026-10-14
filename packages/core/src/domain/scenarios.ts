/**
 * Future scenarios — the branches the worldboard can fork into.
 *
 * Each scenario is a named future with driver narratives, a probability
 * weight, and the parameter shifts it applies to the Century Engine.
 */

export interface Scenario {
  readonly id: string;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  /** Relative probability weight (unnormalized). */
  readonly weight: number;
  readonly drivers: readonly string[];
  readonly engineShifts: {
    readonly knowledgeMultiplier: number;
    readonly adoptionSpeedMultiplier: number;
    readonly biosphereDrift: number;
    readonly aiAcceleration: number;
  };
}

export const SCENARIOS: readonly Scenario[] = [
  {
    id: "bio-dividend",
    name: "The Bio-Dividend",
    tagline: "Reprogramming arrives early and compounding",
    description:
      "Partial reprogramming clears Phase II by 2031. Capital floods in, adoption curves steepen, and the knowledge stock compounds like Moore's law did for compute. Aging becomes a treatable condition inside a decade of the first approval.",
    weight: 0.22,
    drivers: [
      "OSK gene therapy replicates in a second tissue",
      "TIME-seq collapses trial cost 100×",
      "AI-designed delivery vectors cut R&D cycles",
    ],
    engineShifts: {
      knowledgeMultiplier: 1.8,
      adoptionSpeedMultiplier: 1.6,
      biosphereDrift: 0.1,
      aiAcceleration: 1.4,
    },
  },
  {
    id: "lev-2035",
    name: "Escape Velocity, 2035",
    tagline: "Every year lived buys back more than a year",
    description:
      "The de Grey window opens: senolytics + rapalogs + reprogramming stack. Remaining life expectancy gains exceed one year per year. Demography inverts — for the first time since the Black Death, the age pyramid stops narrowing at the top.",
    weight: 0.18,
    drivers: [
      "Three intervention classes approved in one decade",
      "Stacking effects proven in combination trials",
      "LEV becomes a policy target, not a meme",
    ],
    engineShifts: {
      knowledgeMultiplier: 2.2,
      adoptionSpeedMultiplier: 2.0,
      biosphereDrift: 0.0,
      aiAcceleration: 1.5,
    },
  },
  {
    id: "post-scarcity",
    name: "Post-Scarcity Biology",
    tagline: "Molecular abundance changes the economy of health",
    description:
      "AI-accelerated protein design (Baker's dream) makes biologics cheap to manufacture. Gene therapies cost less than a course of antibiotics. The binding constraint moves from molecules to meaning — and the scenario planner has to model things money can't buy.",
    weight: 0.15,
    drivers: [
      "Cell-free synthesis at commodity cost",
      "AlphaFold-class design for every target class",
      "Distributed biomanufacturing",
    ],
    engineShifts: {
      knowledgeMultiplier: 2.6,
      adoptionSpeedMultiplier: 1.9,
      biosphereDrift: 0.2,
      aiAcceleration: 1.9,
    },
  },
  {
    id: "stagnation",
    name: "The Long Stagnation",
    tagline: "Trials fail, capital retreats, the clock waits",
    description:
      "Two Phase III failures in a row (reprogramming delivery, senolytic specificity) scare off late-stage capital. Regulatory caution slows every subsequent trial. Aging keeps its crown — and the Century Engine shows how much a lost decade costs.",
    weight: 0.2,
    drivers: [
      "Delivery toxicity stalls gene therapy",
      "Biomarker endpoints rejected by regulators",
      "Funding cycle turns risk-off",
    ],
    engineShifts: {
      knowledgeMultiplier: 0.55,
      adoptionSpeedMultiplier: 0.6,
      biosphereDrift: -0.15,
      aiAcceleration: 0.8,
    },
  },
  {
    id: "divided-world",
    name: "The Divided World",
    tagline: "The therapies work — for some",
    description:
      "Interventions succeed technically but land in a fragmented world: adoption is fast where wealth is, slow where it isn't. Global life expectancy rises, but the gap between regions widens faster than the mean. Ethics route quantifies the divergence.",
    weight: 0.17,
    drivers: [
      "Gene therapy priced at seven figures",
      "Manufacturing concentration in three countries",
      "No global access framework",
    ],
    engineShifts: {
      knowledgeMultiplier: 1.2,
      adoptionSpeedMultiplier: 1.1,
      biosphereDrift: -0.05,
      aiAcceleration: 1.2,
    },
  },
  {
    id: "misalignment-shadow",
    name: "Misalignment Shadow",
    tagline: "The Oracle's plans run ahead of the frame",
    description:
      "AI-accelerated biology outpaces governance: a gene-drive field trial escapes containment; an automated lab synthesizes a dual-use construct. The world survives, but the Century Engine's biosphere health drops and every subsequent intervention gets a slower adoption curve.",
    weight: 0.08,
    drivers: [
      "Automated labs lower the bar for dual-use",
      "Gene-drive containment fails in one ecoregion",
      "Governance lags capability by a decade",
    ],
    engineShifts: {
      knowledgeMultiplier: 0.9,
      adoptionSpeedMultiplier: 0.7,
      biosphereDrift: -0.4,
      aiAcceleration: 1.6,
    },
  },
] as const;

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

/** Normalize scenario weights into probabilities that sum to 1. */
export function scenarioProbabilities(): Array<{ scenario: Scenario; probability: number }> {
  const total = SCENARIOS.reduce((acc, s) => acc + s.weight, 0);
  return SCENARIOS.map((s) => ({ scenario: s, probability: s.weight / total }));
}
