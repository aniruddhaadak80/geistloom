import { z } from "zod";

/**
 * SDK contract types — the wire format between the web app,
 * the API routes and the Oracle Python service. Mirrors the
 * OpenAPI spec committed at services/oracle/openapi.yaml.
 */

export const OraclePlanPhaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  years: z.number(),
  description: z.string(),
  milestone: z.string(),
  confidence: z.number().min(0).max(1),
});

export const OraclePlanSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  domain: z.string(),
  title: z.string(),
  summary: z.string(),
  phases: z.array(OraclePlanPhaseSchema),
  keyNumbers: z.array(z.object({ label: z.string(), value: z.string(), unit: z.string() })),
  citations: z.array(z.string()),
  scenario: z.string(),
  seed: z.number(),
  model: z.string(),
});

export const CenturyConfigSchema = z.object({
  seed: z.number().int(),
  startYear: z.number().int().optional(),
  endYear: z.number().int().optional(),
  enabledInterventionIds: z.array(z.string()).optional(),
  scenarioId: z.string().optional(),
});

export const WorldStateSchema = z.object({
  year: z.number(),
  yearIndex: z.number().int(),
  population: z.number(),
  lifeExpectancy: z.number(),
  healthspan: z.number(),
  agingRate: z.number(),
  biosphereHealth: z.number(),
  gdpPerCapita: z.number(),
  aiCapability: z.number(),
  knowledgeStock: z.number(),
  interventionCoverage: z.number(),
  interventionLevels: z.record(z.string(), z.number()),
});

export const SimulationSummarySchema = z.object({
  endState: WorldStateSchema,
  baselineEndState: WorldStateSchema,
  lifeExpectancyGain: z.number(),
  yearsToEscapeVelocity: z.number().int().nullable(),
  peakPopulation: z.number(),
  finalBiosphereHealth: z.number(),
  levDetected: z.boolean(),
});

export const SimulationResultSchema = z.object({
  states: z.array(WorldStateSchema),
  summary: SimulationSummarySchema,
});

export type OraclePlan = z.infer<typeof OraclePlanSchema>;
export type OraclePlanPhase = z.infer<typeof OraclePlanPhaseSchema>;
export type CenturyConfig = z.infer<typeof CenturyConfigSchema>;
export type WorldState = z.infer<typeof WorldStateSchema>;
export type SimulationSummary = z.infer<typeof SimulationSummarySchema>;
export type SimulationResult = z.infer<typeof SimulationResultSchema>;
