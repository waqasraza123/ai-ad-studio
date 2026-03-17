import type { SupabaseClient } from "@supabase/supabase-js"
import { MockPreviewProvider } from "@/providers/mock-preview-provider"
import {
  createConceptPreviewAssets,
  deleteConceptPreviewAssetsByProjectId
} from "@/repositories/assets-repository"
import {
  listConceptsByProjectId,
  updateConceptStatus
} from "@/repositories/concepts-repository"
import { getProjectById } from "@/repositories/projects-repository"
import type { WorkerJobRecord } from "@/repositories/jobs-repository"

export async function handleGenerateConceptPreviewJob(
  supabase: SupabaseClient,
  job: WorkerJobRecord
) {
  const [project, concepts] = await Promise.all([
    getProjectById(supabase, job.project_id),
    listConceptsByProjectId(supabase, job.project_id)
  ])

  if (!project) {
    throw new Error("Project not found for concept preview generation")
  }

  if (concepts.length === 0) {
    throw new Error("Concepts not found for concept preview generation")
  }

  const provider = new MockPreviewProvider()

  await deleteConceptPreviewAssetsByProjectId(supabase, job.project_id)

  await createConceptPreviewAssets(
    supabase,
    concepts.map((concept) => ({
      kind: "concept_preview",
      metadata: {
        conceptId: concept.id,
        previewDataUrl: provider.generatePreview({
          angle: concept.angle,
          hook: concept.hook,
          title: concept.title
        }),
        uploadStatus: "ready"
      },
      mime_type: "image/svg+xml",
      owner_id: concept.owner_id,
      project_id: concept.project_id,
      storage_key: `inline-preview://${concept.project_id}/${concept.id}`
    }))
  )

  await Promise.all(
    concepts.map((concept) =>
      updateConceptStatus(supabase, {
        conceptId: concept.id,
        status: project.selected_concept_id === concept.id ? "selected" : "preview_ready"
      })
    )
  )

  return {
    previewCount: concepts.length,
    projectId: project.id,
    provider: "mock-preview-provider"
  }
}
