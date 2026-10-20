import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, askOracle, configureClient, simulateCentury } from "./client";

const plan = {
  id: "plan-1",
  prompt: "How do we slow ageing?",
  domain: "longevity",
  title: "Slowing ageing",
  summary: "A plan.",
  phases: [],
  keyNumbers: [],
  citations: [],
  scenario: "baseline",
  seed: 42,
  model: "oracle-v1",
};

const worldState = {
  year: 2050,
  yearIndex: 50,
  population: 9.7,
  lifeExpectancy: 85,
  healthspan: 75,
  agingRate: 0.8,
  biosphereHealth: 70,
  gdpPerCapita: 40,
  aiCapability: 80,
  knowledgeStock: 0.6,
  interventionCoverage: 0.4,
  interventionLevels: {},
};

const simulationResult = {
  states: [worldState],
  summary: {
    endState: worldState,
    baselineEndState: worldState,
    lifeExpectancyGain: 6.5,
    yearsToEscapeVelocity: 12,
    peakPopulation: 11.2,
    finalBiosphereHealth: 72,
    levDetected: false,
  },
};

/** Stub `fetch` and return the spy so the call can be inspected. */
function stubFetch(handler: (url: string, init: RequestInit) => Response) {
  const spy = vi.fn(async (url: string, init: RequestInit) => handler(url, init));
  vi.stubGlobal("fetch", spy);
  return spy;
}

/** The first call the stub received, or a loud failure if there was none. */
function firstCall(spy: ReturnType<typeof stubFetch>): [string, RequestInit] {
  const call = spy.mock.calls[0];
  if (!call) {
    throw new Error("fetch was never called");
  }
  return call;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  configureClient({});
});

describe("askOracle", () => {
  it("posts the prompt and the seed, and returns the parsed plan", async () => {
    const fetchSpy = stubFetch(() => new Response(JSON.stringify(plan), { status: 200 }));
    configureClient({ baseUrl: "https://api.example/" });

    const result = await askOracle("How do we slow ageing?", 42);

    expect(result.id).toBe("plan-1");
    const [url, init] = firstCall(fetchSpy);
    expect(url).toBe("https://api.example/api/oracle");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({
      prompt: "How do we slow ageing?",
      seed: 42,
    });
  });

  it("reports a failed response with its status and body", async () => {
    stubFetch(() => new Response("upstream exploded", { status: 502 }));

    const error = await askOracle("How do we slow ageing?").catch((cause: unknown) => cause);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(502);
    expect((error as ApiError).message).toBe("upstream exploded");
  });

  it("refuses a response that does not satisfy the contract", async () => {
    // Both ends of the wire are supposed to satisfy the same zod schema, so a
    // response that does not parse is drift, not a result.
    stubFetch(() => new Response(JSON.stringify({ id: "plan-1" }), { status: 200 }));

    await expect(askOracle("How do we slow ageing?")).rejects.toThrow();
  });
});

describe("simulateCentury", () => {
  it("rejects an invalid config before any request is made", async () => {
    const fetchSpy = stubFetch(() => new Response("{}", { status: 200 }));

    await expect(simulateCentury({ seed: 1.5 })).rejects.toThrow();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("posts the parsed config and returns the result", async () => {
    const fetchSpy = stubFetch(
      () => new Response(JSON.stringify(simulationResult), { status: 200 }),
    );

    const result = await simulateCentury({ seed: 7, startYear: 2026, endYear: 2126 });

    expect(result.states).toHaveLength(1);
    expect(result.summary.lifeExpectancyGain).toBe(6.5);
    const [url, init] = firstCall(fetchSpy);
    expect(url).toBe("/api/century/simulate");
    expect(JSON.parse(String(init.body))).toEqual({ seed: 7, startYear: 2026, endYear: 2126 });
  });
});

describe("configureClient", () => {
  it("strips a trailing slash from the base URL", async () => {
    const fetchSpy = stubFetch(() => new Response(JSON.stringify(plan), { status: 200 }));
    configureClient({ baseUrl: "https://api.example/" });

    await askOracle("How do we slow ageing?");

    expect(firstCall(fetchSpy)[0]).toBe("https://api.example/api/oracle");
  });

  it("falls back to the relative path when no base URL is set", async () => {
    vi.stubEnv("ORACLE_SERVICE_URL", "");
    const fetchSpy = stubFetch(() => new Response(JSON.stringify(plan), { status: 200 }));
    configureClient({ baseUrl: "https://api.example" });
    configureClient({});

    await askOracle("How do we slow ageing?");

    expect(firstCall(fetchSpy)[0]).toBe("/api/oracle");
  });
});
