# Current Session

## Date

2026-04-08

## Current Objective

Redesign the homepage hero preview section into a calmer editorial layout that keeps the same workflow meaning while improving hierarchy, spacing, and desktop readability.

## Last Completed Step

Rebuilt the hero preview again around a desktop-first editorial board: one dominant approved-campaign-package panel on the left, a vertical workflow checkpoint rail on the right, and cleaner grouped metadata/support cards with no overlapping text treatment.

## Current Step

Implementation is complete and targeted web verification passed. The next practical step is manual browser QA across mobile, tablet, intermediate laptop, and large desktop widths to confirm spacing and scanability in real rendering.

## Scope Boundaries

- Billing is owner-scoped, not org/seat-scoped.
- Self-serve billing uses Stripe; manual stablecoin settlement is operator-only.
- `owner_guardrails` remain editable only as tighter personal caps beneath plan entitlements.
- Public campaign/delivery/showcase creation is gated by plan access; existing public items now use a 30-day downgrade-access check at read time.

## Likely Files To Touch Next

- `apps/web/src/components/marketing/hero-preview.tsx`
- `docs/_local/current-session.md`

## Key Constraints

- Keep the soft pink / muted editorial language.
- Preserve the existing homepage workflow content structure and product meaning.
- Prefer readability, alignment, and whitespace over decorative density.
- Limit changes to homepage presentation/layout; no API, schema, or route changes.

## Verification Commands

- `pnpm --filter @ai-ad-studio/web typecheck`
- `pnpm --filter @ai-ad-studio/web build`
- manual viewport QA in browser

## Lookup Notes

- Hero preview component: `apps/web/src/components/marketing/hero-preview.tsx`
- Hero section composition: `apps/web/src/components/marketing/hero-section.tsx`

## Expected Result

The homepage hero preview should read as a polished editorial SaaS board with a clear focal point on the approved package, easily scanned workflow checkpoints, and no overlap or clipped content across responsive breakpoints.
