# Architecture Decision Records

The rules Geistloom is built by. Each record is short: context, decision, consequences.

| ADR | Title | Status |
| --- | --- | --- |
| [0001](0001-determinism-over-realism.md) | Determinism over realism | Accepted |
| [0002](0002-domain-logic-in-core.md) | Domain logic lives in packages/core as pure functions | Accepted |
| [0003](0003-seed-json-over-prisma.md) | Seed-JSON datasets over Prisma/SQLite for the zero-config demo | Accepted |
| [0004](0004-tailwind-v4-tokens.md) | Tailwind v4 theme tokens as the single design language | Accepted |
| [0005](0005-polyglot-services.md) | Three polyglot services — each earns its place | Accepted |
| [0006](0006-svg-only-pipeline.md) | SVG-only image pipeline (gen-assets.mjs) | Accepted |
| [0007](0007-mermaid-sources-committed.md) | Mermaid .mmd sources committed alongside embedded blocks | Accepted |
| [0008](0008-exact-optional-property-types.md) | exactOptionalPropertyTypes disabled — strict + noUncheckedIndexedAccess kept | Accepted |
| [0009](0009-svg-social-card.md) | Deterministic SVG social card over @vercel/og | Accepted |
| [0010](0010-turbo-env-and-e2e-port.md) | Turbo build outputs, strict-env passthrough, and e2e port isolation | Accepted |

New decisions follow the same format: `# ADR-000N: Title`, `Status: Accepted`, then Context / Decision / Consequences. Propose with a PR; accepted records are append-only (supersede by writing a new record that links back).
