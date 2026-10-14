import type { z } from "zod";
import {
  type CenturyConfig,
  CenturyConfigSchema,
  type OraclePlan,
  OraclePlanSchema,
  type SimulationResult,
  SimulationResultSchema,
} from "./types";

/**
 * Typed client for the Geistloom API surface.
 *
 * The web app talks to this client; the client talks to
 * Next.js route handlers (which delegate to @geistloom/core)
 * or, when ORACLE_SERVICE_URL is set, to the Python Oracle
 * service. Both ends satisfy the same zod contracts, so the
 * wire format is provably identical.
 */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Optional base URL for non-browser clients (CLIs, workers, scripts).
 * In the browser the origin is implicit; in Node it would otherwise
 * resolve to a relative path, which no fetch can reach.
 */
let baseUrlOverride: string | undefined;

export function configureClient(options: { readonly baseUrl?: string }): void {
  baseUrlOverride = options.baseUrl?.replace(/\/$/, "") ?? undefined;
}

async function request<T>(path: string, init: RequestInit & { schema: z.ZodType<T> }): Promise<T> {
  const base =
    baseUrlOverride ??
    (typeof window === "undefined" ? (process.env.ORACLE_SERVICE_URL ?? "") : "");
  const res = await fetch(`${base}${path}`, {
    headers: { "content-type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new ApiError(res.status, await res.text());
  }
  const json = await res.json();
  return init.schema.parse(json);
}

/** POST /api/oracle — ask the deterministic Oracle. */
export async function askOracle(prompt: string, seed?: number): Promise<OraclePlan> {
  return request("/api/oracle", {
    method: "POST",
    body: JSON.stringify({ prompt, seed }),
    schema: OraclePlanSchema,
  });
}

/**
 * POST /api/century/simulate — run the Century Engine.
 * Returns the full result: states plus the comparison summary.
 */
export async function simulateCentury(config: CenturyConfig): Promise<SimulationResult> {
  const parsed = CenturyConfigSchema.parse(config);
  return request("/api/century/simulate", {
    method: "POST",
    body: JSON.stringify(parsed),
    schema: SimulationResultSchema,
  });
}
