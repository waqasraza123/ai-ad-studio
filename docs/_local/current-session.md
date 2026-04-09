# Current Session

## Date

2026-04-09

## Current Objective

Add production-grade English/Arabic internationalization with real RTL support, a prominent header language switcher, and cookie-backed locale persistence across the web app.

## Last Completed Step

Implemented the core i18n/RTL foundation in `apps/web`: locale config and catalogs, request resolution and cookie persistence, root layout `lang/dir` wiring, shared language switchers, localized auth/shared chrome/public headers, and locale-aware formatting in the analytics/project/concept surfaces touched this turn. Saved the comprehensive follow-up test strategy in `docs/_local/web-i18n-rtl-test-plan.md`.

## Current Step

Implement the saved web test plan: add the `apps/web` Vitest component harness, Playwright browser coverage, i18n/RTL contract tests, and key route smoke coverage from `docs/_local/web-i18n-rtl-test-plan.md`.

## Scope Boundaries

- Billing is owner-scoped, not org/seat-scoped.
- Self-serve billing uses Stripe; manual stablecoin settlement is operator-only.
- `owner_guardrails` remain editable only as tighter personal caps beneath plan entitlements.
- Public campaign/delivery/showcase creation is gated by plan access; existing public items now use a 30-day downgrade-access check at read time.

## Likely Files To Touch Next

- `apps/web/src/features/delivery/components/*`
- `apps/web/src/features/renders/components/*`
- `apps/web/src/features/settings/components/*`
- `apps/web/src/components/marketing/*`
- `docs/_local/current-session.md`

## Key Constraints

- Keep URLs stable; locale stays in cookie state, not path prefixes.
- Preserve design quality in both LTR and RTL; prefer logical properties/utilities over one-off left/right fixes.
- Keep user-authored and provider-authored content unchanged; localize repo-owned UI copy and formatting only.
- Preserve the existing marketing/editorial tone while improving Arabic readability and alignment.

## Verification Commands

- `pnpm --filter @ai-ad-studio/web test:unit`
- `pnpm --filter @ai-ad-studio/web test:component`
- `pnpm --filter @ai-ad-studio/web test:i18n-audit`
- `pnpm --filter @ai-ad-studio/web test:e2e:smoke`
- `pnpm --filter @ai-ad-studio/web typecheck`
- `pnpm --filter @ai-ad-studio/web build`
- `pnpm --filter @ai-ad-studio/web test`
- `rg -n 'Intl\\.DateTimeFormat\\("en"' apps/web/src --glob '!**/*.test.ts'`
- manual browser QA in English + Arabic

## Lookup Notes

- i18n core: `apps/web/src/lib/i18n/*`
- Language switcher: `apps/web/src/components/i18n/language-switcher.tsx`
- Root locale/layout wiring: `apps/web/src/app/layout.tsx`
- Locale cookie seeding: `apps/web/src/lib/supabase/middleware.ts`
- Public header: `apps/web/src/components/i18n/public-page-header.tsx`
- Saved test strategy: `docs/_local/web-i18n-rtl-test-plan.md`

## Expected Result

Arabic users can switch the product into a true RTL experience without URL changes, the preference persists across reloads, and the most visible shared/public/auth/dashboard surfaces now render translated copy with locale-aware formatting.
