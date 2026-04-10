# Current Session

## Date

2026-04-10

## Current Objective

Finish the remaining Arabic/RTL spot-audit cleanup across lower-traffic dashboard/public chrome and verify the web app build is clean.

## Last Completed Step

Completed a broader lower-traffic Arabic/RTL cleanup pass: localized export detail, delivery workspace management, share/showcase/campaign panels, delivery activity timeline, analytics and notifications overview cards, approval gate, template/brand-kit settings, theme palette picker, and project summary chrome; normalized promotion eligibility reasons into typed i18n keys; and verified `apps/web` with `build` and `typecheck`.

## Current Step

Run manual Arabic/RTL QA on the main dashboard routes and public token routes, then decide whether to do one more pass on deeper helper/config sources such as concept-state mappers, render preset metadata, and delivery activity helper text that still feed some English into UI state.

## Scope Boundaries

- Billing is owner-scoped, not org/seat-scoped.
- Self-serve billing uses Stripe; manual stablecoin settlement is operator-only.
- `owner_guardrails` remain editable only as tighter personal caps beneath plan entitlements.
- Public campaign/delivery/showcase creation is gated by plan access; existing public items now use a 30-day downgrade-access check at read time.

## Likely Files To Touch Next

- `apps/web/src/features/concepts/mappers/*`
- `apps/web/src/features/renders/lib/*`
- `apps/web/src/features/delivery/lib/*`
- `apps/web/src/app/(app)/dashboard/projects/[projectId]/page.tsx`
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
- `rg -n '"[A-Z][^"]* [A-Za-z][^"]*"' apps/web/src/app apps/web/src/components apps/web/src/features --glob '!**/*.test.*' --glob '!**/messages/*'`
- rerun the seeded browser suite once Supabase connectivity is available

## Lookup Notes

- Web i18n catalogs: `apps/web/src/lib/i18n/messages/*`
- Shared runtime UI: `apps/web/src/components/runtime/*`
- Marketing homepage sections: `apps/web/src/components/marketing/*`
- Delivery support surfaces: `apps/web/src/features/delivery/**/*`
- Debug views: `apps/web/src/features/debug/**/*`

## Expected Result

`apps/web` should now be clean across the shared public/dashboard chrome and the lower-traffic export/share/showcase/delivery management surfaces in both English and Arabic, with any remaining English leakage isolated to deeper helper/config-derived status text rather than the major route shells or shared panels.
