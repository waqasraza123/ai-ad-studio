"use server"

import { revalidatePath } from "next/cache"
import type {
  ExportAspectRatio,
  PlatformPresetKey,
  RenderVariantKey
} from "@/server/database/types"
import { redirectToLoginWithFormError, redirectWithFormError } from "@/lib/server-action-redirect"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getBillingGateDecision } from "@/server/billing/billing-service"
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

function projectPath(projectId: string) {
  return `/dashboard/projects/${projectId}`
}

export async function startRenderBatchAction(projectId: string, formData: FormData) {
  const path = projectPath(projectId)
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  const [project, projectInput, concepts, previewAssets] = await Promise.all([
    getProjectByIdForOwner(projectId, user.id),
    getProjectInputByProjectIdForOwner(projectId, user.id),
    listConceptsByProjectIdForOwner(projectId, user.id),
    listConceptPreviewAssetsByProjectIdForOwner(projectId, user.id)
  ])

  if (!project) {
    redirectWithFormError(path, "project_not_found")
  }

  if (!project.selected_concept_id) {
    redirectWithFormError(path, "select_concept_batch")
  }

  const selectedConcept =
    concepts.find((concept) => concept.id === project.selected_concept_id) ?? null

  if (!selectedConcept) {
    redirectWithFormError(path, "concept_not_found")
  }

  const previewAsset =
    previewAssets.find(
      (asset) => String(asset.metadata.conceptId ?? "") === selectedConcept.id
    ) ?? null

  if (!previewAsset) {
    redirectWithFormError(path, "previews_batch")
  }

  const platformPreset = readPlatformPreset(formData.get("platform_preset"))
  const aspectRatios = readAspectRatios(formData)
  const variantKeys = readVariantKeys(formData)
  const predictedExportCount = aspectRatios.length * variantKeys.length

  try {
    const billingDecision = await getBillingGateDecision(user.id, "start_render_batch", {
      finalExports: predictedExportCount,
      renderBatches: 1
    })

    if (!billingDecision.allowed) {
      redirectWithFormError(path, billingDecision.code ?? "job_failed")
    }

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
  } catch {
    redirectWithFormError(path, "job_failed")
  }

  revalidatePath(path)
  revalidatePath("/dashboard/debug/jobs")
}
