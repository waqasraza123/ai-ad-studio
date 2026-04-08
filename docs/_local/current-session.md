# Current Session

## Date

2026-04-08

## Current Objective

Keep the simplified homepage hero preview intact while restoring the old demo sign-in affordance only on the `/login` page behind a hidden reveal action.

## Last Completed Step

Added a login-page-only demo sign-in reveal inside the sign-in form: the old admin demo email is no longer shown in the homepage top bar, but can now be expanded on `/login` and used to prefill the sign-in email.

## Current Step

Implementation is complete and targeted web verification passed. The next practical step is manual browser QA on `/login` to confirm the reveal animation, copy, and prefill flow feel intentional and unobtrusive.

## Scope Boundaries

- Billing is owner-scoped, not org/seat-scoped.
- Self-serve billing uses Stripe; manual stablecoin settlement is operator-only.
- `owner_guardrails` remain editable only as tighter personal caps beneath plan entitlements.
- Public campaign/delivery/showcase creation is gated by plan access; existing public items now use a 30-day downgrade-access check at read time.

## Likely Files To Touch Next

- `apps/web/src/components/auth/auth-panel.tsx`
- `apps/web/src/components/auth/demo-sign-in-reveal.tsx`
- `docs/_local/current-session.md`

## Key Constraints

- Keep the soft pink / muted editorial language.
- Preserve the existing homepage workflow content structure and product meaning.
- Prefer subtraction over preservation when space is constrained.
- Keep only one strong primary card and a lighter supporting column.
- Prefer readability, alignment, and whitespace over decorative density.
- Limit changes to homepage presentation/layout; no API, schema, or route changes.

## Verification Commands

- `pnpm --filter @ai-ad-studio/web typecheck`
- `pnpm --filter @ai-ad-studio/web build`
- manual viewport QA in browser

## Lookup Notes

- Login page: `apps/web/src/app/login/page.tsx`
- Auth panel: `apps/web/src/components/auth/auth-panel.tsx`
- Demo reveal: `apps/web/src/components/auth/demo-sign-in-reveal.tsx`

## Expected Result

The homepage stays free of demo credential clutter, while the sign-in page provides a small animated reveal that exposes the demo admin email and prefill action without dominating the auth UI.
