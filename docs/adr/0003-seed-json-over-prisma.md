# ADR-0003: Seed-JSON datasets over Prisma/SQLite for the zero-config demo

- Status: Accepted
- Date: 2026-10-11

## Context

The demo must run after `bun install && bun run dev` — no database provisioning, no migrations, no `docker compose` prerequisite. The datasets (hallmarks, interventions, clocks, scenarios, seed worlds) are read-mostly, small enough to commit, and identical for every user.

## Decision

Ship `packages/seed` with generated, committed JSON (seed 4093) imported directly by `packages/core` and the web app. No Prisma, no SQLite, no database server in the demo path. Writes are simulated in memory per session; nothing persists to disk.

## Consequences

- Clone-run works cold: zero config, zero services, deterministic content for every visitor.
- Seed data is versioned with the code — a PR can review a dataset change like any other diff.
- The scale path stays open: swap the seed module for Postgres behind the same interface later, without touching `packages/core`.
- Read-heavy analytics (e.g. "all interventions for hallmark X") are plain array operations over committed data — fast enough at this scale, and the scale engine documents the ceiling.
- Multi-user persistence is explicitly out of scope for the demo; the archive library simulates it deterministically.
