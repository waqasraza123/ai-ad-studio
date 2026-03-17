import type { SupabaseClient } from "@supabase/supabase-js"
import { downloadObjectAsDataUri } from "@/lib/storage/r2"
import { RunwayPreviewProvider } from "@/providers/runway-preview-provider"
import {
  createConceptPreviewAssets,
  deleteConceptPreviewAssetsByProjectId
} from "@/repositories/assets-repository"
import {
  listConceptsByProjectId,
  updateConceptStatus
} from "@/repositories/concepts-repository"
import { listProjectAssetsByProjectId } from "@/repositories/projects-assets-repository"
import { getProjectById } from "@/repositories/projects-repository"
import type { WorkerJobRecord } from "@/repositories/jobs-repository"

function toTag(kind: string, index: number) {
  const base = kind === "logo" ? "logo" : "product"
  return `${base}${index + 1}`
}

export async function handleGenerateConceptPreviewJob(
  supabase: SupabaseClient,
  job: WorkerJobRecord
) {
  const [project, concepts, projectAssets] = await Promise.all([
    getProjectById(supabase, job.project_id),
    listConceptsByProjectId(supabase, job.project_id),
    listProjectAssetsByProjectId(supabase, job.project_id)
  ])

  if (!project) {
    throw new Error("Project not found for concept preview generation")
  }

  if (concepts.length === 0) {
    throw new Error("Concepts not found for concept preview generation")
  }

  const sourceAssets = projectAssets.filter(
    (asset) => asset.kind === "product_image" || asset.kind === "logo"
  )

  if (sourceAssets.length === 0) {
    throw new Error("Upload at least one product image or logo before generating previews")
  }

  const referenceImages = await Promise.all(
    sourceAssets.slice(0, 3).map(async (asset, index) => ({
      tag: toTag(asset.kind, index),
      uri: await downloadObjectAsDataUri({
        contentType: asset.mime_type,
        storageKey: asset.storage_key
      })
    }))
  )

  const provider = new RunwayPreviewProvider()

  await deleteConceptPreviewAssetsByProjectId(supabase, job.project_id)

  const generatedAssets = await Promise.all(
    concepts.map(async (concept) => {
      const preview = await provider.generatePreview({
        angle: concept.angle,
        hook: concept.hook,
        productName: project.name,
        referenceImages,
        title: concept.title,
        visualDirection: concept.visual_direction ?? "premium studio product shot"
      })

      return {
        kind: "concept_preview" as const,
        metadata: {
          conceptId: concept.id,
          previewDataUrl: preview.imageUrl,
          provider: "runway",
          runwayTaskId: preview.taskId,
          uploadStatus: "ready"
        },
        mime_type: "image/webp" as const,
        owner_id: concept.owner_id,
        project_id: concept.project_id,
        storage_key: `runway-preview://${concept.project_id}/${concept.id}`
      }
    })
  )

  await createConceptPreviewAssets(supabase, generatedAssets)

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
    provider: "runway",
    projectId: project.id
  }
}
