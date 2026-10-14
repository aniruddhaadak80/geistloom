# ADR-0008: exactOptionalPropertyTypes disabled — strict + noUncheckedIndexedAccess kept

- Status: Accepted
- Date: 2026-10-11

## Context

The repo compiles with `strict: true`. Two stricter flags were evaluated: `noUncheckedIndexedAccess` (catches real bugs in engine tables and PRNG sampling) and `exactOptionalPropertyTypes` (distinguishes absent from `undefined`). The latter makes generated code, seed datasets, and zod-shaped optionals significantly more painful — every conditional property assignment needs `| undefined` noise — for little safety gain in a codebase where optionals are almost always "may be provided by the caller."

## Decision

Keep `strict` and `noUncheckedIndexedAccess` repo-wide. Disable `exactOptionalPropertyTypes` repo-wide, in every tsconfig (apps, packages, crates-adjacent tooling). The trade-off is recorded here, not left implicit.

## Consequences

- Indexed access (`arr[i]`) still requires a guard or a non-null assertion — the engine and domain tables stay safe against holes.
- Generated code, seed builders, and config objects stay ergonomic: `{ label?: string }` accepts conditional assignment without `undefined` noise.
- The trade-off is explicit and revisited if generated-code patterns change (e.g. a new codegen that would benefit from exactness).
- New packages inherit the base tsconfig and cannot silently re-enable the flag; a PR doing so must update this ADR.
