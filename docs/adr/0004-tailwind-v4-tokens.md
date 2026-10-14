# ADR-0004: Tailwind v4 theme tokens as the single design language

- Status: Accepted
- Date: 2026-10-11

## Context

Geistloom has many surfaces: the web app, the docs site, the og:image route, and the generated SVG assets (banner, screens, architecture poster). Ad-hoc hex values in each surface drift apart — one more "teal" every month — and a rebrand becomes a grep-and-pray exercise.

## Decision

The Tailwind v4 `@theme` tokens are the single design language: `abyss`, `abyss-2`, `charcoal`, `bio-teal`, `bio-teal-dim`, `genome-violet`, `helix-amber`, `star-white`, `mist`, plus the two display faces (Space Grotesk for display, JetBrains Mono for mono). `scripts/gen-assets.mjs` imports the same constants as a plain palette object, so every generated SVG is token-identical to the DOM.

## Consequences

- One palette everywhere: a token change propagates to the app, the docs, and every regenerated SVG in one commit.
- Dark-first by construction — the abyss background is the default canvas, not an override.
- No raw hex values in component code; lint can enforce it.
- The SVG pipeline and the design system can never disagree, because they share the source of truth.
- Documentation must reference token names, not hex values, or it rots on the first palette tweak.
