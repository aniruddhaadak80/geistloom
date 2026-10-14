import { SimulationResultSchema, WorldStateSchema } from "@geistloom/sdk";
import { describe, expect, it } from "vitest";
import { simulateCentury } from "./century-engine";

/**
 * Wire parity: everything the Century Engine emits must pass the
 * @geistloom/sdk zod contracts, because those contracts are what the
 * Next.js routes serialize and what external clients (examples, the
 * Python service, forks) validate against. A field added to WorldState
 * without a matching schema change fails here, loudly, before it can
 * break a client at runtime.
 */
describe("wire parity with @geistloom/sdk", () => {
  it("every engine state validates against WorldStateSchema", () => {
    const { states } = simulateCentury({ seed: 4093, endYear: 2030 });
    expect(states.length).toBeGreaterThan(0);
    for (const state of states) {
      const parsed = WorldStateSchema.safeParse(state);
      if (!parsed.success) {
        throw new Error(
          `state @ ${state.year} rejected: ${JSON.stringify(parsed.error.issues.slice(0, 2))}`,
        );
      }
    }
  });

  it("the full simulation result validates against SimulationResultSchema", () => {
    const result = simulateCentury({ seed: 4093, endYear: 2030 });
    const parsed = SimulationResultSchema.safeParse(result);
    if (!parsed.success) {
      throw new Error(`result rejected: ${JSON.stringify(parsed.error.issues.slice(0, 3))}`);
    }
  });

  it("a forked run also validates (forkFrom emits the same shape)", async () => {
    const { forkFrom, stateAt } = await import("./century-engine");
    const base = simulateCentury({ seed: 4093, endYear: 2030 });
    const anchor = stateAt(base.states, 2028);
    if (!anchor) throw new Error("anchor state missing");
    const forked = forkFrom(anchor, { seed: 4093, endYear: 2080 });
    const parsed = SimulationResultSchema.safeParse(forked);
    expect(parsed.success).toBe(true);
  });
});
