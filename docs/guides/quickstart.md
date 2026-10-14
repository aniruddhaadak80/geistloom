# Quickstart

Geistloom runs entirely on your machine. There is no database to provision,
no API key to buy, and no telemetry to refuse. The demo is the product.

## Requirements

- [Bun](https://bun.sh) ≥ 1.2 (the repo is a Bun workspace)
- Node 20+ is pulled in transparently by the Next toolchain
- Optional: Rust (for the crate's own tests) and Python 3.11+ (for the FastAPI mirror)

## Run the app

```bash
git clone <your fork>
cd geistloom
bun install
bun run dev        # http://localhost:3000
```

The first page after the landing is `/oracle` — type `solve aging` and press
**Consult the Oracle**. Everything you see is computed locally.

## Generate everything machine-written

```bash
bun run generate   # scale engine: explorer routes, UI kit, docs, locales
bun run seed       # deterministic seed-4093 datasets for packages/seed
bun scripts/gen-assets.mjs   # SVG banner/logo/og/screens — byte-identical each run
```

## Prove it

```bash
bun run typecheck   # tsc across 5 workspaces
bun run lint        # biome (format + lint)
bun run test        # 97 unit tests across core, sdk, ui, seed, web
bun run build       # Next.js production build
bunx playwright install chromium
bunx playwright test   # 6 e2e tests incl. axe a11y
```

## Alternative front doors

```bash
# the deterministic social card
curl "http://localhost:3000/og?title=Hello" --output og.svg

# the oracle API
curl -X POST http://localhost:3000/api/oracle \
  -H 'content-type: application/json' \
  -d '{"prompt":"solve aging"}'

# the century engine API (200 years, one intervention)
curl -X POST http://localhost:3000/api/century/simulate \
  -H 'content-type: application/json' \
  -d '{"seed":4093,"enabledInterventionIds":["senolytics-dq"],"endYear":2126}' | head -c 200
```

## The polyglot services (optional)

```bash
# Python oracle mirror (same plans as the TS engine, on :8000)
cd services/oracle && python -m pytest && uvicorn app.main:app --port 8000

# Go SSE relay (worldboard stream, on :9119)
cd services/relay && go test ./... && go run . --addr :9119
```

Point the web app at the Python oracle with `ORACLE_SERVICE_URL=http://localhost:8000`.

## What to click first

1. `/oracle` — ask anything; read the reasoning DAG.
2. `/century` — enable three interventions, run, watch life expectancy split from baseline.
3. `/century` scrubber — jump to 2075, then **Fork from this year**.
4. `/worldboard` — every simulated state, live.
5. `/lab` — design a genetic construct and clear its containment gates.
