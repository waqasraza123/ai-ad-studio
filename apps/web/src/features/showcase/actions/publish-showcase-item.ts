"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getExportByIdForOwner } from "@/server/exports/export-repository"
import { listAssetsByProjectIdForOwner } from "@/server/projects/asset-repository"
import { getProjectByIdForOwner } from "@/server/projects/project-repository"
import {
  getShowcaseItemByExportIdForOwner,
  unpublishShowcaseItem,
  upsertShowcaseItem
} from "@/server/showcase/showcase-repository"

function buildDefaultSummary(input: {
  aspectRatio: string
  platformPreset: string
  templateName: string | null
}) {
  const templatePart = input.templateName
    ? ` using the ${input.templateName} template`
    : ""

  return `Generated ${input.aspectRatio} export for ${input.platformPreset}${templatePart}.`
}

export async function publishShowcaseItemAction(
  exportId: string,
  formData: FormData
): Promise<void> {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const exportRecord = await getExportByIdForOwner(exportId, user.id)

  if (!exportRecord) {
    throw new Error("Export not found")
  }

  const project = await getProjectByIdForOwner(exportRecord.project_id, user.id)

  if (!project) {
    throw new Error("Project not found")
  }

  const assets = await listAssetsByProjectIdForOwner(exportRecord.project_id, user.id)
  const exportAsset =
    exportRecord.asset_id
      ? assets.find((asset) => asset.id === exportRecord.asset_id) ?? null
      : null

  const previewDataUrl =
    exportAsset && typeof exportAsset.metadata.previewDataUrl === "string"
      ? exportAsset.metadata.previewDataUrl
      : null

  const templateName =
    typeof exportRecord.render_metadata.templateName === "string"
      ? exportRecord.render_metadata.templateName
      : null

  const summaryValue = String(formData.get("summary") ?? "").trim()

  await upsertShowcaseItem({
    exportRecord,
    ownerId: user.id,
    previewDataUrl,
    projectName: project.name,
    summary:
      summaryValue ||
      buildDefaultSummary({
        aspectRatio: exportRecord.aspect_ratio,
        platformPreset: exportRecord.platform_preset,
        templateName
      })
  })

  revalidatePath("/dashboard/showcase")
  revalidatePath(`/dashboard/exports/${exportId}`)
  revalidatePath("/showcase")
}

export async function unpublishShowcaseItemAction(
  exportId: string
): Promise<void> {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const item = await getShowcaseItemByExportIdForOwner(exportId, user.id)

  if (!item) {
    throw new Error("Showcase item not found")
  }

  await unpublishShowcaseItem({
    ownerId: user.id,
    showcaseItemId: item.id
  })

  revalidatePath("/dashboard/showcase")
  revalidatePath(`/dashboard/exports/${exportId}`)
  revalidatePath("/showcase")
}
