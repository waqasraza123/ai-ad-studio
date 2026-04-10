# Current Session

## Date

2026-04-10

## Current Objective

Refactor the web app toward a true full-width application layout while preserving the recent activation + feedback work already in the dirty worktree.

## Last Completed Step

Completed the full-width layout pass for `apps/web`. Added shared width primitives in `src/components/layout/page-frame.tsx`, width tokens/utilities in `apps/web/src/app/globals.css`, widened the authenticated shell in `src/components/layout/app-shell.tsx`, migrated public wrappers/marketing sections to shared public frame rules, moved export detail and new-project into explicit `expanded` app frames, and widened dense operational grids like project list, exports dashboard, billing plan cards, workspace administration, and creative-performance breakdowns. Added English/Arabic copy for the widened new-project and exports headers, added `src/components/layout/page-frame.test.tsx`, and re-verified with `pnpm --filter @ai-ad-studio/web exec vitest run --config vitest.component.config.ts src/components/layout`, `pnpm --filter @ai-ad-studio/web exec vitest run --config vitest.component.config.ts src/app src/features/projects src/features/exports src/features/settings`, `pnpm --filter @ai-ad-studio/web build`, and `pnpm --filter @ai-ad-studio/web typecheck`.

## Current Step

The layout refactor is implemented and verified. The next step is manual QA across the widened authenticated and public surfaces, then commit/push only the layout-related files without bundling the unrelated activation/analytics work unless intentionally desired.

## Scope Boundaries

- Activation packages remain internal preparation records only; no direct partner publish APIs or scheduler behavior were added.
- Creative performance ingestion is owner- and operator-submitted manual data in this phase; there is no partner-network sync yet.
- The product workflow stays constrained; this slice extends the durable checkpoints instead of creating a generic campaign manager or media-buying surface.
- Public campaign/delivery/showcase semantics are unchanged; activation packages are separate from those public surfaces.

## Likely Files To Touch Next

- `apps/web/src/server/activation/activation-service.ts`
- `apps/web/src/components/layout/page-frame.tsx`
- `apps/web/src/components/layout/app-shell.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/src/app/(app)/dashboard/projects/new/page.tsx`
- `apps/web/src/app/(app)/dashboard/exports/[exportId]/page.tsx`
- `apps/web/src/app/login/page.tsx`
- `docs/_local/current-session.md`

## Key Constraints

- Keep URLs stable; locale stays in cookie state, not path prefixes.
- Preserve design quality in both LTR and RTL; prefer logical properties/utilities over one-off left/right fixes.
- Keep user-authored and provider-authored content unchanged; localize repo-owned UI copy and formatting only.
- The browser harness is intentionally real-stack: no mock auth mode, no test-only HTTP endpoints, and fixture setup depends on reachable Supabase auth + service-role APIs.
- The local environment here can `typecheck` and `build`, but current Supabase auth requests are timing out; seeded E2E verification has to be rerun from a network path that can reach the configured Supabase host.
- Activation package creation and creative-performance ingestion are now billed feature gates on paid plans only.
- Historical `preview_asset_id` backfill is best-effort; ambiguous legacy exports are allowed to remain null.
- The app shell now provides the default fluid page frame; only intentionally narrower authenticated surfaces should opt into explicit `expanded` or `readable` frames.
- Public landing/tokenized surfaces now share one public frame system; preserve readable copy caps inside those wider wrappers instead of reintroducing page-level `max-w-*` wrappers ad hoc.

## Verification Commands

- `pnpm --filter @ai-ad-studio/web exec vitest run --config vitest.unit.config.ts src/server/billing/billing-plan-catalog.test.ts src/server/billing/runtime-readiness.test.ts src/app/api/health/route.test.ts src/server/billing/purchase-availability.test.ts`
- `pnpm --filter @ai-ad-studio/web exec vitest run --config vitest.component.config.ts src/components/marketing/pricing-snapshot-section.test.tsx src/app/page.test.tsx`
- `pnpm --filter @ai-ad-studio/web exec vitest run --config vitest.component.config.ts src/features/settings/components/billing-plan-panel.test.tsx`
- `pnpm --filter @ai-ad-studio/web exec vitest run --config vitest.component.config.ts src/features/settings src/components/layout`
- `pnpm --filter @ai-ad-studio/web exec vitest run --config vitest.unit.config.ts src/features/settings/actions`
- `pnpm --filter @ai-ad-studio/web exec vitest run --config vitest.unit.config.ts src/lib/env.test.ts`
- `pnpm --filter @ai-ad-studio/web exec vitest run --config vitest.component.config.ts src/components/layout`
- `pnpm --filter @ai-ad-studio/web exec vitest run --config vitest.component.config.ts src/app src/features/projects src/features/exports src/features/settings`
- `pnpm --filter @ai-ad-studio/web typecheck`
- `pnpm --filter @ai-ad-studio/web build`
- manual QA on `/dashboard`, `/dashboard/projects/new`, `/dashboard/projects/[projectId]`, `/dashboard/exports`, `/dashboard/exports/[exportId]`, `/dashboard/analytics`, `/dashboard/settings`, and `/dashboard/delivery`
- manual QA on `/`, `/login`, `/showcase`, `/review/[token]`, `/delivery/[token]`, `/campaign/[token]`, and `/share/[token]`

## Lookup Notes

- Width system: `apps/web/src/components/layout/page-frame.tsx`
- Shell/frame globals: `apps/web/src/app/globals.css`
- Authenticated shell: `apps/web/src/components/layout/app-shell.tsx`
- Public frame consumers: `apps/web/src/components/marketing/*`, `apps/web/src/components/i18n/public-page-header.tsx`, and tokenized public routes under `apps/web/src/app/*`

## Expected Result

The product now uses width intentionally: the authenticated app feels like a real modern canvas, dense workflow surfaces have more room, detail/form pages opt into an expanded frame instead of arbitrary narrow wrappers, and public surfaces share one coherent centered width system without losing readability.
