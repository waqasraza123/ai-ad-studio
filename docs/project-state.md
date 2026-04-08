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
- Billing is now a separate schema-backed domain: plan definitions, owner billing accounts, owner subscriptions, billing usage rollups, and billing event audit records all live in Supabase and are no longer inferred from `owner_guardrails`.
- Billing deployment validation now has an operator-protected diagnostics surface at `/api/billing/operator/runtime` plus the deploy smoke harness `scripts/checks/billing-runtime-smoke.ts` for Stripe/API-plan readiness checks.
- Repo-managed Git hooks now live under `.githooks`; the versioned pre-push hook delegates to `scripts/verify-push.sh` and currently blocks pushes when `pnpm build` fails.
- Cloudflare R2 backs asset and media storage.
- Delivery follow-up reminders now span web UI, worker reminder sweeps, and SQL-side atomic notification creation.

## Non-Negotiable Rules

- Keep the product workflow constrained; this repo is not a general-purpose editor.
- Delivery and campaign surfaces stay gated to finalized canonical exports. Share links stay separate and single-export.
- Persist workflow state in Supabase-backed records; do not move critical state into transient client logic.
- In the web app, keep feature logic under `src/features/*` and repository/data access under `src/server/*`.
- Use server actions for authenticated form mutations in the web app.
- When schema contracts change, update migrations first and then align TypeScript/database contract consumers.
- Subscription entitlements are system-managed state. `owner_guardrails` are now optional user-lowered safety caps and must never raise plan entitlements.
- The worker reads env vars from the shell environment; it does not currently load `.env.local` itself.
- The current provider-backed preview and scene-video pipeline depends on paid Runway API access; treat `RUNWAYML_API_SECRET` plus an active subscription as a real runtime prerequisite until an alternate default render path ships.

## Current Roadmap

- The full Phase 31 roadmap audit for Phases 1 through 30 now lives in `docs/phase-31-roadmap-audit.md`.
- Use that audit as the baseline for any further hardening, cleanup, or roadmap updates instead of relying on memory or migration naming alone.
- Remaining Phase 31 work is now narrower: preserve clean repo-wide verification and validate deployment/runtime assumptions that repo-local checks cannot prove.

## Completed Major Slices

- Brief capture, concept generation, and preview flow.
- Controlled render batches and comparative batch review.
- External review links and approval/final decision workflow.
- Canonical export promotion to showcase/campaign surfaces.
- Public delivery workspace publishing for finalized canonical exports.
- Owner-controlled single-export share links.
- Delivery follow-up queue, overdue reminder views, worker reminder sweeps, and reminder support/investigation tooling.
- Owner-account subscription billing with seeded free/starter/growth/scale plans, Stripe checkout/webhooks, effective-limit enforcement across web + worker, and free-plan export watermarking.

## Important Decisions

- The repo uses explicit persisted workflow checkpoints instead of long-lived client state.
- Token-scoped public surfaces are intentionally separate products with different rules, not alternate skins on one route type.
- Delivery workspaces are anchored to the canonical finalized export even when they include multiple batch exports.
- Billing enforcement now flows through an effective-limit service that clamps plan entitlements, user safety caps, and operator ceilings before either web actions or worker execution can proceed.
- Stripe is the primary self-serve billing rail for cards plus stablecoin checkout; manual stablecoin settlement is a protected operator path, not the default self-serve flow.
- Billing runtime diagnostics are operator-scoped and non-destructive: they validate Stripe API connectivity, paid-plan price readiness, and seeded billing-plan presence before live dashboard checks.
- Contributor push safety is repo-managed rather than ad hoc: use `pnpm hooks:setup` for clone setup, `pnpm verify:push` for the shared gate, and `pnpm safe-push -- ...` as the AI-friendly wrapper around `git push`.
- Delivery follow-up reminders use workspace checkpoint fields plus the SQL function `create_delivery_follow_up_reminder_notification(...)` for duplicate-safe atomic notification writes.
- Delivery support activity is expected to stay auditable through `notifications`, `job_traces`, and `delivery_workspace_events`.
- The web app `typecheck` command now runs `next typegen` before `tsc --noEmit --incremental false` so clean checkouts do not depend on a prior build and stale `.tsbuildinfo` state does not pin missing `.next/types/*` files.
- Owner guardrails are now treated as real schema-backed runtime state via `supabase/migrations/202604051000_phase_19_owner_guardrails.sql`; worker enforcement and dashboard settings should stay aligned to that table instead of relying on divergent code-only defaults.
- The web app now exposes operator-safe runtime readiness at `/api/health`, and deployed smoke validation lives in `scripts/checks/runtime-smoke.ts` with the root wrapper `pnpm verify:phase-31`.

## Deferred / Not Yet Implemented

- No general open-ended ad editor or unconstrained generation workflow.
- No dotenv-style env bootstrapping inside the worker process; local shells must export required env vars first.
- No evidence of end-to-end browser automation in the current repo; deployed validation currently relies on the health/readiness endpoint plus the token-surface smoke script rather than browser-level automation.
- `docs/architecture` and `docs/decisions` are not populated yet; keep durable memory in this file until dedicated docs are added.

## Risks / Watchouts

- Delivery reminder/support changes often cross page composition, feature libs, server actions, worker logic, and migrations at the same time.
- Billing changes now cross Supabase schema, settings UI, public-surface eligibility, web actions, worker queue claim logic, usage metering, and webhook reconciliation in one slice.
- Recent reminder mismatch work proved that `next build` can catch parser/import issues that plain typecheck does not surface first; run the build when touching dashboard route composition or import blocks.
- `pnpm build` and `pnpm typecheck` must stay sequential because both commands touch `.next`; the supported repo-wide wrapper is `pnpm verify:phase-31`.
- The most volatile area right now is the delivery dashboard support flow, especially reminder mismatch resolution/reopen and lifecycle summary behavior.
- Worker reminder behavior depends on both code and database-side atomic functions; changing one side without the other is risky.

## Standard Verification

- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm typecheck`
- `pnpm verify:phase-31`
- `SMOKE_BASE_URL=https://your-app.example.com pnpm smoke:runtime`
- `SMOKE_BASE_URL=https://your-app.example.com SMOKE_BILLING_OPERATOR_SECRET=... pnpm smoke:billing`
