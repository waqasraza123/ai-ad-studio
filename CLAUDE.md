# AI Ad Studio — Claude Code Guide

## Project

AI Ad Studio is a premium ad-generation platform for product marketing teams. The core workflow is:
**brief → concepts → previews → render batches → reviews → canonical winner → promotion → delivery**

## Monorepo Layout

```
apps/web/       Next.js 16 (React 19) — main application
apps/worker/    Node.js worker — async job polling and execution
packages/
  shared/       Shared TypeScript types and contracts
  config/       Zod-validated runtime configuration
  ui/           Reusable React components
  providers/    AI provider adapter contracts
  media/        Media pipeline utilities
supabase/       Database migrations
```

## Tech Stack

- **Framework**: Next.js App Router, React 19, TypeScript (strict)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudflare R2
- **AI**: OpenAI (gpt-4o-mini, TTS), Runway ML (image generation)
- **UI**: Tailwind CSS, Motion.js, Lucide icons
- **Validation**: Zod
- **Testing**: Vitest
- **Build**: Turbo + pnpm 10 workspaces

## Common Commands

```bash
pnpm install               # install all workspace deps
pnpm dev:web               # Next.js dev server (localhost:3000)
pnpm dev:worker            # worker with job polling
pnpm dev                   # both (requires env vars exported to shell first)
pnpm build                 # full monorepo build
pnpm lint                  # ESLint
pnpm typecheck             # tsc
pnpm test                  # Vitest
pnpm format                # Prettier write
```

> Worker requires env vars in the shell environment (not .env loader). Run `set -a && source .env.local && set +a` before `pnpm dev`.

## Environment

Copy `.env.example` → `.env.local` and fill in:
- Supabase project URL and keys
- Cloudflare R2 credentials
- OpenAI API key
- Runway ML API key

## Key Source Paths (web app)

| Path | Purpose |
|------|---------|
| `apps/web/src/app/(app)/` | Authenticated dashboard routes |
| `apps/web/src/app/review/[token]/` | Internal/external review pages |
| `apps/web/src/app/campaign/[token]/` | Public campaign promotion (winner-only) |
| `apps/web/src/app/delivery/[token]/` | Client delivery workspace |
| `apps/web/src/app/share/[token]/` | Single-export share links |
| `apps/web/src/features/` | Feature-scoped UI logic |
| `apps/web/src/server/` | Server-side business logic and DB queries |
| `apps/web/src/lib/supabase/` | Supabase client (browser/server/middleware) |
| `apps/worker/src/jobs/handlers/` | Async job type handlers |
| `apps/worker/src/providers/` | AI provider integrations |

## Architecture Notes

**Auth**: Supabase SSR. Middleware at `apps/web/middleware.ts` refreshes sessions on every request. Protected routes live under `app/(app)/`.

**Job Queue**: Worker polls Supabase for unclaimed jobs, claims them, executes via typed handlers, posts heartbeats. Concept generation uses OpenAI; image rendering uses Runway ML.

**State**: All workflow state persists to Supabase — no long-lived client state. Explicit state transitions are enforced; approval gates exist between stages.

**Token-scoped public routes**: Campaign, delivery, and share surfaces are public but gated by opaque tokens. Each surface is read-only and scoped to canonical/winner exports only (except share links which are single-export utility links).

**Storage**: R2 for all media assets. Authenticated exports go through `/api/exports/[exportId]/download`.

**Packages**: `packages/shared` types are imported by both `web` and `worker`. Always update shared types when changing database schema contracts.

## Database

Migrations live in `supabase/migrations/` (versioned by phase). Schema contracts are in `apps/web/src/server/database/types.ts`. Apply migrations via the Supabase CLI.

## Code Conventions

- Strict TypeScript — no `any`, use Zod for runtime validation at system boundaries
- Server actions for form mutations in the web app
- Feature-scoped directories under `features/` for UI; `server/` for backend logic
- Provider adapters abstract AI vendor specifics — add new providers via the adapter pattern in `packages/providers/`
