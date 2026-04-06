"use server"

import { revalidatePath } from "next/cache"
import { hasR2StorageConfiguration } from "@/lib/env"
import { hasDisallowedWordingIssue, MODEST_WORDING_FORM_ERROR_CODE } from "@/lib/modest-wording"
import {
  redirectToLoginWithFormError,
  redirectWithFormError
} from "@/lib/server-action-redirect"
import { uploadProjectAssetToR2 } from "@/server/storage/upload-service"
import { createAssetPlaceholderSchema } from "@/features/projects/schemas/project-schema"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { createUploadedAssetRecord } from "@/server/projects/asset-repository"
import { getProjectByIdForOwner } from "@/server/projects/project-repository"

export async function createAssetPlaceholderAction(
  projectId: string,
  formData: FormData
) {
  const projectPath = `/dashboard/projects/${projectId}`
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  if (!hasR2StorageConfiguration()) {
    redirectWithFormError(projectPath, "r2_unconfigured")
  }

  const project = await getProjectByIdForOwner(projectId, user.id)

  if (!project) {
    redirectWithFormError(projectPath, "project_not_found")
  }

  const file = formData.get("file")
  const kindValue = String(formData.get("kind") ?? "product_image")

  if (!(file instanceof File) || file.size === 0) {
    redirectWithFormError(projectPath, "asset_no_file")
  }

  const parsed = createAssetPlaceholderSchema.safeParse({
    fileName: file.name,
    kind: kindValue,
    mimeType: file.type || "application/octet-stream",
    projectId,
    sizeBytes: file.size
  })

  if (!parsed.success) {
    redirectWithFormError(
      projectPath,
      hasDisallowedWordingIssue(parsed.error)
        ? MODEST_WORDING_FORM_ERROR_CODE
        : "asset_invalid"
    )
  }

  const assetPayload = parsed.data

  try {
    const uploadedAsset = await uploadProjectAssetToR2({
      file,
      ownerId: user.id,
      projectId
    })

    await createUploadedAssetRecord({
      kind: assetPayload.kind,
      metadata: assetPayload,
      ownerId: user.id,
      storageKey: uploadedAsset.storageKey
    })
  } catch {
    redirectWithFormError(projectPath, "r2_upload_failed")
  }

  revalidatePath(projectPath)
}
