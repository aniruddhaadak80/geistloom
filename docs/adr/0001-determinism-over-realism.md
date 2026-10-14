# ADR-0001: Determinism over realism

- Status: Accepted
- Date: 2026-10-11

## Context

Geistloom promises a "superintelligence" on its surface. The obvious implementation — call a hosted LLM — costs money per request, sends user prompts off-machine, makes output non-reproducible, and breaks the frame's core thesis: that the reasoning itself is the product and must be auditable line by line. The demo also has to run with zero API keys and zero network calls, on a stranger's laptop, forever.

## Decision

All "AI" in the frame is a seeded local simulation. The Oracle is a six-state finite machine (`OracleBrain`) over a curated knowledge graph — 12 hallmarks, 30 interventions, 8 epigenetic clocks, 6 scenarios — scored with the `mulberry32` PRNG. The same prompt plus the same seed produces a byte-identical plan. No LLM calls by default, anywhere. A real-LLM plug-in is deferred to v1.0 and will be strictly opt-in, clearly labeled, and never the default path.

## Consequences

- Every plan is reproducible: tests can golden-file entire plans, and users can share a seed as a world coordinate.
- No API keys, no egress, no per-request cost; the demo runs offline.
- Plans are template-composed from real evidence (citations, effect sizes, mechanism text) rather than novel prose — the trade-off is fluency for auditability, which is the point.
- The knowledge graph is the moat: its curation quality bounds the Oracle's quality, so curation is a first-class engineering task.
- The optional v1.0 plug-in must be gated and disclosed, or it silently breaks every determinism guarantee above.
