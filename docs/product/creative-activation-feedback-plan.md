# Creative Activation + Feedback Plan

## Summary

This slice extends the existing workflow without changing its shape. The durable workflow remains:

`brief -> concepts -> previews -> render batches -> review -> canonical winner -> promotion -> delivery`

The missing product layer is what happens after a canonical winner exists and how outcome data returns to the system. Phase 1 adds that foundation through:

- internal activation packages for finalized exports
- manual creative performance ingestion tied to real lineage
- creative performance analytics in the dashboard

This keeps the product opinionated and auditable. It does not add external ad-platform publishing, scheduling, or media buying controls.

## Current-State Audit Summary

- Workflow state is already durable in Supabase and server repositories.
- Canonical export state already exists in `projects.canonical_export_id` and `render_batches.finalized_export_id`.
- Public execution-adjacent surfaces already exist: showcase items, share campaigns, delivery workspaces, share links, and external review links.
- Billing and feature access are centralized in `apps/web/src/server/billing/billing-service.ts`.
- Current analytics only track provider usage and estimated cost through `usage_events`.
- Exports do not currently carry a durable `preview_asset_id`, so preview lineage is only implicit in `render_metadata`.

## Architectural Recommendation

- Add normalized internal activation records instead of jumping straight to external publish APIs.
- Add normalized creative performance records and ingestion batches before any recommendation layer.
- Store lineage snapshots on performance records so analytics remain stable even if related project metadata changes later.
- Treat activation readiness as package state, not export state.

## Phased Roadmap

### Phase 1

- Add `exports.preview_asset_id` for durable preview lineage.
- Add `activation_packages` for channel-ready internal prep of finalized exports.
- Add `creative_performance_ingestion_batches` and `creative_performance_records`.
- Add owner manual ingestion plus operator API ingestion.
- Add dashboard creative-performance scorecards and export-level activation UI.

### Phase 2

- Expand readiness into richer blocked/ready reason sets and package history workflows.
- Add multi-row ingestion, operator correction flows, and more detailed analytics filters.
- Add derived channel and creative-comparison summaries by hook, tone, CTA, audience, offer, and format.

### Phase 3

- Add intelligence materialization for winning patterns, fatigue detection, repeated underperformance, and next-iteration guidance grounded in prior outputs and outcomes.

## Why This Phase Order Is Correct

- Activation packages create the internal publish-ready representation the product is missing today.
- Performance records create the durable outcome facts needed for every later analytics and intelligence layer.
- Direct network publishing and recommendation logic should not ship before the data model and audit trail exist.

## Schema and Domain Changes

- Add `exports.preview_asset_id nullable references assets(id)`.
- Add `activation_packages` keyed by owner/project/export/channel with manifest, channel payload, asset bundle, readiness, and audit fields.
- Add `creative_performance_ingestion_batches` for manual owner/operator submission metadata.
- Add `creative_performance_records` keyed to project/export lineage with metric date, channel, KPIs, and denormalized creative snapshots.
- Extend billing feature access with:
  - `allowActivationPackages`
  - `allowCreativePerformanceIngestion`
  - `allowCreativePerformanceAnalytics`

## API, Worker, and UI Changes

- Add `src/server/activation/*` for activation package creation, listing, readiness evaluation, and manifest download support.
- Add `src/server/creative-performance/*` for ingestion, lineage resolution, and analytics summaries.
- Update the render worker so export creation writes `preview_asset_id`.
- Add owner server actions for activation package creation and manual performance submission.
- Add an operator-only manual ingestion API protected by a dedicated creative-performance operator secret.
- Add an activation panel to finalized export detail pages.
- Add a creative-performance section to `/dashboard/analytics`.

## Entitlements and Guardrails

- Free plan does not get activation packages or creative performance features.
- Starter, Growth, and Scale include activation packages and creative performance ingestion/analytics.
- No new numeric caps are introduced in this slice; feature gating is sufficient for phase 1.

## Testing Strategy

- Migration/repository tests for new tables and preview lineage backfill.
- Service/action tests for finalized-export validation, billing gate enforcement, and ingestion validation.
- Analytics query tests for KPI rollups and grouped summaries.
- Component tests for activation panel and manual ingestion UI.
- Browser coverage can extend later once seeded E2E fixture data includes the new domains.

## Migration and Backfill Strategy

- Backfill `exports.preview_asset_id` only when an exact or unique preview match can be determined safely.
- Leave ambiguous historical exports with `preview_asset_id = null`.
- No backfill is needed for activation packages or creative performance records.

## Risk Analysis and Rollout Notes

- The main lineage risk is historical preview ambiguity; this is handled by best-effort backfill plus explicit forward writes from the worker.
- Activation remains internal-only in phase 1, which prevents accidental drift into a scheduler or media-buying surface.
- Operator tooling stays API-first and narrow until broader support-surface needs are proven.

## Exact First Implementation Slice

1. Add the phase-1 migration for preview lineage, activation packages, creative performance tables, and billing feature access.
2. Update TypeScript database contracts and repositories.
3. Persist `preview_asset_id` from the render worker when creating exports.
4. Add activation package creation/listing plus manifest download.
5. Add owner manual performance ingestion and operator API ingestion.
6. Extend `/dashboard/analytics` with creative scorecards and grouped breakdowns.
7. Enforce entitlements for activation and creative-performance actions.
8. Add focused unit/component tests for the new domain and analytics logic.
