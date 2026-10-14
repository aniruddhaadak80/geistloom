# Contributing to Geistloom

Thank you for wanting to extend the frame. Geistloom is a deterministic
simulation observatory: **no API keys, no network calls, no randomness
without a seed**. Every contribution must preserve that contract.

## Quickstart

```powershell
git clone https://github.com/aniruddhaadak80/geistloom.git
cd geistloom
bun install
bun run dev          # Next.js on :3000
bun run test         # vitest across all packages
bun run loc          # line-of-code census
```

Optional services (the app runs fine without them):

```powershell
cd services/oracle && pip install -e ".[dev]" && uvicorn oracle_service.main:app --port 8787
cd crates/loom-engine && cargo test
cd services/relay && go run . --addr :9119
```

## Development rules

1. **Determinism is law.** Any new randomness must flow from a seeded PRNG
   (`packages/core/src/prng.ts`). Same input → same output, forever.
2. **Domain logic lives in `packages/core`** as pure, dependency-free,
   tested functions. Route handlers are thin adapters.
3. **Tests ship with the code.** Every module gets a vitest suite; every
   API route gets a contract test against its zod schema.
4. **Conventional Commits**: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
   One logical change per commit. History should read like a story.
5. **No secrets.** `.env.example` documents every variable; real values
   only via `{env:...}` or `{file:...}` substitution.

## Branch strategy

- `main` — always deployable (CI enforces all gates)
- `develop` — integration branch
- `feat/<name>` — feature branches, rebase onto `develop`

## PR process

1. Fork, branch, build, test locally (`bun run ci` runs every gate).
2. Open the PR with the template — what, why, how to test, evidence.
3. CI runs: typecheck → lint → unit tests → Rust/Python/Go suites → build → Playwright e2e.
4. One maintainer approval minimum. Squash-merge.

## Good first issues

Look for the `good first issue` label. Typical entry points:

- Add an intervention to the atlas (`packages/core/src/domain/interventions.ts`)
- Add a milestone to the timeline (real, dated, sourced)
- Write an ADR for a decision you disagree with
- Extend a generator in `scripts/generators/`

## Questions

[GitHub Discussions](https://github.com/aniruddhaadak80/geistloom/discussions) —
the community is friendly and the Oracle is patient.
