# ADR-0010: Turbo build outputs, strict-env passthrough, and e2e port isolation

- Status: Accepted
- Date: 2026-10-13

## Context

Three integration bugs surfaced in one e2e debugging session, all with the
same root shape — implicit environment:

1. `turbo.json` declared no `outputs` for the `build` task, so a cache hit
   replayed logs without restoring `apps/web/.next`. Playwright's webServer
   then booted `next start` against a missing build and exited early.
2. Turbo 2.x strict-env mode swallowed `PORT` (and would swallow
   `GEISTLOOM_STANDALONE` in Docker builds), so the local server always bound
   `:3000` regardless of what the caller set.
3. Developer machines on this project run several stray Next.js dev servers;
   `:3000` belonged to an unrelated project ("Unspool"), which returned 404s
   for Geistloom routes and made the failures look like app bugs.

## Decision

- Declare `outputs: [".next/**", "!.next/cache/**", "dist/**"]` on the build
  task so cache hits restore the production build, not just its logs.
- Declare `globalEnv` (cache-key inputs) and `globalPassThroughEnv` for every
  env var the build or server reads: `GEISTLOOM_STANDALONE`,
  `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SIM_SEED`, `PORT`, `E2E_PORT`.
  `E2E_PORT` is deliberately pass-through-only so per-run ports never bust
  the build cache.
- Run e2e on a dedicated port (default 3100, overridable via `E2E_PORT`),
  with Playwright's webServer calling `bun run --cwd apps/web start` directly
  instead of through `turbo run start` (which rebuilds and re-resolves env).

## Consequences

- `bunx playwright test` is hermetic against stray servers on `:3000`.
- Docker keeps working because the Dockerfile sets `GEISTLOOM_STANDALONE=1`,
  which now actually reaches the build through the passthrough list.
- Any new env var read at build/server time must be added to one of the two
  lists; the failure mode for forgetting is a silently-ignored variable, so
  reviewers should treat `process.env` additions as turbo.json changes too.
