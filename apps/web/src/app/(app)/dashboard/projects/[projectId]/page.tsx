import { notFound } from "next/navigation"
import { AnalyticsOverview } from "@/features/analytics/components/analytics-overview"
import { ApprovalGatePanel } from "@/features/approvals/components/approval-gate-panel"
import { UsageEventsTable } from "@/features/analytics/components/usage-events-table"
import { ConceptList } from "@/features/concepts/components/concept-list"
import { ExportSummary } from "@/features/exports/components/export-summary"
import { ProjectExportsPanel } from "@/features/exports/components/project-exports-panel"
import { GenerateConceptsPanel } from "@/features/concepts/components/generate-concepts-panel"
import { GenerateConceptPreviewsPanel } from "@/features/concepts/components/generate-concept-previews-panel"
import {
  mapConceptPreviewAssetsByConceptId,
  toConceptCardViewModel,
  toConceptGenerationState,
  toConceptPreviewState,
  toRenderState,
  getLatestPlatformPreset,
  getLatestVariantKey
} from "@/features/concepts/mappers/concept-view-model"
import { ProjectBriefForm } from "@/features/projects/components/project-brief-form"
import { ProjectUploadPanel } from "@/features/projects/components/project-upload-panel"
import { toProjectDetailSummary } from "@/features/projects/mappers/project-view-model"
import { RenderPanel } from "@/features/renders/components/render-panel"
import { buildScenePlanPreview } from "@/features/renders/lib/scene-plan"
import { TemplateSelectorPanel } from "@/features/templates/components/template-selector-panel"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { listUsageEventsByProjectIdForOwner } from "@/server/analytics/usage-event-repository"
import { getLatestApprovalByProjectIdForOwner } from "@/server/approvals/approval-repository"
import { listConceptsByProjectIdForOwner } from "@/server/concepts/concept-repository"
import {
  getLatestExportByProjectIdForOwner,
  listExportsByProjectIdForOwner
} from "@/server/exports/export-repository"
import {
  listAssetsByProjectIdForOwner,
  listConceptPreviewAssetsByProjectIdForOwner
} from "@/server/projects/asset-repository"
import { getProjectInputByProjectIdForOwner } from "@/server/projects/project-input-repository"
import { getProjectByIdForOwner } from "@/server/projects/project-repository"
import { listTemplatesByOwner } from "@/server/templates/template-repository"
import { listJobsByProjectIdForOwner } from "@/server/jobs/job-repository"

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string
  }>
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

