# ── Stage 1: Install production dependencies ──────────────────────────────
FROM node:22-bookworm-slim AS deps

WORKDIR /app

# Copy dependency manifests and prisma schema (needed for postinstall prisma generate)
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Install production dependencies only (triggers postinstall → prisma generate)
RUN npm ci --omit=dev

# ── Stage 2: Build the Next.js application ───────────────────────────────
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy full source
COPY . .

# NEXT_PUBLIC_* vars are baked into the JS bundle at build time.
# Pass via --build-arg or docker-compose build args.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
ARG NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_DISABLE_BROWSER_TRANSLATE

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=$NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
ENV NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=$NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_DISABLE_BROWSER_TRANSLATE=$NEXT_PUBLIC_DISABLE_BROWSER_TRANSLATE

# Build Next.js (output: "standalone" generates a self-contained .next/standalone dir)
RUN npm run build

# ── Stage 3: Production runner ───────────────────────────────────────────
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone output (server.js + node_modules + app source)
COPY --from=builder /app/.next/standalone ./

# Copy static assets into .next/static
COPY --from=builder /app/.next/static ./.next/static

# Copy public assets
COPY --from=builder /app/public ./public

# lazada-api-client is loaded via eval("require") at runtime — the standalone
# tracer can't follow eval() calls, so copy it explicitly.
COPY --from=builder /app/node_modules/lazada-api-client ./node_modules/lazada-api-client

# Prisma needs the schema at runtime for some operations
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "server.js"]
