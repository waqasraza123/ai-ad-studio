# Current Session

## Date

2026-04-08

## Current Objective

Redesign the homepage hero preview section with a strict simplification-first approach so the narrow desktop split stays light, airy, and fully readable.

## Last Completed Step

Reduced the hero preview to one primary approved-campaign-package card plus a compact 3-step checkpoint rail, collapsing metadata into short rows and removing the extra explanatory panels that were making the section feel heavy.

## Current Step

Implementation is complete and targeted web verification passed. The next practical step is manual browser QA at the problematic desktop width plus tablet/mobile widths to confirm the reduced layout reads cleanly without overlap or clipping.

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
- Prefer subtraction over preservation when space is constrained.
- Keep only one strong primary card and a lighter supporting column.
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

The homepage hero preview should read as a quiet editorial SaaS panel with one clear approved-package focal point, only a few compact workflow checkpoints, and no clipped or colliding text at the narrow desktop split.
