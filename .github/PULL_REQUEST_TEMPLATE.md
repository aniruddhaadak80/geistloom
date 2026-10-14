## What changed

<!-- One paragraph. What, why, and the mental model behind it. -->

## How to test

<!-- Exact commands and the flows you exercised. -->

```powershell
bun run typecheck
bun run lint
bun run test
bun run build
```

## Evidence

<!--
Gate output, screenshots, or a link to a deployed preview.
If this changes architecture, embed a mermaid diagram from docs/diagrams/.
-->

## Checklist

- [ ] Deterministic: no new randomness without a seed
- [ ] No API keys or network calls added
- [ ] Tests added/updated for every changed module
- [ ] Docs updated where behavior changed
- [ ] Conventional commit message (`feat:`, `fix:`, `docs:`, `test:`, `chore:`)
