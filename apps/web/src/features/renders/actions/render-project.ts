"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getConceptByIdForOwner } from "@/server/concepts/concept-repository"
import type { RenderVariantKey } from "@/server/database/types"
import { createJob, listJobsByProjectIdForOwner } from "@/server/jobs/job-repository"
import { listConceptPreviewAssetsByProjectIdForOwner } from "@/server/projects/asset-repository"
import { getProjectInputByProjectIdForOwner } from "@/server/projects/project-input-repository"
import {
  getProjectByIdForOwner,
  updateProjectStatus
} from "@/server/projects/project-repository"

function getPreviewAssetForConcept(
  conceptId: string,
  previewAssets: {
    metadata: Record<string, unknown>
  }[]
) {
  return previewAssets.find((asset) => asset.metadata.conceptId === conceptId) ?? null
}

function readVariantKey(formData: FormData): RenderVariantKey {
  const value = String(formData.get("variantKey") ?? "default")

  if (value === "caption_heavy" || value === "cta_heavy") {
    return value
  }

  return "default"
}

export async function renderProjectAction(projectId: string, formData: FormData) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const variantKey = readVariantKey(formData)

  const [project, jobs, projectInput, previewAssets] = await Promise.all([
    getProjectByIdForOwner(projectId, user.id),
    listJobsByProjectIdForOwner(projectId, user.id),
    getProjectInputByProjectIdForOwner(projectId, user.id),
    listConceptPreviewAssetsByProjectIdForOwner(projectId, user.id)
  ])

  if (!project) {
    throw new Error("Project not found")
  }

  if (!project.selected_concept_id) {
    throw new Error("Select a concept before rendering")
  }

  const selectedConcept = await getConceptByIdForOwner(
    project.selected_concept_id,
    user.id
  )

  if (!selectedConcept) {
    throw new Error("Selected concept not found")
  }

  const selectedPreviewAsset = getPreviewAssetForConcept(
    selectedConcept.id,
    previewAssets
  )

  if (
    !selectedPreviewAsset ||
    typeof selectedPreviewAsset.metadata.previewDataUrl !== "string"
  ) {
    throw new Error("Generate previews before rendering the project")
  }

  const activeRenderJob = jobs.find(
    (job) =>
      job.type === "render_final_ad" &&
      (job.status === "queued" || job.status === "running")
  )

  if (activeRenderJob) {
    revalidatePath(`/dashboard/projects/${projectId}`)
    return
  }

  await createJob({
    ownerId: user.id,
    payload: {
      callToAction: projectInput?.call_to_action ?? null,
      conceptId: selectedConcept.id,
      initiatedBy: "web",
      previewAsset: {
        previewDataUrl: selectedPreviewAsset.metadata.previewDataUrl
      },
      stage: "final_render",
      variantKey
    },
    projectId,
    type: "render_final_ad"
  })

  await updateProjectStatus({
    ownerId: user.id,
    projectId,
    status: "rendering"
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath("/dashboard")
}
