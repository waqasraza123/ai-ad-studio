import "server-only"
import type { ExportRecord } from "@/server/database/types"
import { getRenderBatchByIdForOwner } from "@/server/render-batches/render-batch-repository"

type PromotionEligibilityResult =
  | {
      eligible: true
      batchId: string
      jobId: string
      projectId: string
    }
  | {
      eligible: false
      reason: string
    }

export async function getPromotionEligibilityForExport(input: {
  exportRecord: ExportRecord
  ownerId: string
}): Promise<PromotionEligibilityResult> {
  const batchId =
    typeof input.exportRecord.render_metadata.batchId === "string"
      ? input.exportRecord.render_metadata.batchId
      : null

  if (!batchId) {
    return {
      eligible: false,
      reason: "Only reviewed batch winners can be promoted publicly."
    }
  }

  const batch = await getRenderBatchByIdForOwner(batchId, input.ownerId)

  if (!batch) {
    return {
      eligible: false,
      reason: "The review batch for this export was not found."
    }
  }

  if (batch.status !== "ready") {
    return {
      eligible: false,
      reason: "The review batch is not ready for publishing."
    }
  }

  if (!batch.decided_at || !batch.winner_export_id) {
    return {
      eligible: false,
      reason: "Choose a winner in batch review before publishing."
    }
  }

  if (batch.winner_export_id !== input.exportRecord.id) {
    return {
      eligible: false,
      reason: "Only the current winning export can be promoted publicly."
    }
  }

  return {
    batchId: batch.id,
    eligible: true,
    jobId: batch.job_id,
    projectId: batch.project_id
  }
}
