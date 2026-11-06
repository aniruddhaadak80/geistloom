# syntax=docker/dockerfile:1
# Geistloom — multi-stage production image.
# Stage 1: install + build the monorepo (web + packages).
# Stage 2: standalone Next.js runtime, non-root, healthcheck on /healthz.

FROM oven/bun:1.4 AS deps
WORKDIR /app
COPY package.json bun.lockb ./
COPY apps apps
COPY packages packages
RUN bun install --frozen-lockfile

FROM deps AS builder
COPY . .
# Standalone output is required by the runner stage below; it needs
# symlink privileges the default Windows desktop lacks, hence the
# env gate in apps/web/next.config.ts.
ENV GEISTLOOM_STANDALONE=1
RUN bun run build

FROM oven/bun:1.4 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_SIM_SEED=4093
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public
USER bun
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/healthz || exit 1
CMD ["bun", "run", ".next/standalone/server.js"]
