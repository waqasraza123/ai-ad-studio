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

## Product scope

AI Ad Studio is designed for short-form product advertising.

Current repository direction:

- product ad concepts only
- controlled variants instead of open-ended generation
- short exports and platform-aware render presets
- approval and review as first-class workflow steps
- public promotion only after final decision
- delivery workspace only from finalized canonical exports

## Monorepo layout

- `apps/web` — Next.js application for product workflow, review, publishing, and delivery
- `apps/worker` — background orchestration and render execution
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

- Node.js LTS
- pnpm
- configured environment variables for the web app, worker, storage, auth, and AI/media providers

### Install

```bash
pnpm install
```

Run checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Start apps

```bash
pnpm --filter @ai-ad-studio/web dev
pnpm --filter @ai-ad-studio/worker dev
```

Development standards

This repository prefers:

- production-grade changes over quick hacks
- small focused modules instead of oversized files
- strong typing and explicit validation
- clean architectural boundaries
- durable workflow records for anything reviewable or long-running
- descriptive commit messages and cohesive pull requests

Contribution flow

Read these files before contributing:

CONTRIBUTING.md

CODE_OF_CONDUCT.md

SECURITY.md

SUPPORT.md

Security

Please do not report vulnerabilities in public issues. See SECURITY.md

License

This repository is licensed under the MIT License. See LICENSE

