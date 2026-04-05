import type {
  AssetRecord,
  ConceptRecord,
  JobRecord,
  ProjectRecord,
} from "@/server/database/types"
import {
  mapConceptPreviewAssetsByConceptId,
  toConceptGenerationState,
  toConceptPreviewState,
} from "./concept-view-model"

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function readPreviewDataUrl(asset: AssetRecord | null) {
  if (!asset) {
    return null
  }

  const previewDataUrl = asset.metadata.previewDataUrl
  return typeof previewDataUrl === "string" ? previewDataUrl : null
}

function getLatestConcept(concepts: ConceptRecord[]) {
  return concepts.reduce<ConceptRecord | null>((latest, concept) => {
    if (!latest) {
      return concept
    }

    return new Date(concept.updated_at).getTime() > new Date(latest.updated_at).getTime()
      ? concept
      : latest
  }, null)
}

export type ConceptsDashboardProjectViewModel = {
  conceptCount: number
  conceptGenerationDescription: string
  conceptGenerationLabel: string
  featuredPreviewDataUrl: string | null
  href: string
  latestConceptTitle: string | null
  latestUpdatedAtLabel: string
  previewCount: number
  previewDescription: string
  previewLabel: string
  projectId: string
  projectName: string
  projectStatus: ProjectRecord["status"]
  selectedConceptTitle: string | null
}

export type ConceptsDashboardSummaryViewModel = {
  projectsWithConcepts: number
  projectsWithPreviews: number
  selectedConceptProjects: number
  totalConcepts: number
  totalProjects: number
}

export function toConceptsDashboardProjectViewModel(input: {
  concepts: ConceptRecord[]
  jobs: JobRecord[]
  previewAssets: AssetRecord[]
  project: ProjectRecord
}): ConceptsDashboardProjectViewModel {
  const previewAssetsByConceptId = mapConceptPreviewAssetsByConceptId(input.previewAssets)
  const latestConcept = getLatestConcept(input.concepts)
  const selectedConcept =
    input.concepts.find((concept) => concept.id === input.project.selected_concept_id) ?? null
  const featuredConcept = selectedConcept ?? latestConcept
  const featuredPreviewAsset = featuredConcept
    ? previewAssetsByConceptId.get(featuredConcept.id) ?? null
    : null

  const conceptGenerationState = toConceptGenerationState(
    input.jobs,
    input.concepts.length
  )
  const previewState = toConceptPreviewState({
    concepts: input.concepts,
    jobs: input.jobs,
    previewAssetsCount: previewAssetsByConceptId.size,
  })

  return {
    conceptCount: input.concepts.length,
    conceptGenerationDescription: conceptGenerationState.description,
    conceptGenerationLabel: conceptGenerationState.label,
    featuredPreviewDataUrl: readPreviewDataUrl(featuredPreviewAsset),
    href: `/dashboard/projects/${input.project.id}`,
    latestConceptTitle: latestConcept?.title ?? null,
    latestUpdatedAtLabel: formatTimestamp(
      latestConcept?.updated_at ?? input.project.updated_at
    ),
    previewCount: previewAssetsByConceptId.size,
    previewDescription: previewState.description,
    previewLabel: previewState.label,
    projectId: input.project.id,
    projectName: input.project.name,
    projectStatus: input.project.status,
    selectedConceptTitle: selectedConcept?.title ?? null,
  }
}

export function summarizeConceptsDashboard(
  projects: ConceptsDashboardProjectViewModel[]
): ConceptsDashboardSummaryViewModel {
  return {
    projectsWithConcepts: projects.filter((project) => project.conceptCount > 0).length,
    projectsWithPreviews: projects.filter((project) => project.previewCount > 0).length,
    selectedConceptProjects: projects.filter((project) => project.selectedConceptTitle).length,
    totalConcepts: projects.reduce((sum, project) => sum + project.conceptCount, 0),
    totalProjects: projects.length,
  }
}
