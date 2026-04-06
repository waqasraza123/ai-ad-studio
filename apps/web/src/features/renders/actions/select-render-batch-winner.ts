"use server"

import { revalidatePath } from "next/cache"
import { MODEST_WORDING_FORM_ERROR_CODE, validateModestText } from "@/lib/modest-wording/index"
import { redirectToLoginWithFormError, redirectWithFormError } from "@/lib/server-action-redirect"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { listExportsByProjectIdForOwner } from "@/server/exports/export-repository"
import {
  getRenderBatchByIdForOwner,
  listExportsForRenderBatch,
  selectRenderBatchWinner
} from "@/server/render-batches/render-batch-repository"

function readReviewNote(formData: FormData) {
  const value = String(formData.get("review_note") ?? "").trim()
  return value.length > 0 ? value : null
}

function batchPath(batchId: string) {
  return `/dashboard/render-batches/${batchId}`
}

export async function selectRenderBatchWinnerAction(
  batchId: string,
  exportId: string,
  formData: FormData
) {
  const path = batchPath(batchId)
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  const batch = await getRenderBatchByIdForOwner(batchId, user.id)

  if (!batch) {
    redirectWithFormError(path, "batch_not_found")
  }

  const projectExports = await listExportsByProjectIdForOwner(
    batch.project_id,
    user.id
  )

  const batchExports = await listExportsForRenderBatch({
    batchId,
    exports: projectExports
  })

  const winningExport = batchExports.find(
    (exportRecord) => exportRecord.id === exportId
  )

  if (!winningExport) {
    redirectWithFormError(path, "winner_export_invalid")
  }

  const reviewNote = readReviewNote(formData)

  if (validateModestText(reviewNote)) {
    redirectWithFormError(path, MODEST_WORDING_FORM_ERROR_CODE)
  }

  try {
    await selectRenderBatchWinner({
      batchId,
      ownerId: user.id,
      reviewNote,
      winnerExportId: exportId
    })
  } catch {
    redirectWithFormError(path, "server_error")
  }

  revalidatePath(path)
  revalidatePath(`/dashboard/projects/${batch.project_id}`)
  revalidatePath(`/dashboard/exports/${exportId}`)
  revalidatePath("/dashboard/notifications")
}
