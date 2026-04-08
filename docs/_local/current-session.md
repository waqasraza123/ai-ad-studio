# Current Session

## Date

2026-04-08

## Current Objective

Fix the homepage hero preview readability issue where dense preview content and decorative floating cards overlap at intermediate desktop widths.

## Last Completed Step

Rebuilt the homepage hero preview area into a cleaner dashboard-style composition: the floating text cards are gone, the main preview now centers on a canonical-export board with compact checkpoint cards, and the shell height is content-driven instead of padded by large minimum-height guardrails.

## Current Step

Implementation is complete and web verification passed. The next practical step is manual browser QA across mobile, tablet, intermediate laptop, and large desktop widths to confirm the redesigned preview reads cleanly in real rendering.

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

The homepage hero preview should stay readable across viewport transitions, with no stacked text collisions, no clipped main content, and no text-bearing overlays bleeding through the primary preview area.
