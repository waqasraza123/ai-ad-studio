# Current Session

## Date

2026-04-07

## Current Objective

Implement owner-account subscription billing with restrictive free/paid plan limits, Stripe card + stablecoin checkout, and shared enforcement across web actions and worker execution.

## Last Completed Step

Added the Phase 33 billing schema, effective-limit services, Stripe checkout/portal/webhook routes, billing settings UI, worker-side billing/concurrency enforcement, and free-plan export watermarking. Web `typecheck`, worker `typecheck`, and web `build` now pass.

## Current Step

Implementation is complete and verified at compile/build level. The next practical step is runtime validation with real Stripe secrets/webhook delivery plus end-to-end dashboard checks for upgrade, downgrade, and blocked-limit paths.

## Scope Boundaries

- Billing is owner-scoped, not org/seat-scoped.
- Self-serve billing uses Stripe; manual stablecoin settlement is operator-only.
- `owner_guardrails` remain editable only as tighter personal caps beneath plan entitlements.
- Public campaign/delivery/showcase creation is gated by plan access; existing public items now use a 30-day downgrade-access check at read time.

## Likely Files To Touch Next

- `apps/web/src/server/billing/*`
- `apps/web/src/features/settings/*`
- `apps/web/src/app/api/billing/*`
- `apps/worker/src/billing/*`
- `supabase/migrations/202604071100_phase_33_billing_subscriptions.sql`
- `docs/project-state.md`
- `docs/_local/current-session.md`

## Key Constraints

- Do not treat `owner_guardrails` as purchased limits anymore.
- Keep web and worker enforcement aligned through the billing services, not duplicated ad hoc checks.
- Stripe env vars are required for live checkout, portal, and webhook reconciliation.
- Worker metering and asset writes now also serve billing rollup freshness, so changes there affect subscription UX.

## Verification Commands

- `pnpm --filter @ai-ad-studio/web typecheck`
- `pnpm --filter @ai-ad-studio/worker typecheck`
- `pnpm --filter @ai-ad-studio/web build`

## Lookup Notes

- Core web billing service: `apps/web/src/server/billing/billing-service.ts`
- Stripe REST + webhook verification helper: `apps/web/src/server/billing/stripe.ts`
- Billing settings surface: `apps/web/src/features/settings/components/billing-plan-panel.tsx`
- Worker billing enforcement: `apps/worker/src/billing/billing-limits.ts`
- Schema seed and policies: `supabase/migrations/202604071100_phase_33_billing_subscriptions.sql`

## Expected Result

Future work should assume billing entitlements are first-class runtime state. Any new billable generation, publishing, or concurrency-sensitive workflow should plug into the billing services before adding UI affordances.
