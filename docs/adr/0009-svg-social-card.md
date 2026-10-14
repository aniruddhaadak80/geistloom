# ADR-0009: Deterministic SVG social card over @vercel/og

- Status: Accepted
- Date: 2026-10-13

## Context

The `/og` social-card route used `@vercel/og` (`ImageResponse`, satori +
resvg-wasm). In production it returned closed connections: satori threw
`Expected <div> to have explicit "display: flex"` for the card JSX at
request time, so every `/og` hit 500'd — the one e2e failure in an otherwise
green suite. The dependency also pulled a wasm font/layout pipeline into a
repo whose contract is zero-network, zero-heavy-deps determinism.

## Decision

Replace the PNG route with a hand-built deterministic SVG (`app/og/route.ts`,
`image/svg+xml`). The card — loom mark, title wrap, chips, star field — is
pure string construction from the query params, byte-identical per param set,
with no image library, no font fetching, and no network. `public/images/og.svg`
(built by `scripts/gen-assets.mjs`) remains the static twin used in layout
metadata. Remove `@vercel/og` from `apps/web` dependencies entirely.

## Consequences

- `/og?title=…&subtitle=…` renders offline, in tests, and on every deploy
  target including the edge-less Docker image — no runtime was ever needed.
- Social platforms accept SVG poorly for link unfurls; the static
  `images/og.svg` is served for crawlers via metadata while `/og` serves
  humans and tests. If a PNG unfurl becomes required, the decision is to
  rasterize at build time (committed artifact), never to reintroduce a
  request-time renderer.
- One fewer wasm dependency in the install graph and lockfile.
