import { getScenario, simulateCentury } from "@geistloom/core";
import { NextResponse } from "next/server";
import { z } from "zod";

const CenturySimulateSchema = z.object({
  seed: z
    .number()
    .int()
    .min(0)
    .max(2 ** 31 - 1),
  enabledInterventionIds: z.array(z.string()).max(64).optional(),
  scenarioId: z.string().max(64).optional(),
  endYear: z.number().int().min(2027).max(2400).optional(),
});

/**
 * POST /api/century/simulate — run the Century Engine.
 * Body: { seed, enabledInterventionIds?, scenarioId?, endYear? }.
 * A scenarioId applies that scenario's engineShifts on top of the
 * intervention stack. Returns { states, summary }.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = CenturySimulateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid century simulation request.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const scenarioId = parsed.data.scenarioId;
  const scenario = scenarioId ? getScenario(scenarioId) : undefined;
  if (scenarioId && !scenario) {
    return NextResponse.json({ error: `Unknown scenario: ${scenarioId}` }, { status: 400 });
  }

  const result = simulateCentury({
    seed: parsed.data.seed,
    enabledInterventionIds: parsed.data.enabledInterventionIds,
    endYear: parsed.data.endYear,
    scenarioShifts: scenario?.engineShifts,
  });

  return NextResponse.json({ states: result.states, summary: result.summary });
}
