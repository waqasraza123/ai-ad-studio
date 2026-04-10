# Current Session

## Date

2026-04-10

## Current Objective

Finish verification and any final spot-audit cleanup after the Arabic translation and RTL completion sweep across `apps/web`.

## Last Completed Step

Completed the remaining delivery dashboard Arabic/RTL pass: localized the delivery route shell, overdue/follow-up/support/investigation panels, focused workspace summary, reminder follow-up forms, and workspace list; expanded the typed delivery catalog in both locales; and removed the remaining physical-direction classes in the delivery support path.

## Current Step

Run broader browser/manual spot checks on the now-complete Arabic/RTL delivery and shared dashboard surfaces, then do a final grep-driven sweep for any leftover hardcoded English in lower-traffic delivery/public components.

## Scope Boundaries

- Billing is owner-scoped, not org/seat-scoped.
- Self-serve billing uses Stripe; manual stablecoin settlement is operator-only.
- `owner_guardrails` remain editable only as tighter personal caps beneath plan entitlements.
- Public campaign/delivery/showcase creation is gated by plan access; existing public items now use a 30-day downgrade-access check at read time.

## Likely Files To Touch Next

- `apps/web/src/features/delivery/**/*`
- `apps/web/src/features/renders/**/*`
- `apps/web/src/components/**/*`
- `apps/web/src/lib/i18n/messages/*`
- `docs/_local/current-session.md`

## Key Constraints

- Keep URLs stable; locale stays in cookie state, not path prefixes.
- Preserve design quality in both LTR and RTL; prefer logical properties/utilities over one-off left/right fixes.
- Keep user-authored and provider-authored content unchanged; localize repo-owned UI copy and formatting only.
- The browser harness is intentionally real-stack: no mock auth mode, no test-only HTTP endpoints, and fixture setup depends on reachable Supabase auth + service-role APIs.
- The local environment here can `typecheck` and `build`, but current Supabase auth requests are timing out; seeded E2E verification has to be rerun from a network path that can reach the configured Supabase host.
- Brand names and code/data literals can stay untranslated when they function as identifiers; surrounding UI labels and prose should be Arabic in the Arabic locale.

## Verification Commands

- `pnpm --filter @ai-ad-studio/web test:e2e:setup`
- `pnpm --filter @ai-ad-studio/web test:e2e:smoke`
- `pnpm --filter @ai-ad-studio/web test:unit -- src/components/marketing/homepage-data.test.ts src/lib/i18n/catalog.test.ts`
- `pnpm --filter @ai-ad-studio/web test:e2e:public`
- `pnpm --filter @ai-ad-studio/web test:e2e:dashboard`
- `pnpm --filter @ai-ad-studio/web typecheck`
- `pnpm --filter @ai-ad-studio/web build`
- `rg -n "text-right|text-left|ml-|mr-|left-|right-" apps/web/src/features/delivery apps/web/src/features/renders apps/web/src/components`
- rerun the seeded browser suite once Supabase connectivity is available
- grep for leftover hardcoded English or physical-direction classes after the final spot-audit

## Lookup Notes

- Web i18n catalogs: `apps/web/src/lib/i18n/messages/*`
- Shared runtime UI: `apps/web/src/components/runtime/*`
- Marketing homepage sections: `apps/web/src/components/marketing/*`
- Delivery support surfaces: `apps/web/src/features/delivery/**/*`
- Debug views: `apps/web/src/features/debug/**/*`

## Expected Result

`apps/web` should now present professional Arabic copy and natural RTL layout across the shared public/dashboard surfaces plus the dense delivery-support dashboard flows, leaving only smaller lower-traffic spot-audit cleanup if any English leakage remains.
