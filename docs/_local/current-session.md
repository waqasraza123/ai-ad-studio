# Current Session

## Date

2026-04-09

## Current Objective

Stand up the comprehensive seeded Playwright browser harness for `apps/web` and close the remaining route-coverage gaps after the initial public/dashboard smoke pass.

## Last Completed Step

Implemented the first full browser-automation slice for `apps/web`: Playwright now has global setup, deterministic Supabase-backed fixture seeding, generated dashboard auth state, public/dashboard spec folders, new e2e scripts, and smoke coverage for homepage, login, showcase, share, campaign, review, delivery, dashboard, analytics, exports, settings, notifications, campaigns, showcase, concepts, and the delivery dashboard chunk controls.

## Current Step

Run the seeded Playwright suite against a reachable Supabase environment, then harden any failing selectors/fixtures and expand coverage to the remaining dashboard detail routes.

## Scope Boundaries

- Billing is owner-scoped, not org/seat-scoped.
- Self-serve billing uses Stripe; manual stablecoin settlement is operator-only.
- `owner_guardrails` remain editable only as tighter personal caps beneath plan entitlements.
- Public campaign/delivery/showcase creation is gated by plan access; existing public items now use a 30-day downgrade-access check at read time.

## Likely Files To Touch Next

- `apps/web/e2e/*`
- `apps/web/scripts/e2e/*`
- `apps/web/src/features/*/components/*`
- `docs/_local/current-session.md`

## Key Constraints

- Keep URLs stable; locale stays in cookie state, not path prefixes.
- Preserve design quality in both LTR and RTL; prefer logical properties/utilities over one-off left/right fixes.
- Keep user-authored and provider-authored content unchanged; localize repo-owned UI copy and formatting only.
- The browser harness is intentionally real-stack: no mock auth mode, no test-only HTTP endpoints, and fixture setup depends on reachable Supabase auth + service-role APIs.
- The local environment here can `typecheck` and `build`, but current Supabase auth requests are timing out; seeded E2E verification has to be rerun from a network path that can reach the configured Supabase host.

## Verification Commands

- `pnpm --filter @ai-ad-studio/web test:e2e:setup`
- `pnpm --filter @ai-ad-studio/web test:e2e:smoke`
- `pnpm --filter @ai-ad-studio/web test:e2e:public`
- `pnpm --filter @ai-ad-studio/web test:e2e:dashboard`
- `pnpm --filter @ai-ad-studio/web typecheck`
- `pnpm --filter @ai-ad-studio/web build`
- rerun the seeded browser suite once Supabase connectivity is available

## Lookup Notes

- Playwright config: `apps/web/playwright.config.ts`
- Playwright global setup + seeding: `apps/web/e2e/setup/*`
- Playwright manifest/auth artifacts: `apps/web/e2e/.generated/*`
- Public route specs: `apps/web/e2e/public/*`
- Dashboard route specs: `apps/web/e2e/dashboard/*`
- Fixture bootstrap script: `apps/web/scripts/e2e/setup-fixtures.ts`

## Expected Result

`apps/web` can seed a deterministic owner/project/token dataset, log in through the real `/login` flow during Playwright global setup, and run stable browser smoke coverage across public token routes plus the authenticated dashboard once Supabase connectivity is available.
