# API: The SDK client

`@geistloom/sdk` is the typed bridge between any client (the web app, an
example CLI, your own fork) and the Geistloom routes. It has two halves: the
zod contracts and the fetch client.

## Install (inside the monorepo)

```ts
import { askOracle, simulateCentury, ApiError } from "@geistloom/sdk";
```

## Usage

```ts
// Ask the Oracle
const plan = await askOracle("solve aging", 4093);
console.log(plan.phases.length);          // 6
console.log(plan.phases[0]?.confidence);  // e.g. 0.92 — guarded for noUncheckedIndexedAccess

// Run the Century Engine — the full result: states + summary
const { states, summary } = await simulateCentury({
  seed: 4093,
  enabledInterventionIds: ["senolytics-dq", "rapamycin-class"],
  endYear: 2126,
});
const final = states[states.length - 1];
console.log(summary.lifeExpectancyGain, summary.levDetected);
```

## What it guarantees

- **Wire parity.** Both the TypeScript engine and the Python service parse
  their payloads with the same schemas, so a client written against the SDK
  works against either deployment.
- **Validation at the edge.** `ApiError` distinguishes contract violations
  (zod, client-side) from transport failures, and every response body is
  parsed before it reaches your code — a malformed run crashes the client, not
  your component.
- **Zero secrets.** The client needs only a base URL; nothing authenticates.

## Extending

New endpoints follow the same three steps:

1. add the zod schema + inferred type in `src/types.ts`,
2. add a method in `src/client.ts` using the shared `request()` helper,
3. export it from `src/index.ts` and cover it in `src/client.test.ts`.
