# AI Ad Studio

AI Ad Studio is a premium, constrained ad-generation system for product marketing teams, ecommerce brands, app founders, and agencies.

Instead of trying to be a general video editor, this repository focuses on one narrow, high-quality workflow:

**brief → concepts → previews → controlled render batches → review → canonical winner → promotion → delivery**

That constraint is the product advantage. AI handles concepting, copy, and render planning, while the application enforces quality through templates, validations, approvals, review gates, and production-safe workflows.

## Screenshots

![Dashboard overview](.github/screenshots/Screenshot%202026-03-18%20at%205.02.25%E2%80%AFPM.png)

![Project detail](.github/screenshots/Screenshot%202026-03-18%20at%205.02.42%E2%80%AFPM.png)

![Concept and render workflow](.github/screenshots/Screenshot%202026-03-18%20at%205.02.58%E2%80%AFPM.png)

![Batch review flow](.github/screenshots/Screenshot%202026-03-18%20at%205.03.13%E2%80%AFPM.png)

![Delivery and promotion flow](.github/screenshots/Screenshot%202026-03-18%20at%205.03.37%E2%80%AFPM.png)

## What this repository includes

- structured product brief capture
- brand kits and reusable templates
- concept generation and storyboard preview flow
- controlled multi-variant render batches
- side-by-side batch review and winner selection
- external reviewer links with comments and approval state
- final decision locking with canonical export selection
- winner-only public promotion workflow
- public campaign pages
- finalized client delivery workspace
- owner-controlled single-export share links

## Product scope

AI Ad Studio is designed for short-form product advertising.

Current repository direction:

- product ad concepts only
- controlled variants instead of open-ended generation
- short exports and platform-aware render presets
- approval and review as first-class workflow steps
- public promotion only after final decision
- delivery workspace only from finalized canonical exports

## Public surfaces and intended usage

The repository currently has three public token-based surfaces. They are not interchangeable.

### 1. Campaign pages

Campaign pages are the primary public promotion surface.

Use them when:
- a reviewed export has been finalized
- the export is the current canonical winner for the project
- the goal is public-facing promotion or showcase-style sharing

Rules:
- winner-only
- canonical-only
- promotion-oriented

### 2. Delivery pages

Delivery pages are the primary client handoff surface.

Use them when:
- a reviewed export has been finalized
- the export is the current canonical winner for the project
- the goal is structured delivery with handoff notes, approval summary, and downloadable assets

Rules:
- canonical-only
- handoff-oriented
- supports included exports from the finalized batch, but anchored to the canonical export

### 3. Share links

Share links are a lighter owner-controlled utility surface for a single export.

Use them when:
- you want to quickly share one export for preview or internal distribution outside the main winner-only flow
- you do not need campaign messaging
- you do not need delivery workspace structure or approval summary

Rules:
- single-export utility
- owner-created
- separate from winner-only campaign and canonical delivery workflows

## Current capabilities

The current repo state supports:

- brief capture, concept generation, and preview flow
- controlled render batch generation
- internal and external review collection
- winner selection and final decision locking
- current-canonical promotion gating
- public campaign pages for canonical winners
- public delivery workspaces for canonical winners
- token-scoped single-export share links
- worker polling, job claiming, and provider-backed generation flow
- token-scoped public media delivery with authenticated owner dashboard downloads

## Monorepo layout

- `apps/web` — Next.js application for product workflow, review, publishing, and delivery
- `apps/worker` — async orchestration and job execution
- `packages/shared` — shared contracts and types
- `packages/config` — runtime configuration utilities
- `packages/ui` — reusable UI primitives
- `packages/providers` — provider contracts and adapters
- `packages/media` — media pipeline utilities

## Core workflow

1. Create a project and upload product assets
2. Generate controlled concepts
3. Generate previews
4. Render controlled A/B variation batches
5. Review outputs internally and externally
6. Select a winner
7. Finalize the canonical export
8. Promote the finalized winner to showcase or campaign
9. Prepare a client delivery workspace

## Architecture

The system follows a thin web layer plus durable database plus async worker model.

- the web app owns product UX, state transitions, approvals, and public pages
- the worker owns slow orchestration, provider calls, and render/composition tasks
- storage and metadata stay durable so long-running jobs can be resumed, audited, and reviewed
- render batches, external review, promotion, and delivery all build on explicit persisted records rather than transient client state

