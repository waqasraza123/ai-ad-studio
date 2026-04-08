# Current Session

## Date

2026-04-08

## Current Objective

Fix the homepage hero preview readability issue where dense preview content and decorative floating cards overlap at intermediate desktop widths.

## Last Completed Step

Refactored the homepage hero preview to be content-driven instead of fixed-height: the preview shell now uses responsive min-height guardrails, the main preview content is no longer absolutely positioned, the internal layout stays stacked until wider breakpoints, and floating cards are reduced to perimeter accents that only appear on larger screens. Also shortened dense preview copy and reduced tile count to prevent text collisions.

## Current Step

Implementation is complete and repo-verified. The next practical step is manual browser QA across mobile, tablet, intermediate laptop, and large desktop widths to confirm the hero preview no longer overlaps visually in real rendering.

## Scope Boundaries

- Billing is owner-scoped, not org/seat-scoped.
- Self-serve billing uses Stripe; manual stablecoin settlement is operator-only.
- `owner_guardrails` remain editable only as tighter personal caps beneath plan entitlements.
- Public campaign/delivery/showcase creation is gated by plan access; existing public items now use a 30-day downgrade-access check at read time.

## Likely Files To Touch Next

- `apps/web/src/components/marketing/hero-preview.tsx`
- `apps/web/src/app/globals.css`
- `docs/_local/current-session.md`

## Key Constraints

- Keep the current premium hero-preview concept; do not replace it with a totally different hero visual.
- Prefer readability and container safety over decorative density.
- Limit changes to homepage presentation/layout; no API, schema, or route changes.

## Verification Commands

- `pnpm --filter @ai-ad-studio/web typecheck`
- `pnpm --filter @ai-ad-studio/web build`
- manual viewport QA in browser

## Lookup Notes

- Hero preview component: `apps/web/src/components/marketing/hero-preview.tsx`
- Shared homepage styling: `apps/web/src/app/globals.css`
- Hero section composition: `apps/web/src/components/marketing/hero-section.tsx`

## Expected Result

The homepage hero preview should stay readable across viewport transitions, with no stacked text collisions, no clipped main content, and floating cards acting as secondary accents instead of overlapping the primary preview content.
