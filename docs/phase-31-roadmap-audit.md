# Phase 31 Roadmap Audit

## Date

2026-04-05

## Scope

Audit the consolidated roadmap for Phases 1 through 30 against actual repo contents.

This audit is evidence-based:
- schema and migration files
- web routes and feature surfaces
- worker handlers and repositories
- repo-wide verification commands

It is not a substitute for full manual browser QA, deployment validation, or production database inspection.

## Overall Result

Phases 1 through 30 are present in the repo and now have explicit phase docs under `docs/phases`.

The audit also resolved several drift items during Phase 31:
- fixed delivery support activity totals that double-counted failed reminder repairs
- made `@ai-ad-studio/web` typecheck deterministic with `next typegen && tsc --noEmit --incremental false`
- fixed a Vitest import-resolution failure in reminder mismatch lifecycle summary code
- restored reminder mismatch reopen event presentation wiring in delivery activity helpers
- added the missing `owner_guardrails` schema migration and a writable settings action/UI so Phase 19 is backed by real schema instead of code-only assumptions
- added operator-safe runtime readiness reporting at `/api/health` plus a deployed smoke harness in `scripts/checks/runtime-smoke.ts`

## Verification Baseline

Verified green after the audit changes:
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm typecheck`

Optional deployed validation now exists via:
- `SMOKE_BASE_URL=https://your-app.example.com pnpm smoke:runtime`
- `SMOKE_BASE_URL=https://your-app.example.com pnpm verify:phase-31`

## Phase Ledger

