# ADR-0007: Mermaid .mmd sources committed alongside embedded blocks

- Status: Accepted
-Date: 2026-10-11

## Context

Architecture diagrams rot when they live only in prose, and external diagram hosts are SaaS with a lifecycle of their own. GitHub renders fenced ```mermaid blocks natively, but then the "source" is a string inside a markdown file — hard to diff, hard to reuse, and easy to edit in one place while forgetting the other.

## Decision

The 13 diagrams live as `.mmd` sources in `docs/diagrams/` (each with its theme config inlined as a `%%{init}%%` directive), and the README embeds the same content as fenced mermaid blocks. The `.mmd` file is the source of truth; the README block is the rendered truth. A CI check re-embeds the sources into the README and fails on drift.

## Consequences

- Diagrams are versioned, diffable, and render natively on GitHub with the Geistloom palette.
- Theme variables travel with each diagram — no global mermaid config to maintain.
- Drift between README and sources is caught mechanically, not by review vigilance.
- Front-matter `---` lines in `.mmd` files are stripped when embedding; only the mermaid body is committed to the README.
- Diagram-as-code means the milestone cascade and the class model can be referenced from docs, issues, and PRs by file path.
