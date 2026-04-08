# Current Session

## Date

2026-04-08

## Current Objective

Repair the Supabase-side public homepage access mismatch in repo-managed migrations so linked projects can be brought in sync via normal migration rollout.

## Last Completed Step

Added `supabase/migrations/202604081130_phase_33_public_api_anon_grants.sql` to align table grants with the repo's existing public-read RLS policies. The migration grants anon/authenticated `select` on showcase-, promotion-, delivery-, and billing-facing public tables and drops the duplicate `showcase_items_select_published_public` policy name so one canonical published-showcase public policy remains.

## Current Step

Next step is rollout and verification against the linked Supabase project: run the normal migration push/apply path, then re-check anon reads for `showcase_items`, `exports`, `assets`, and `billing_plans`. The worker warnings remain a separate local shell-export issue.

## Scope Boundaries

- Billing is owner-scoped, not org/seat-scoped.
- Self-serve billing uses Stripe; manual stablecoin settlement is operator-only.
- `owner_guardrails` remain editable only as tighter personal caps beneath plan entitlements.
- Public campaign/delivery/showcase creation is gated by plan access; existing public items now use a 30-day downgrade-access check at read time.

## Likely Files To Touch Next

- `supabase/migrations/*`
- `apps/web/src/server/showcase/showcase-repository.ts`
- `apps/web/src/server/billing/billing-service.ts`
- `docs/_local/current-session.md`

## Key Constraints

- Homepage public data loads use the anon Supabase client, so RLS policy alone is insufficient without matching table grants.
- Keep database fixes idempotent and consistent with existing Supabase migration style.
- `pnpm dev` from repo root only works for the worker after exporting required env vars into the shell first.

## Verification Commands

- `supabase db push`
- `pnpm --filter @ai-ad-studio/web exec node - <<'NODE' ... anon Supabase read checks ... NODE`
- `pnpm dev`
- `git status --short`

## Lookup Notes

- Homepage composition: `apps/web/src/app/page.tsx`
- Failing public showcase read: `apps/web/src/server/showcase/showcase-repository.ts`
- Anon Supabase client: `apps/web/src/lib/supabase/server.ts`
- Existing authenticated-only grants baseline: `supabase/migrations/202603180008_phase_19_api_grants.sql`
- Showcase public RLS policies: `supabase/migrations/202603180011_phase_22_showcase.sql`, `supabase/migrations/202603180016_phase_27_promotion_workflow.sql`
- Delivery public RLS policies: `supabase/migrations/202603180019_phase_30_delivery_workspace.sql`
- Billing public table/grant definition: `supabase/migrations/202604071100_phase_33_billing_subscriptions.sql`
- Public API grant repair migration: `supabase/migrations/202604081130_phase_33_public_api_anon_grants.sql`
- Worker env startup note: `README.md`

## Expected Result

Once the new migration is applied on the linked Supabase project, anon homepage reads should stop failing on `showcase_items`, `exports`, and `assets`, and billing plan reads should work as long as the Phase 33 billing migration is also present on that project.
