import { forkFrom } from "@geistloom/core";
import { type WorldState, WorldStateSchema } from "@geistloom/sdk";

/**
 * Geistloom replay webhook — Bun's built-in server, zero dependencies.
 *
 *   bun run start                     # listens on :8787
 *
 *   curl -X POST http://localhost:8787/replay \
 *     -H 'content-type: application/json' \
 *     -d '{"state": <WorldState from any run>, "enabledInterventionIds": ["senolytics-dq"]}'
 *
 * It validates the posted state against the same zod schema the web app
 * uses, forks a 100-year world from that exact year, and answers with the
 * forked trajectory's final life expectancy and the year escape velocity
 * appeared — a demonstration that a Geistloom world state is a complete,
 * replayable coordinate.
 */

const PORT = Number(process.env.PORT ?? 8787);

function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

const server = Bun.serve({
  port: PORT,
  async fetch(request): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (request.method !== "POST" || pathname !== "/replay") {
      return Response.json(
        { error: "POST a WorldState to /replay — see examples/replay-webhook/src/server.ts" },
        { status: pathname === "/healthz" ? 200 : 404 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "body is not JSON" }, { status: 400 });
    }

    const payload = body as { state?: unknown; enabledInterventionIds?: unknown };
    const parsed = WorldStateSchema.safeParse(payload.state);
    if (!parsed.success) {
      return Response.json(
        {
          error: "state does not match the WorldState schema",
          issues: parsed.error.issues.slice(0, 3),
        },
        { status: 422 },
      );
    }
    const state: WorldState = parsed.data;

    const ids = Array.isArray(payload.enabledInterventionIds)
      ? payload.enabledInterventionIds.filter((id): id is string => typeof id === "string")
      : [];

    const forked = forkFrom(state, {
      seed: readNumber((body as { seed?: unknown }).seed, 4093),
      enabledInterventionIds: ids,
      endYear: readNumber((body as { endYear?: unknown }).endYear, state.year + 100),
    });

    const final = forked.states[forked.states.length - 1];
    return Response.json({
      forkedFrom: state.year,
      finalYear: final?.year ?? null,
      lifeExpectancyGain: forked.summary.lifeExpectancyGain,
      yearsToEscapeVelocity: forked.summary.yearsToEscapeVelocity,
      levDetected: forked.summary.levDetected,
      states: forked.states.length,
    });
  },
});

process.stdout.write(`replay webhook listening on http://localhost:${server.port}\n`);
