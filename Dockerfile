# Multi-stage build for the Kubernetes deployment. Vercel's own build
# pipeline builds this app separately and never uses this file — this only
# matters for the K8s copy (see docs/DEPLOYMENT.md).

# ---- deps: install dependencies from the lockfile only -------------------
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: run the actual Next.js production build ---------------------
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time-only placeholders so `next build` can statically analyze routes
# that reference these env vars — the real values are injected at runtime via
# the Kubernetes Secret (see k8s/01-secret.yaml.example), never baked into the image.
ENV GITHUB_TOKEN="" \
    ADMIN_PASSWORD="" \
    GITHUB_CLIENT_ID="" \
    GITHUB_CLIENT_SECRET="" \
    CRON_SECRET="" \
    KV_REST_API_URL="" \
    KV_REST_API_TOKEN="" \
    KV_REST_API_READ_ONLY_TOKEN=""
RUN npm run build

# ---- runner: minimal production image --------------------------------------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Next.js standalone output (see next.config.ts's `output: 'standalone'`)
# already contains only the files needed to run — no full node_modules copy.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
