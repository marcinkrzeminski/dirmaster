# DirMaster

A full-stack directory platform monorepo. Create and manage beautiful, SEO-optimized directory sites with a powerful admin panel.

## Architecture

```
dirmaster/
├── apps/
│   ├── hq/          # Admin panel (Next.js 15, port 3000)
│   └── directory/   # Public directory site (Next.js 15, port 3001)
└── packages/
    ├── db/          # InstantDB schema & typed client
    ├── cache/       # Upstash Redis helpers
    ├── shared/      # Zod schemas, TypeScript types, utils
    └── ui/          # Shared Radix UI + Tailwind components
```

## Prerequisites

- Node.js 18+
- pnpm 9+
- [InstantDB](https://instantdb.com) account
- [Upstash Redis](https://upstash.com) account
- [Inngest](https://www.inngest.com) account
- [Plunk](https://useplunk.com) account (email notifications)

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy env files
cp apps/hq/.env.example apps/hq/.env
cp apps/directory/.env.example apps/directory/.env

# Fill in env variables (see Environment Variables below)

# Run both apps in dev mode
pnpm dev
```

## Environment Variables

### `apps/hq/.env`

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_INSTANTDB_APP_ID` | InstantDB App ID (public) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `INNGEST_EVENT_KEY` | Inngest event key |
| `INNGEST_SIGNING_KEY` | Inngest signing key |
| `PLUNK_API_KEY` | Plunk API key for email notifications |
| `NOTIFICATION_EMAIL` | Email to receive submission notifications |
| `NEXT_PUBLIC_APP_URL` | HQ app URL (e.g. `http://localhost:3000`) |

### `apps/directory/.env`

| Variable | Description |
|---|---|
| `INSTANTDB_APP_ID` | InstantDB App ID (server-side) |
| `INSTANTDB_ADMIN_TOKEN` | InstantDB admin token (server-side, keep secret) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `NEXT_PUBLIC_PROJECT_ID` | The InstantDB project ID to display |
| `INNGEST_EVENT_KEY` | Inngest event key |
| `INNGEST_SIGNING_KEY` | Inngest signing key |
| `NEXT_PUBLIC_APP_URL` | Directory app URL (e.g. `http://localhost:3001`) |

## Setup Guide

### 1. InstantDB

1. Create account at [instantdb.com](https://instantdb.com)
2. Create a new app — copy the **App ID**
3. In the InstantDB dashboard, enable OAuth providers (GitHub, Google)
4. Go to **Admin** tab — copy the **Admin Token** (for Directory SSR)
5. Push the schema: the schema is defined in `packages/db/src/schema.ts`

### 2. Upstash Redis

1. Create account at [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy **REST URL** and **REST Token**

### 3. Inngest

1. Create account at [inngest.com](https://www.inngest.com)
2. Create an app — copy **Event Key** and **Signing Key**
3. In dev mode, run `npx inngest-cli@latest dev` alongside the apps

### 4. Connect Directory to a Project

1. Log in to HQ and create a project
2. Note the project ID from the URL
3. Set `NEXT_PUBLIC_PROJECT_ID` in `apps/directory/.env`

## Connecting a Custom Domain

1. Set `domain` in the project settings in HQ
2. Point your DNS to the server running the Directory app
3. Update `NEXT_PUBLIC_APP_URL` in `apps/directory/.env`

## Docker Deployment

```bash
# Build and run both apps
docker-compose up --build

# Or build individually
docker build -f apps/hq/Dockerfile -t dirmaster-hq .
docker build -f apps/directory/Dockerfile -t dirmaster-directory .
```

## Vercel Deployment

Deploy HQ and Directory as separate Vercel projects from the same monorepo:

1. Import the repo in Vercel
2. For HQ: set **Root Directory** to `apps/hq`
3. For Directory: set **Root Directory** to `apps/directory`
4. Add all environment variables in Vercel dashboard

## Troubleshooting

**"NEXT_PUBLIC_INSTANTDB_APP_ID is not set"** — Check your `.env` file in `apps/hq/`.

**Entries not appearing in Directory** — Check Redis cache. Run `FLUSHALL` in Upstash console to clear, then reload.

**Auth redirect loop** — Ensure GitHub/Google OAuth redirect URIs include your app's URL in InstantDB dashboard.

**Submissions not saving** — Check `INSTANTDB_ADMIN_TOKEN` is set in `apps/directory/.env`.

## Development

```bash
pnpm dev          # Run all apps
pnpm build        # Build all
pnpm typecheck    # TypeScript check
pnpm lint         # Lint all
```
