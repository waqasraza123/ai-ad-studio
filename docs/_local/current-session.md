# Current Session

## Date

2026-04-09

## Current Objective

Add production-grade English/Arabic internationalization with real RTL support, a prominent header language switcher, and cookie-backed locale persistence across the web app.

## Last Completed Step

Implemented the first saved test-plan slice for `apps/web`: added Vitest unit/component configs, shared test helpers under `src/test`, i18n and locale contract tests, component coverage for the language/theme switchers, and Playwright smoke coverage for login-page locale switching on desktop and mobile Chromium.

## Current Step

Expand the saved web test plan beyond the first harness slice: add component and browser coverage for public headers, auth panels, dashboard chrome, analytics formatting, and the next stable public/dashboard smoke routes from `docs/_local/web-i18n-rtl-test-plan.md`.

## Scope Boundaries

- Billing is owner-scoped, not org/seat-scoped.
- Self-serve billing uses Stripe; manual stablecoin settlement is operator-only.
- `owner_guardrails` remain editable only as tighter personal caps beneath plan entitlements.
- Public campaign/delivery/showcase creation is gated by plan access; existing public items now use a 30-day downgrade-access check at read time.

## Likely Files To Touch Next

- `apps/web/src/components/i18n/*`
- `apps/web/src/components/auth/*`
- `apps/web/src/components/layout/*`
- `apps/web/e2e/*`
- `apps/web/src/test/*`
- `docs/_local/current-session.md`

## Key Constraints

- Keep URLs stable; locale stays in cookie state, not path prefixes.
- Preserve design quality in both LTR and RTL; prefer logical properties/utilities over one-off left/right fixes.
- Keep user-authored and provider-authored content unchanged; localize repo-owned UI copy and formatting only.
- Preserve the existing marketing/editorial tone while improving Arabic readability and alignment.

## Verification Commands

- `pnpm --filter @ai-ad-studio/web test`
- `pnpm --filter @ai-ad-studio/web test:unit`
- `pnpm --filter @ai-ad-studio/web test:component`
- `pnpm --filter @ai-ad-studio/web test:i18n-audit`
- `pnpm --filter @ai-ad-studio/web test:e2e:smoke`
- `pnpm --filter @ai-ad-studio/web typecheck`
- `pnpm --filter @ai-ad-studio/web build`
- `rg -n 'Intl\\.DateTimeFormat\\("en"' apps/web/src --glob '!**/*.test.ts'`
- manual browser QA in English + Arabic

## Lookup Notes

- i18n core: `apps/web/src/lib/i18n/*`
- Language switcher: `apps/web/src/components/i18n/language-switcher.tsx`
- Root locale/layout wiring: `apps/web/src/app/layout.tsx`
- Locale cookie seeding: `apps/web/src/lib/supabase/middleware.ts`
- Public header: `apps/web/src/components/i18n/public-page-header.tsx`
- Test harness: `apps/web/vitest.config.ts`, `apps/web/vitest.unit.config.ts`, `apps/web/vitest.component.config.ts`, `apps/web/playwright.config.ts`
- Shared test helpers: `apps/web/src/test/*`
- Saved test strategy: `docs/_local/web-i18n-rtl-test-plan.md`

## Expected Result

`apps/web` now has a real regression harness for the i18n/RTL slice: locale resolution and cookie persistence are unit-tested, shared switchers have component coverage, and login locale switching is smoke-tested end to end in desktop and mobile Chromium.
