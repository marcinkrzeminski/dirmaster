FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/hq/package.json ./apps/hq/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/cache/package.json ./packages/cache/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/hq/node_modules ./apps/hq/node_modules
COPY . .
RUN pnpm --filter hq build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/hq/.next/standalone ./
COPY --from=builder /app/apps/hq/.next/static ./apps/hq/.next/static
COPY --from=builder /app/apps/hq/public ./apps/hq/public

EXPOSE 3000
CMD ["node", "apps/hq/server.js"]
