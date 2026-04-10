# Current Session

## Date

2026-04-10

## Current Objective

Hotfix the billing catalog schema drift that broke the public homepage pricing query, then return to the activation + feedback follow-up work.

## Last Completed Step

Diagnosed the public homepage billing failure to remote Supabase schema drift: the linked project was missing `supabase/migrations/202604101200_phase_34_activation_feedback_foundation.sql`, so `billing_plans.allow_activation_packages` and the related creative-performance capability columns did not exist. Added the idempotent repair migration `supabase/migrations/202604101830_phase_34_billing_plan_catalog_repair.sql`, pushed both pending migrations with `supabase db push --linked`, verified that anon and service-role `billing_plans` reads now succeed for `free`, `starter`, `growth`, and `scale`, hardened the web app so homepage pricing degrades cleanly instead of 500ing, billing catalog failures are classified (`schema_drift` vs `query_failed`), `/api/health` now includes `billingPlanCatalogReady`, runtime smoke now checks the homepage route directly, and the dashboard billing cards now expose explicit current/downgrade-only/unavailable states instead of looking silently clickable.

## Current Step

The billing schema drift is fixed on the linked remote and the homepage/health surfaces are hardened against future billing-catalog failures. The next implementation step is to resume the activation + feedback follow-up slice: richer activation readiness/history handling, multi-row manual performance ingestion, and more detailed creative breakdowns by audience, offer, and tone.

## Scope Boundaries

- Activation packages remain internal preparation records only; no direct partner publish APIs or scheduler behavior were added.
- Creative performance ingestion is owner- and operator-submitted manual data in this phase; there is no partner-network sync yet.
- The product workflow stays constrained; this slice extends the durable checkpoints instead of creating a generic campaign manager or media-buying surface.
- Public campaign/delivery/showcase semantics are unchanged; activation packages are separate from those public surfaces.

## Likely Files To Touch Next

- `apps/web/src/server/activation/activation-service.ts`
- `apps/web/src/server/creative-performance/creative-performance-service.ts`
- `apps/web/src/app/(app)/dashboard/analytics/page.tsx`
- `apps/web/src/app/(app)/dashboard/exports/[exportId]/page.tsx`
- `supabase/migrations/*`
- `docs/_local/current-session.md`

## Key Constraints

- Keep URLs stable; locale stays in cookie state, not path prefixes.
- Preserve design quality in both LTR and RTL; prefer logical properties/utilities over one-off left/right fixes.
- Keep user-authored and provider-authored content unchanged; localize repo-owned UI copy and formatting only.
- The browser harness is intentionally real-stack: no mock auth mode, no test-only HTTP endpoints, and fixture setup depends on reachable Supabase auth + service-role APIs.
- The local environment here can `typecheck` and `build`, but current Supabase auth requests are timing out; seeded E2E verification has to be rerun from a network path that can reach the configured Supabase host.
- Activation package creation and creative-performance ingestion are now billed feature gates on paid plans only.
- Historical `preview_asset_id` backfill is best-effort; ambiguous legacy exports are allowed to remain null.

## Verification Commands

- `pnpm --filter @ai-ad-studio/web exec vitest run --config vitest.unit.config.ts src/server/billing/billing-plan-catalog.test.ts src/server/billing/runtime-readiness.test.ts src/app/api/health/route.test.ts src/server/billing/purchase-availability.test.ts`
- `pnpm --filter @ai-ad-studio/web exec vitest run --config vitest.component.config.ts src/components/marketing/pricing-snapshot-section.test.tsx src/app/page.test.tsx`
- `pnpm --filter @ai-ad-studio/web exec vitest run --config vitest.component.config.ts src/features/settings/components/billing-plan-panel.test.tsx`
- `pnpm --filter @ai-ad-studio/web exec vitest run --config vitest.unit.config.ts src/server/activation/activation-service.test.ts src/server/creative-performance/creative-performance-service.test.ts src/features/analytics/lib/creative-performance-summary.test.ts`
- `pnpm --filter @ai-ad-studio/web exec vitest run --config vitest.component.config.ts src/features/activation/components/activation-package-panel.test.tsx src/features/analytics/components/creative-performance-ingestion-panel.test.tsx`
- `pnpm --filter @ai-ad-studio/web typecheck`
- `pnpm --filter @ai-ad-studio/web build`
- `supabase migration list --linked`
- `supabase db push --linked`
- `pnpm --filter @ai-ad-studio/web exec node --input-type=commonjs - <<'NODE' ... billing_plans capability-column validation ... NODE`
- manual QA on `/dashboard/exports/[exportId]` for activation package creation and manifest download
- manual QA on `/dashboard/analytics` for creative scorecards and manual performance ingestion

## Lookup Notes

- Durable plan artifact: `docs/product/creative-activation-feedback-plan.md`
- Activation services and repo: `apps/web/src/server/activation/*`
- Creative performance services and repo: `apps/web/src/server/creative-performance/*`
- Shared lineage resolver: `apps/web/src/server/creative-lineage/export-lineage.ts`
- Export detail activation panel: `apps/web/src/features/activation/components/activation-package-panel.tsx`
- Analytics creative section: `apps/web/src/app/(app)/dashboard/analytics/page.tsx`

## Expected Result

Finalized canonical exports can now produce durable internal activation packages, owner/operator manual campaign outcomes can be ingested against real creative lineage, and `/dashboard/analytics` shows the first creative performance scorecards alongside existing usage-cost analytics.
