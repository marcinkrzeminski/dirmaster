FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/directory/package.json ./apps/directory/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/cache/package.json ./packages/cache/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/directory/node_modules ./apps/directory/node_modules
COPY . .
RUN pnpm --filter directory build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/directory/.next/standalone ./
COPY --from=builder /app/apps/directory/.next/static ./apps/directory/.next/static
COPY --from=builder /app/apps/directory/public ./apps/directory/public

EXPOSE 3001
CMD ["node", "apps/directory/server.js"]
