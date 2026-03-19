"use server"

import { revalidatePath } from "next/cache"
import type {
  ExportAspectRatio,
  PlatformPresetKey,
  RenderVariantKey
} from "@/server/database/types"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { listConceptsByProjectIdForOwner } from "@/server/concepts/concept-repository"
import { listConceptPreviewAssetsByProjectIdForOwner } from "@/server/projects/asset-repository"
import { getProjectInputByProjectIdForOwner } from "@/server/projects/project-input-repository"
import {
  getProjectByIdForOwner,
  updateProjectStatus
} from "@/server/projects/project-repository"
import { createRenderBatchJob } from "@/server/render-batches/render-batch-repository"

function readPlatformPreset(value: FormDataEntryValue | null): PlatformPresetKey {
  const normalized = String(value ?? "")

  if (
    normalized === "instagram_reels" ||
    normalized === "instagram_feed" ||
    normalized === "youtube_shorts" ||
    normalized === "youtube_landscape"
  ) {
    return normalized
  }

  return "default"
}

function readAspectRatios(formData: FormData): ExportAspectRatio[] {
  const values = formData.getAll("aspect_ratios").map(String)

  const normalized = values.filter(
    (value): value is ExportAspectRatio =>
      value === "9:16" || value === "1:1" || value === "16:9"
  )

  return normalized.length > 0 ? [...new Set(normalized)] : ["9:16"]
}

function readVariantKeys(formData: FormData): RenderVariantKey[] {
  const values = formData.getAll("variant_keys").map(String)

  const normalized = values.filter(
    (value): value is RenderVariantKey =>
      value === "default" ||
      value === "caption_heavy" ||
      value === "cta_heavy"
  )

  return normalized.length > 0 ? [...new Set(normalized)] : ["default", "caption_heavy", "cta_heavy"]
}

export async function startRenderBatchAction(projectId: string, formData: FormData) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const [project, projectInput, concepts, previewAssets] = await Promise.all([
    getProjectByIdForOwner(projectId, user.id),
    getProjectInputByProjectIdForOwner(projectId, user.id),
    listConceptsByProjectIdForOwner(projectId, user.id),
    listConceptPreviewAssetsByProjectIdForOwner(projectId, user.id)
  ])

  if (!project) {
    throw new Error("Project not found")
  }

  if (!project.selected_concept_id) {
    throw new Error("Select a concept before starting a variation batch")
  }

  const selectedConcept =
    concepts.find((concept) => concept.id === project.selected_concept_id) ?? null

  if (!selectedConcept) {
    throw new Error("Selected concept not found")
  }

  const previewAsset =
    previewAssets.find(
      (asset) => String(asset.metadata.conceptId ?? "") === selectedConcept.id
    ) ?? null

  if (!previewAsset) {
    throw new Error("Generate concept previews before starting a variation batch")
  }

  const platformPreset = readPlatformPreset(formData.get("platform_preset"))
  const aspectRatios = readAspectRatios(formData)
  const variantKeys = readVariantKeys(formData)

  await createRenderBatchJob({
    aspectRatios,
    callToAction: projectInput?.call_to_action ?? null,
    conceptId: selectedConcept.id,
    ownerId: user.id,
    platformPreset,
    previewAsset: previewAsset.metadata,
    projectId,
    variantKeys
  })

  await updateProjectStatus({
    ownerId: user.id,
    projectId,
    status: "rendering"
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath("/dashboard/debug/jobs")
}
