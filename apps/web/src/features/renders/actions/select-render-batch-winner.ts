"use server"

import { revalidatePath } from "next/cache"
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

export async function selectRenderBatchWinnerAction(
  batchId: string,
  exportId: string,
  formData: FormData
) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const batch = await getRenderBatchByIdForOwner(batchId, user.id)

  if (!batch) {
    throw new Error("Render batch not found")
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
    throw new Error("Winning export does not belong to this render batch")
  }

  await selectRenderBatchWinner({
    batchId,
    ownerId: user.id,
    reviewNote: readReviewNote(formData),
    winnerExportId: exportId
  })

  revalidatePath(`/dashboard/render-batches/${batchId}`)
  revalidatePath(`/dashboard/projects/${batch.project_id}`)
  revalidatePath(`/dashboard/exports/${exportId}`)
  revalidatePath("/dashboard/notifications")
}
