import { mulberry32 } from "@geistloom/core";

const EVENT_COUNT = 200;
const TICK_MS = 25;
const START_YEAR = 2026;
const DEFAULT_SEED = 4093;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * GET /api/stream?seed=4093 — SSE stream of deterministic world ticks.
 *
 * The only randomness is mulberry32(seed): the same seed always emits
 * the same 200 ticks. Each event carries the run identity and the
 * three headline indicators the worldboard plots.
 */
export async function GET(request: Request) {
  const seedParam = new URL(request.url).searchParams.get("seed");
  const parsed = seedParam === null ? NaN : Number.parseInt(seedParam, 10);
  const seed = Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_SEED;

  const rng = mulberry32(seed);
  const runId = `run-${seed.toString(16)}`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let lifeExpectancy = 73.8;
      let population = 8.09;
      let biosphereHealth = 66;

      for (let i = 0; i < EVENT_COUNT; i++) {
        const year = START_YEAR + i;
        lifeExpectancy = round2(lifeExpectancy + 0.06 + rng() * 0.14);
        population = round3(population + 0.004 + (rng() - 0.5) * 0.012);
        biosphereHealth = round2(clamp(biosphereHealth + (rng() - 0.42) * 0.9, 2, 100));

        const event = { runId, year, lifeExpectancy, population, biosphereHealth };
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          break; // client disconnected mid-stream
        }
        await sleep(TICK_MS);
      }

      try {
        controller.close();
      } catch {
        // stream already errored or closed
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
    },
  });
}
