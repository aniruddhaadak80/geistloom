# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅        |

## Reporting a vulnerability

Geistloom is a simulation framework: it makes no network calls, stores no user
data, and runs no third-party code at runtime. The attack surface is therefore
the usual one for a monorepo — dependency supply chain and build tooling.

If you find a vulnerability:

1. **Do not open a public issue.** Use the private advisory channel:
   https://github.com/aniruddhaadak80/geistloom/security/advisories/new
2. Include a reproduction, affected versions, and (if known) impact.
3. Expect an initial response within **72 hours** and a fix or mitigation plan
   within **14 days** for anything rated high or critical.

## Hard rules of the frame

- No API keys, anywhere. The Oracle is deterministic by design; if a future
  contributor wires in a real LLM, it must be opt-in, env-gated, and documented.
- No telemetry. The relay daemon is self-hosted by definition.
- Dependencies are pinned via lockfile and audited by Dependabot + CodeQL.