export default async function ProjectDetailPage({
  params
}: ProjectDetailPageProps) {
  const { projectId } = await params
  const user = await getAuthenticatedUser()

  if (!user) {
    notFound()
  }

  const [
    project,
    projectInput,
    assets,
    concepts,
    jobs,
    previewAssets,
    latestExport,
    exports,
    usageEvents,
    latestApproval,
    templates
  ] = await Promise.all([
    getProjectByIdForOwner(projectId, user.id),
    getProjectInputByProjectIdForOwner(projectId, user.id),
    listAssetsByProjectIdForOwner(projectId, user.id),
    listConceptsByProjectIdForOwner(projectId, user.id),
    listJobsByProjectIdForOwner(projectId, user.id),
    listConceptPreviewAssetsByProjectIdForOwner(projectId, user.id),
    getLatestExportByProjectIdForOwner(projectId, user.id),
    listExportsByProjectIdForOwner(projectId, user.id),
    listUsageEventsByProjectIdForOwner(projectId, user.id),
    getLatestApprovalByProjectIdForOwner(projectId, user.id),
    listTemplatesByOwner(user.id)
  ])

  if (!project) {
    notFound()
  }

  const currentTemplate =
    templates.find((template) => template.id === project.template_id) ?? templates[0] ?? null

  const summary = toProjectDetailSummary({
    assets,
    project,
    projectInput
  })

  const conceptGenerationState = toConceptGenerationState(jobs, concepts.length)
  const conceptPreviewState = toConceptPreviewState({
    concepts,
    jobs,
    previewAssetsCount: previewAssets.length
  })

  const previewAssetsByConceptId = mapConceptPreviewAssetsByConceptId(previewAssets)

  const conceptViewModels = concepts.map((concept) =>
    toConceptCardViewModel({
      concept,
      previewAsset: previewAssetsByConceptId.get(concept.id) ?? null,
      selectedConceptId: project.selected_concept_id
    })
  )

  const selectedConcept =
    concepts.find((concept) => concept.id === project.selected_concept_id) ?? null

  const renderState = toRenderState({
    hasLatestExport: Boolean(latestExport),
    jobs,
    selectedConceptTitle: selectedConcept?.title ?? null
  })

  const selectedVariantKey = getLatestVariantKey(latestExport?.variant_key)
  const selectedPlatformPreset = getLatestPlatformPreset(latestExport?.platform_preset)

  const scenePlan = selectedConcept
    ? buildScenePlanPreview({
        callToAction: projectInput?.call_to_action ?? null,
        hook: selectedConcept.hook,
        platformPreset: selectedPlatformPreset,
        script: selectedConcept.script,
        template: currentTemplate,
        variantKey: selectedVariantKey
      })
    : []

  const latestExportAsset =
    latestExport ? assets.find((asset) => asset.id === latestExport.asset_id) ?? null : null

  const latestPreviewDataUrl =
    latestExportAsset && typeof latestExportAsset.metadata.previewDataUrl === "string"
      ? latestExportAsset.metadata.previewDataUrl
      : null

  const latestVideoSrc =
    latestExportAsset?.mime_type === "video/mp4"
      ? `/api/exports/${latestExport.id}/download`
      : null

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SurfaceCard className="p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Project detail
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
            {summary.projectName}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            This page now includes reusable branded templates, scene packs, CTA presets,
            approval gates, export management, and cost tracking.
          </p>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Project summary
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Status</p>
              <p className="mt-2 text-lg font-medium text-white">
                {summary.projectStatus}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Assets</p>
              <p className="mt-2 text-lg font-medium text-white">
                {summary.assetCount}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Duration</p>
              <p className="mt-2 text-lg font-medium text-white">
                {summary.durationLabel}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Template</p>
              <p className="mt-2 text-lg font-medium text-white">
                {currentTemplate?.name ?? "None"}
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm text-slate-400">
            Created {summary.createdAtLabel}
          </p>
        </SurfaceCard>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <GenerateConceptsPanel
          description={conceptGenerationState.description}
          label={conceptGenerationState.label}
          projectId={projectId}
        />
        <GenerateConceptPreviewsPanel
          description={conceptPreviewState.description}
          isBlocked={conceptPreviewState.isBlocked}
          label={conceptPreviewState.label}
          projectId={projectId}
        />
      </div>

      <ConceptList concepts={conceptViewModels} projectId={projectId} />

      <div className="grid gap-6 xl:grid-cols-2">
        <TemplateSelectorPanel
          currentTemplateId={project.template_id}
          projectId={projectId}
          templates={templates}
        />
        <RenderPanel
          latestExportId={latestExport?.id ?? null}
          platformPreset={selectedPlatformPreset}
          projectId={projectId}
          renderJobDescription={renderState.description}
          renderJobLabel={renderState.label}
          scenePlan={scenePlan}
          selectedConceptTitle={selectedConcept?.title ?? null}
          selectedVariantKey={selectedVariantKey}
        />
      </div>

      <ApprovalGatePanel approval={latestApproval} selectedConcept={selectedConcept} />

      {latestExport ? (
        <ExportSummary
          createdAtLabel={formatTimestamp(latestExport.created_at)}
          downloadHref={latestVideoSrc}
          projectName={project.name}
          previewDataUrl={latestPreviewDataUrl}
          status={latestExport.status}
          videoSrc={latestVideoSrc}
        />
      ) : null}

      <ProjectExportsPanel exports={exports} />
      <AnalyticsOverview usageEvents={usageEvents} />
      <UsageEventsTable usageEvents={usageEvents} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ProjectBriefForm projectId={projectId} projectInput={projectInput} />
        <ProjectUploadPanel projectId={projectId} assets={assets} />
      </div>
    </div>
  )
}
