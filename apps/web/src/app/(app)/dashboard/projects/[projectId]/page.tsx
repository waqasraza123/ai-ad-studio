import { notFound } from "next/navigation"
import { ConceptList } from "@/features/concepts/components/concept-list"
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
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { listConceptsByProjectIdForOwner } from "@/server/concepts/concept-repository"
import { getLatestExportByProjectIdForOwner } from "@/server/exports/export-repository"
import {
  listAssetsByProjectIdForOwner,
  listConceptPreviewAssetsByProjectIdForOwner
} from "@/server/projects/asset-repository"
import { getProjectInputByProjectIdForOwner } from "@/server/projects/project-input-repository"
import { getProjectByIdForOwner } from "@/server/projects/project-repository"
import { listJobsByProjectIdForOwner } from "@/server/jobs/job-repository"

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string
  }>
}

export default async function ProjectDetailPage({
  params
}: ProjectDetailPageProps) {
  const { projectId } = await params
  const user = await getAuthenticatedUser()

  if (!user) {
    notFound()
  }

  const [project, projectInput, assets, concepts, jobs, previewAssets, latestExport] =
    await Promise.all([
      getProjectByIdForOwner(projectId, user.id),
      getProjectInputByProjectIdForOwner(projectId, user.id),
      listAssetsByProjectIdForOwner(projectId, user.id),
      listConceptsByProjectIdForOwner(projectId, user.id),
      listJobsByProjectIdForOwner(projectId, user.id),
      listConceptPreviewAssetsByProjectIdForOwner(projectId, user.id),
      getLatestExportByProjectIdForOwner(projectId, user.id)
    ])

  if (!project) {
    notFound()
  }

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
  const selectedPlatformPreset = getLatestPlatformPreset(
    latestExport?.platform_preset
  )

  const scenePlan = selectedConcept
    ? buildScenePlanPreview({
        callToAction: projectInput?.call_to_action ?? null,
        hook: selectedConcept.hook,
        platformPreset: selectedPlatformPreset,
        script: selectedConcept.script,
        variantKey: selectedVariantKey
      })
    : []

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
            This page now includes safety-reviewed concepts, structured scene
            planning, render variants, and multi-format export presets.
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
              <p className="text-sm text-slate-400">Brief</p>
              <p className="mt-2 text-lg font-medium text-white">
                {summary.hasBrief ? "Saved" : "Incomplete"}
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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ProjectBriefForm projectId={projectId} projectInput={projectInput} />
        <ProjectUploadPanel projectId={projectId} assets={assets} />
      </div>
    </div>
  )
}
