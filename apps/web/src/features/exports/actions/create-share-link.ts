"use server"

import { revalidatePath } from "next/cache"
import { getPublicEnvironment } from "@/lib/env"
import { redirectToLoginWithFormError, redirectWithFormError } from "@/lib/server-action-redirect"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getExportByIdForOwner } from "@/server/exports/export-repository"
import { createShareLink } from "@/server/exports/share-link-repository"

function exportPath(exportId: string) {
  return `/dashboard/exports/${exportId}`
}

export async function createShareLinkAction(exportId: string) {
  const path = exportPath(exportId)
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  const exportRecord = await getExportByIdForOwner(exportId, user.id)

  if (!exportRecord) {
    redirectWithFormError(path, "export_not_found")
  }

  try {
    await createShareLink({
      exportId: exportRecord.id,
      ownerId: user.id,
      projectId: exportRecord.project_id
    })
  } catch {
    redirectWithFormError(path, "share_link_failed")
  }

  revalidatePath(path)
  revalidatePath(`/dashboard/projects/${exportRecord.project_id}`)
}

export async function getShareUrlForExport(exportId: string) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const exportRecord = await getExportByIdForOwner(exportId, user.id)

  if (!exportRecord) {
    throw new Error("Export not found")
  }

  const shareLink = await createShareLink({
    exportId: exportRecord.id,
    ownerId: user.id,
    projectId: exportRecord.project_id
  })

  const environment = getPublicEnvironment()

  return `${environment.NEXT_PUBLIC_APP_URL}/share/${shareLink.token}`
}
