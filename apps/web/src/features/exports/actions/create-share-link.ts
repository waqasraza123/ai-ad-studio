"use server"

import { revalidatePath } from "next/cache"
import { getPublicEnvironment } from "@/lib/env"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getExportByIdForOwner } from "@/server/exports/export-repository"
import { createShareLink } from "@/server/exports/share-link-repository"

export async function createShareLinkAction(exportId: string) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const exportRecord = await getExportByIdForOwner(exportId, user.id)

  if (!exportRecord) {
    throw new Error("Export not found")
  }

  await createShareLink({
    exportId: exportRecord.id,
    ownerId: user.id,
    projectId: exportRecord.project_id
  })

  revalidatePath(`/dashboard/exports/${exportId}`)
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