- `Phase 1` Verified. Repo tooling baseline exists in `package.json`, `pnpm-workspace.yaml`, and `turbo.json`.
- `Phase 2` Verified. App/package boundaries exist in `apps/web/package.json`, `apps/worker/package.json`, and `packages/*/package.json`.
- `Phase 3` Verified. Core auth/schema/repository foundation exists in `supabase/migrations/202603170001_initial_schema.sql`, `apps/web/src/server/auth/get-authenticated-user.ts`, and `apps/web/src/server/projects/project-repository.ts`.
- `Phase 4` Verified. Project brief and asset intake flow exists in `apps/web/src/features/projects/actions/create-project.ts`, `apps/web/src/features/projects/components/project-brief-form.tsx`, and `apps/web/src/features/projects/components/project-upload-panel.tsx`.
- `Phase 5` Verified. Concept generation path exists in `apps/web/src/features/concepts/actions/generate-concepts.ts`, `apps/worker/src/jobs/handlers/generate-concepts-job.ts`, and `apps/web/src/server/concepts/concept-repository.ts`.
- `Phase 6` Verified. Concept preview flow exists in `apps/web/src/features/concepts/actions/generate-concept-previews.ts`, `apps/worker/src/jobs/handlers/generate-concept-preview-job.ts`, and `apps/web/src/features/concepts/components/concept-preview-card.tsx`.
- `Phase 7` Verified. Durable async execution exists in `apps/web/src/server/jobs/job-repository.ts`, `apps/worker/src/jobs/process-next-job.ts`, and `apps/worker/src/index.ts`.
- `Phase 8` Verified. Final render pipeline exists in `apps/web/src/features/renders/actions/render-project.ts`, `apps/worker/src/jobs/handlers/render-final-ad-job.ts`, and `apps/worker/src/media/ffmpeg/render-multi-scene-ad.ts`.
- `Phase 9` Verified. Export detail and download flow exists in `apps/web/src/app/(app)/dashboard/exports/[exportId]/page.tsx`, `apps/web/src/app/api/exports/[exportId]/download/route.ts`, and `apps/web/src/features/exports/components/export-summary.tsx`.
- `Phase 10` Verified. Platform presets and controlled render variation exist in `apps/web/src/features/renders/lib/platform-presets.ts`, `apps/web/src/features/renders/lib/scene-plan.ts`, and `supabase/migrations/202603180002_phase_13_multi_format_exports.sql`.
- `Phase 11` Verified. Project page acts as the orchestration surface in `apps/web/src/app/(app)/dashboard/projects/[projectId]/page.tsx` with integrated concept, render, approval, batch, and delivery panels.
- `Phase 12` Verified. Multi-format export evolution exists in `supabase/migrations/202603180002_phase_13_multi_format_exports.sql`, `apps/web/src/server/exports/export-repository.ts`, and export/dashboard routes under `apps/web/src/app/(app)/dashboard/exports`.
- `Phase 13` Verified. End-to-end workflow stabilization is reflected in the coherent route set, shared repositories, and green repo verification rather than a unique standalone artifact.
- `Phase 14` Verified. Export management and share links exist in `supabase/migrations/202603180003_phase_14_share_links.sql`, `apps/web/src/app/(app)/dashboard/exports/page.tsx`, `apps/web/src/features/exports/actions/create-share-link.ts`, and `apps/web/src/app/share/[token]/page.tsx`.
- `Phase 15` Verified. Usage analytics and cost tracking exist in `supabase/migrations/202603180004_phase_15_usage_analytics.sql`, `apps/web/src/app/(app)/dashboard/analytics/page.tsx`, and `apps/web/src/server/analytics/usage-event-repository.ts`.
- `Phase 16` Verified. Debug traces and failed-job tooling exist in `supabase/migrations/202603180005_phase_16_job_traces.sql`, `apps/web/src/app/(app)/dashboard/debug/jobs/page.tsx`, and `apps/web/src/features/debug/actions/retry-job.ts`.
- `Phase 17` Verified. Queue controls, cancellation, concurrency, and backoff exist in `supabase/migrations/202603180006_phase_17_queue_controls.sql`, `apps/web/src/features/debug/actions/cancel-job.ts`, and `apps/worker/src/lib/queue/config.ts`.
- `Phase 18` Verified. Notifications exist in `supabase/migrations/202603180007_phase_18_notifications.sql`, `apps/web/src/app/(app)/dashboard/notifications/page.tsx`, and `apps/web/src/server/notifications/notification-repository.ts`.
- `Phase 19` Verified in this audit pass. Owner guardrails now have schema in `supabase/migrations/202604051000_phase_19_owner_guardrails.sql`, writable settings UI in `apps/web/src/features/settings/components/owner-guardrails-form.tsx`, server persistence in `apps/web/src/server/settings/owner-guardrails-repository.ts`, and worker enforcement in `apps/worker/src/guardrails/owner-guardrails.ts`. Historical drift remains visible because `202603180008_phase_19_api_grants.sql` does not describe the guardrails scope by name.
- `Phase 20` Verified. Approval gates exist in `supabase/migrations/202603180009_phase_20_approval_gates.sql`, `apps/web/src/features/approvals/components/approval-gate-panel.tsx`, and `apps/worker/src/approvals/approval-service.ts`.
- `Phase 21` Verified. Templates exist in `supabase/migrations/202603180010_phase_21_templates.sql`, `apps/web/src/features/templates/components/template-selector-panel.tsx`, and `apps/web/src/server/templates/template-repository.ts`.
- `Phase 22` Verified. Showcase publishing exists in `supabase/migrations/202603180011_phase_22_showcase.sql`, `apps/web/src/app/showcase/page.tsx`, and `apps/web/src/server/showcase/showcase-repository.ts`.
- `Phase 23` Verified. Brand kits exist in `supabase/migrations/202603180012_phase_23_brand_kits.sql`, `apps/web/src/features/brand-kits/components/brand-kit-selector-panel.tsx`, and `apps/web/src/server/brand-kits/brand-kit-repository.ts`.
- `Phase 24` Verified. Platform render packs exist in `supabase/migrations/202603180013_phase_24_render_packs.sql`, `apps/web/src/features/render-packs/components/render-pack-summary-panel.tsx`, and `apps/web/src/server/render-packs/render-pack-repository.ts`.
- `Phase 25` Verified. Render batches exist in `supabase/migrations/202603180014_phase_25_render_batches.sql`, `apps/web/src/features/renders/actions/start-render-batch.ts`, and `apps/web/src/server/render-batches/render-batch-repository.ts`.
- `Phase 26` Verified. Comparative batch review and winner selection exist in `supabase/migrations/202603180015_phase_26_batch_review.sql`, `apps/web/src/app/(app)/dashboard/render-batches/[batchId]/page.tsx`, and `apps/web/src/features/renders/actions/select-render-batch-winner.ts`.
- `Phase 27` Verified. Winner-only promotion exists in `supabase/migrations/202603180016_phase_27_promotion_workflow.sql`, `apps/web/src/features/renders/actions/manage-share-campaign.ts`, `apps/web/src/app/campaign/[token]/page.tsx`, and `apps/web/src/server/promotion/promotion-eligibility.ts`.
- `Phase 28` Verified. External review links/comments exist in `supabase/migrations/202603180017_phase_28_external_batch_reviews.sql`, `apps/web/src/app/review/[token]/page.tsx`, and `apps/web/src/server/batch-reviews/batch-review-repository.ts`.
- `Phase 29` Verified. Final decision and canonical export flow exist in `supabase/migrations/202603180018_phase_29_final_decision_workflow.sql`, `apps/web/src/features/renders/actions/finalize-render-batch.ts`, and `apps/web/src/server/render-batches/finalization-rules.ts`.
- `Phase 30` Verified. Delivery workspace flow exists in `supabase/migrations/202603180019_phase_30_delivery_workspace.sql`, `apps/web/src/app/delivery/[token]/page.tsx`, and `apps/web/src/server/delivery-workspaces/delivery-workspace-repository.ts`.

## Post-Phase-30 Reality

The repo already contains delivery activity, acknowledgement, follow-up, reminder support, and mismatch-resolution behavior beyond the original Phase 30 delivery workspace scope.

Evidence includes:
- `apps/web/src/features/delivery/components/delivery-activity-timeline.tsx`
- `apps/web/src/features/delivery/actions/manage-delivery-workspace-follow-up.ts`
- `apps/worker/src/reminders/run-delivery-follow-up-reminder-sweep.ts`
- `supabase/migrations/202603210020_phase_32_delivery_analytics.sql`
- `supabase/migrations/202603221500_phase_32_delivery_follow_up_reminders.sql`

## Remaining Watchouts

- This audit proves repo presence and repo-wide green checks; it does not prove production environment configuration, R2 credentials, provider credentials, or public-token route behavior in a live deployment unless `smoke:runtime` is run against a real deployment with valid tokens.
