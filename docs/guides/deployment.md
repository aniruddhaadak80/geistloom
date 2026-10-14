# Deployment

Geistloom has four supported ways to run in production. All of them serve the
same byte-identical build; none require secrets for the default demo.

## 1. Vercel (recommended)

The repo is a standard Next.js monorepo that Vercel builds from source:

| Setting | Value |
| --- | --- |
| Root Directory | `apps/web` |
| Install Command | `bun install` (detected from the lockfile) |
| Build Command | `bun run build` (repo root, or leave default) |
| Output | Next.js default |

Environment variables (all optional — defaults are correct):

```
NEXT_PUBLIC_SIM_SEED=4093
NEXT_PUBLIC_APP_URL=https://your-domain
ORACLE_SERVICE_URL=         # set only to delegate the Oracle to the Python service
```

Deploy: `bunx vercel --prod` from the repo root, or connect the GitHub repo
in the Vercel dashboard (the included `deploy-vercel` workflow does the same
on every tag).

## 2. Docker / docker-compose

```bash
docker compose up --build    # web :3000, oracle :8000, relay :9119
```

The `runner` stage sets `GEISTLOOM_STANDALONE=1` during the build (the flag
our `next.config.ts` gates on) so `.next/standalone` is produced with the
patched `node_modules` layout. Healthcheck is wired to `/healthz`.

## 3. Fly.io

```bash
fly launch --no-deploy   # reads fly.toml
fly deploy
```

`fly.toml` builds with the Dockerfile and exposes the internal relay port
for the SSE stream.

## 4. Render / Railway

`render.yaml` and `railway.json` describe the same three-service topology.
Railway runs `bun run start` with `PORT` from its environment — Turbo passes
`PORT` through to the app via `globalPassThroughEnv`.

## Post-deploy smoke test

```bash
curl https://<your-deployment>/healthz          # {"status":"ok",...}
curl "https://<your-deployment>/og?title=Hi" | head -c 40   # <svg …>
```

Then open `/oracle` and ask it to solve aging. If the plan renders, the whole
deterministic frame is live.

## Notes

- The Century Engine per-run cost is a few megabytes of JSON for 200 years at
  quarterly steps; the API downsamples nothing, but the UI charts downsample
  client-side. For public high-traffic deployments, keep `/api/century/simulate`
  responses cached by seed at your CDN — they are pure functions of the body.
- `/api/stream` is an open-ended SSE endpoint; it self-closes after 200 ticks
  and needs no sticky sessions through the Go relay.
