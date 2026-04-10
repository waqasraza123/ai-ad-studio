# Current Session

## Date

2026-04-10

## Current Objective

Stabilize self-serve billing in `/dashboard/settings` so paid plans are actually purchasable and billing actions fail clearly when Stripe runtime is unavailable.

## Last Completed Step

Fixed the broken plan-purchase interaction in `apps/web`: paid plans now submit from the full card surface instead of only a small nested CTA button; settings now loads a cached billing purchase-availability helper and disables checkout/plan-change/portal actions when Stripe runtime is degraded; settings also shows explicit `billing=success|cancelled|portal` feedback banners. Added focused unit/component coverage for purchase availability, billing feedback mapping, manage-billing actions, and the billing plan panel.

## Current Step

Manual QA the billing panel on `/dashboard/settings` against a real Stripe-configured environment: click a paid card, confirm Checkout opens, confirm current/free cards stay non-actionable, and validate disabled purchase/portal states when billing runtime is intentionally degraded.

## Scope Boundaries

- Billing is owner-scoped, not org/seat-scoped.
- Self-serve billing uses Stripe; manual stablecoin settlement is operator-only.
- `owner_guardrails` remain editable only as tighter personal caps beneath plan entitlements.
- Public campaign/delivery/showcase creation is gated by plan access; existing public items now use a 30-day downgrade-access check at read time.
- Settings purchase availability is cached server-side for a short TTL; UI gating is preventive only and server actions remain the final guard.

## Likely Files To Touch Next

- `apps/web/src/features/settings/components/billing-plan-panel.tsx`
- `apps/web/src/features/settings/actions/manage-billing.ts`
- `apps/web/src/app/(app)/dashboard/settings/page.tsx`
- `apps/web/src/server/billing/purchase-availability.ts`
- `docs/_local/current-session.md`

## Key Constraints

- Keep URLs stable; locale stays in cookie state, not path prefixes.
- Preserve design quality in both LTR and RTL; prefer logical properties/utilities over one-off left/right fixes.
- Keep user-authored and provider-authored content unchanged; localize repo-owned UI copy and formatting only.
- The browser harness is intentionally real-stack: no mock auth mode, no test-only HTTP endpoints, and fixture setup depends on reachable Supabase auth + service-role APIs.
- The local environment here can `typecheck` and `build`, but current Supabase auth requests are timing out; seeded E2E verification has to be rerun from a network path that can reach the configured Supabase host.
- Brand names and code/data literals can stay untranslated when they function as identifiers; surrounding UI labels and prose should be Arabic in the Arabic locale.

## Verification Commands

- `pnpm --filter @ai-ad-studio/web exec vitest run --config vitest.unit.config.ts src/server/billing/purchase-availability.test.ts src/features/settings/lib/billing-feedback.test.ts src/features/settings/actions/manage-billing.test.ts`
- `pnpm --filter @ai-ad-studio/web exec vitest run --config vitest.component.config.ts src/features/settings/components/billing-plan-panel.test.tsx`
- `pnpm --filter @ai-ad-studio/web typecheck`
- `pnpm --filter @ai-ad-studio/web build`
- manual QA on `/dashboard/settings` with Stripe runtime both healthy and degraded

## Lookup Notes

- Billing settings UI: `apps/web/src/features/settings/components/billing-plan-panel.tsx`
- Billing server actions: `apps/web/src/features/settings/actions/manage-billing.ts`
- Cached billing readiness helper: `apps/web/src/server/billing/purchase-availability.ts`
- Settings route feedback wiring: `apps/web/src/app/(app)/dashboard/settings/page.tsx`
- Billing feedback mapping: `apps/web/src/features/settings/lib/billing-feedback.ts`

## Expected Result

Paid plan cards in `/dashboard/settings` should be clickable across the full card surface, keyboard-submittable, and visibly disabled when checkout or portal runtime is unavailable. Checkout/plan-change failures should no longer look like silent no-ops.
