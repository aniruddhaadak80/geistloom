import { askOracle } from "@geistloom/core";
import { NextResponse } from "next/server";
import { z } from "zod";

const OracleRequestSchema = z.object({
  prompt: z.string().min(1).max(2_000),
  seed: z
    .number()
    .int()
    .min(0)
    .max(2 ** 31 - 1)
    .optional(),
});

/**
 * POST /api/oracle — consult the deterministic Oracle.
 * Body: { prompt: string, seed?: number }. Returns the full OraclePlan
 * (phases, reasoningDag, keyNumbers, citations, scenario, model).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = OracleRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid oracle request.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const plan = askOracle({ prompt: parsed.data.prompt, seed: parsed.data.seed });
    return NextResponse.json(plan);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The Oracle could not answer.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
