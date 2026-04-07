import type { SupabaseClient } from "@supabase/supabase-js"
import { getWorkerEnvironment } from "@/lib/env"
import { downloadObjectAsDataUri } from "@/lib/storage/r2"
import { createPreviewProvider } from "@/providers/provider-factories"
import {
  createConceptPreviewAssets,
  deleteConceptPreviewAssetsByProjectId
} from "@/repositories/assets-repository"
import {
  listConceptsByProjectId,
  updateConceptStatus
} from "@/repositories/concepts-repository"
import { createJobTraces } from "@/repositories/job-traces-repository"
import { listProjectAssetsByProjectId } from "@/repositories/projects-assets-repository"
import { getProjectById } from "@/repositories/projects-repository"
import { createUsageEvents } from "@/repositories/usage-events-repository"
import type { WorkerJobRecord } from "@/repositories/jobs-repository"

function toTag(kind: string, index: number) {
  const base = kind === "logo" ? "logo" : "product"
  return `${base}${index + 1}`
}

function getPreviewGenerationCost(provider: string) {
  if (provider === "runway") {
    return 0.02
  }

  return 0
}

function getPreviewByteSize(dataUrl: string) {
  if (!dataUrl.startsWith("data:")) {
    return Buffer.byteLength(dataUrl)
  }

  const [, payload = ""] = dataUrl.split(",", 2)

  if (dataUrl.includes(";base64,")) {
    return Buffer.from(payload, "base64").byteLength
  }

  return Buffer.byteLength(decodeURIComponent(payload))
}

export async function handleGenerateConceptPreviewJob(
  supabase: SupabaseClient,
  job: WorkerJobRecord
) {
  const environment = getWorkerEnvironment()
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

  await createJobTraces(supabase, [
    {
      job_id: job.id,
      owner_id: job.owner_id,
      payload: {
        conceptCount: concepts.length,
        previewProvider: environment.PREVIEW_PROVIDER,
        referenceImageCount: referenceImages.length,
        selectedModel:
          environment.PREVIEW_PROVIDER === "runway"
            ? environment.RUNWAY_IMAGE_MODEL
            : environment.PREVIEW_PROVIDER === "local_http"
              ? environment.LOCAL_IMAGE_MODEL
              : "mock-svg"
      },
      project_id: job.project_id,
      stage: "preview_generation_requested",
      trace_type: "provider_request"
    }
  ])

  const provider = createPreviewProvider(environment)

  await deleteConceptPreviewAssetsByProjectId(supabase, job.project_id)

  const generatedPreviews = await Promise.all(
    concepts.map(async (concept) => {
      const result = await provider.generatePreview({
        angle: concept.angle,
        hook: concept.hook,
        productName: project.name,
        referenceImages,
        title: concept.title,
        visualDirection: concept.visual_direction ?? "premium studio product shot"
      })

      return {
        concept,
        result
      }
    })
  )

  const generatedAssets = generatedPreviews.map(({ concept, result }) => ({
    kind: "concept_preview" as const,
    metadata: {
      conceptId: concept.id,
      model: result.model,
      previewDataUrl: result.previewDataUrl,
      provider: result.provider,
      sizeBytes: getPreviewByteSize(result.previewDataUrl),
      providerMetadata: result.metadata ?? null,
      externalJobId: result.externalJobId ?? null,
      runwayTaskId:
        result.provider === "runway" && typeof result.externalJobId === "string"
          ? result.externalJobId
          : null,
      uploadStatus: "ready"
    },
    mime_type: result.previewDataUrl.startsWith("data:image/svg+xml")
      ? "image/svg+xml"
      : result.previewDataUrl.startsWith("data:image/png")
        ? "image/png"
        : result.previewDataUrl.startsWith("data:image/jpeg")
          ? "image/jpeg"
          : result.previewDataUrl.startsWith("data:image/webp")
            ? "image/webp"
            : "image/webp",
    owner_id: concept.owner_id,
    project_id: concept.project_id,
    storage_key: `${result.provider}-preview://${concept.project_id}/${concept.id}`
  }))

  await createJobTraces(supabase, [
    {
      job_id: job.id,
      owner_id: job.owner_id,
      payload: {
        previewCount: generatedAssets.length,
        provider: generatedPreviews[0]?.result.provider ?? environment.PREVIEW_PROVIDER,
        model:
          generatedPreviews[0]?.result.model ??
          (environment.PREVIEW_PROVIDER === "runway"
            ? environment.RUNWAY_IMAGE_MODEL
            : environment.PREVIEW_PROVIDER === "local_http"
              ? environment.LOCAL_IMAGE_MODEL
              : "mock-svg")
      },
      project_id: job.project_id,
      stage: "preview_generation_completed",
      trace_type: "provider_response"
    }
  ])

  await createConceptPreviewAssets(supabase, generatedAssets)

  await createUsageEvents(
    supabase,
    generatedPreviews.map(({ concept, result }) => ({
      estimated_cost_usd: getPreviewGenerationCost(result.provider),
      event_type: "concept_preview_generation",
      metadata: {
        conceptId: concept.id,
        model: result.model,
        provider: result.provider
      },
      owner_id: concept.owner_id,
      project_id: concept.project_id,
      provider: result.provider,
      units: 1
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
    model:
      generatedPreviews[0]?.result.model ??
      (environment.PREVIEW_PROVIDER === "runway"
        ? environment.RUNWAY_IMAGE_MODEL
        : environment.PREVIEW_PROVIDER === "local_http"
          ? environment.LOCAL_IMAGE_MODEL
          : "mock-svg"),
    previewCount: concepts.length,
    provider: generatedPreviews[0]?.result.provider ?? environment.PREVIEW_PROVIDER,
    projectId: project.id
  }
}