## Local development

### Prerequisites

- Node.js 22 or newer
- pnpm 10
- a configured Supabase project
- R2 credentials for asset upload and public media delivery
- OpenAI and Runway credentials for worker-driven generation flows

### Install

Run `pnpm install`.

### Environment setup

Create a local env file from the example with `cp .env.example .env.local`.

Fill in the values in `.env.local`.

### Environment matrix

#### Web minimum

These values are required for the authenticated web app and Supabase-backed session handling:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Web full workflow

These additional server-side values are required for the full product workflow, including token-backed public pages, share links, uploads, downloads, and storage access:

- `SUPABASE_SERVICE_ROLE_KEY`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`

#### Worker required

The worker reads directly from `process.env` and requires these values to claim and execute jobs:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WORKER_POLL_INTERVAL_MS`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `OPENAI_API_KEY`
- `RUNWAYML_API_SECRET`

#### Worker defaults

These values are optional because the worker code provides defaults:

- `OPENAI_CONCEPT_MODEL` defaults to `gpt-4o-mini`
- `OPENAI_TTS_MODEL` defaults to `gpt-4o-mini-tts`
- `OPENAI_TTS_VOICE` defaults to `alloy`
- `RUNWAY_IMAGE_MODEL` defaults to `gen4_image_turbo`

### Important startup note

Next.js will load `.env.local` automatically for the web app.

The worker does not use a dotenv loader in its current script. It reads from the shell environment. Before starting the worker, export the env values into the shell session that will run it.

One simple local workflow is:

    set -a
    source .env.local
    set +a

After that, start the apps in separate terminals.

### Start the web app

Run `pnpm dev:web`.

### Start the worker

Run `pnpm dev:worker`.

### Start both from the repo root

This works only after the worker-required env variables are already exported into the shell:

Run `pnpm dev`.

### Run checks

Run:

    pnpm lint
    pnpm typecheck
    pnpm test
    pnpm build

### Build and start individually

Web:

    pnpm --filter @ai-ad-studio/web build
    pnpm --filter @ai-ad-studio/web start

Worker:

    pnpm --filter @ai-ad-studio/worker build
    pnpm --filter @ai-ad-studio/worker start

## Runtime notes

- if the public Supabase keys are missing, authenticated web flows and login-dependent pages will not work
- if the R2 variables are missing, upload and download routes will return storage configuration errors
- if the worker-required variables are missing, the worker stays alive and keeps polling for configuration instead of processing jobs
- public campaign, share, and delivery media routes rely on token-scoped access plus server-side R2 reads
- owner dashboard export downloads remain authenticated

## Known limitations

Current known limitations and truths:

- the worker still expects its required environment variables to be present in the shell environment that launches it
- token-backed public routes are runtime-safe by design, but they should still be manually validated in each deployment environment
- repo smoke coverage is focused on critical business rules and state derivation, not full browser end-to-end automation
- migration application and infrastructure provisioning are assumed to happen outside this repo
- delivery analytics and client acknowledgement flows are not part of Phase 31 and are better handled in Phase 32

## Deployment assumptions

- the web runtime needs the public Supabase keys in every environment
- the server-side web runtime also needs `SUPABASE_SERVICE_ROLE_KEY` and the R2 credentials for share links, public token routes, and asset delivery
- the worker runtime needs Supabase service-role access, R2 credentials, and AI provider credentials
- promotion, review, delivery, and public token pages assume the database schema and migrations are already applied before the services are started

## Release-candidate validation checklist

Before treating the repo as release-candidate ready, verify all of the following:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

And manually verify:

- an active `/review/[token]` page is writable
- a finalized or inactive `/review/[token]` page is frozen
- `/campaign/[token]` plays media without login
- `/delivery/[token]` downloads included assets without login
- `/share/[token]` still works as a single-export share surface
- `/api/exports/[exportId]/download` remains protected when logged out

## Development standards

This repository prefers:

- production-grade changes over quick hacks
- small focused modules instead of oversized files
- strong typing and explicit validation
- clean architectural boundaries
- durable workflow records for anything reviewable or long-running
- descriptive commit messages and cohesive pull requests

## Contribution flow

Read these files before contributing:

- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `SUPPORT.md`

## Security

Please do not report vulnerabilities in public issues. See `SECURITY.md`.

## License

This repository is licensed under the MIT License. See `LICENSE`.
