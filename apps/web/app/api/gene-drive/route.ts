import { simulateGeneDrive } from "@geistloom/core";
import { NextResponse } from "next/server";
import { z } from "zod";

const GeneDriveRequestSchema = z.object({
  driveEfficiency: z.number().min(0).max(1).optional(),
  resistanceRate: z.number().min(0).max(1).optional(),
  fitnessCost: z.number().min(0).max(1).optional(),
  initialFrequency: z.number().min(0).max(1).optional(),
  generations: z.number().int().min(1).max(1_000).optional(),
});

/**
 * POST /api/gene-drive — run the three-allele gene-drive model.
 * Body: Partial<GeneDriveParams>. Returns the per-generation states
 * array (wild / drive / resistant frequencies, mean fitness).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = GeneDriveRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid gene-drive request.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const states = simulateGeneDrive(parsed.data);
  return NextResponse.json(states);
}
