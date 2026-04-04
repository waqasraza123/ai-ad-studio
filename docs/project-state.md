# Project State

## Product

AI Ad Studio is a constrained ad-generation system for product marketing teams. The repo is built around a fixed workflow:

`brief -> concepts -> previews -> render batches -> review -> canonical winner -> promotion -> delivery`

Public surfaces are intentionally separate:
- campaign pages for public promotion of finalized canonical winners
- delivery pages for client handoff from finalized canonical exports
- share links for lighter single-export sharing

## Current Architecture

- Monorepo managed with `pnpm` workspaces and Turborepo.
- `apps/web` is a Next.js 16 App Router app on React 19 with feature-scoped UI code under `src/features` and server/data logic under `src/server`.
- `apps/worker` is a Node/`tsx` worker for job polling, provider execution, and delivery reminder sweeps.
- `packages/shared`, `packages/config`, `packages/ui`, `packages/providers`, and `packages/media` hold shared contracts, config, UI primitives, provider adapters, and media utilities.
- Supabase is the durable system of record for auth, workflow state, notifications, job traces, and delivery workspace events. Schema changes live in `supabase/migrations`.
- Cloudflare R2 backs asset and media storage.
- Delivery follow-up reminders now span web UI, worker reminder sweeps, and SQL-side atomic notification creation.

## Non-Negotiable Rules

- Keep the product workflow constrained; this repo is not a general-purpose editor.
- Delivery and campaign surfaces stay gated to finalized canonical exports. Share links stay separate and single-export.
- Persist workflow state in Supabase-backed records; do not move critical state into transient client logic.
- In the web app, keep feature logic under `src/features/*` and repository/data access under `src/server/*`.
- Use server actions for authenticated form mutations in the web app.
- When schema contracts change, update migrations first and then align TypeScript/database contract consumers.
- The worker reads env vars from the shell environment; it does not currently load `.env.local` itself.

## Current Roadmap

- Continue Phase 32 delivery operations hardening around follow-up reminders, support investigation, and reminder mismatch lifecycle handling.
- Keep the delivery dashboard support views build-safe and type-safe as reminder mismatch resolution/reopen flows evolve.
- Preserve auditability through notifications, job traces, and delivery workspace events whenever delivery support actions change.

## Completed Major Slices

- Brief capture, concept generation, and preview flow.
- Controlled render batches and comparative batch review.
- External review links and approval/final decision workflow.
- Canonical export promotion to showcase/campaign surfaces.
- Public delivery workspace publishing for finalized canonical exports.
- Owner-controlled single-export share links.
- Delivery follow-up queue, overdue reminder views, worker reminder sweeps, and reminder support/investigation tooling.

## Important Decisions

- The repo uses explicit persisted workflow checkpoints instead of long-lived client state.
- Token-scoped public surfaces are intentionally separate products with different rules, not alternate skins on one route type.
- Delivery workspaces are anchored to the canonical finalized export even when they include multiple batch exports.
- Delivery follow-up reminders use workspace checkpoint fields plus the SQL function `create_delivery_follow_up_reminder_notification(...)` for duplicate-safe atomic notification writes.
- Delivery support activity is expected to stay auditable through `notifications`, `job_traces`, and `delivery_workspace_events`.

## Deferred / Not Yet Implemented

- No general open-ended ad editor or unconstrained generation workflow.
- No dotenv-style env bootstrapping inside the worker process; local shells must export required env vars first.
- No evidence of end-to-end browser automation in the current repo; verification is mainly build, typecheck, lint, and targeted unit tests.
- `docs/architecture` and `docs/decisions` are not populated yet; keep durable memory in this file until dedicated docs are added.

## Risks / Watchouts

- Delivery reminder/support changes often cross page composition, feature libs, server actions, worker logic, and migrations at the same time.
- Recent reminder mismatch work proved that `next build` can catch parser/import issues that plain typecheck does not surface first; run the build when touching dashboard route composition or import blocks.
- The most volatile area right now is the delivery dashboard support flow, especially reminder mismatch resolution/reopen and lifecycle summary behavior.
- Worker reminder behavior depends on both code and database-side atomic functions; changing one side without the other is risky.

## Standard Verification

- `pnpm --filter @ai-ad-studio/web typecheck`
- `pnpm --filter @ai-ad-studio/web build`
- `pnpm --filter @ai-ad-studio/worker typecheck`
- `pnpm --filter @ai-ad-studio/worker test`
- `pnpm lint`
