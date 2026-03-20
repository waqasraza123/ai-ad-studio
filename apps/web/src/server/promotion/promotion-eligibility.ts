import "server-only"
import type { ExportRecord } from "@/server/database/types"
import { getProjectByIdForOwner } from "@/server/projects/project-repository"
import { getRenderBatchByIdForOwner } from "@/server/render-batches/render-batch-repository"
import {
  evaluatePromotionEligibility,
  type PromotionEligibilityResult
} from "./promotion-eligibility-rules"

export async function getPromotionEligibilityForExport(input: {
  exportRecord: ExportRecord
  ownerId: string
}): Promise<PromotionEligibilityResult> {
  const batchId =
    typeof input.exportRecord.render_metadata.batchId === "string"
      ? input.exportRecord.render_metadata.batchId
      : null

  const [batch, project] = await Promise.all([
    batchId
      ? getRenderBatchByIdForOwner(batchId, input.ownerId)
      : Promise.resolve(null),
    getProjectByIdForOwner(input.exportRecord.project_id, input.ownerId)
  ])

  return evaluatePromotionEligibility({
    batchFinalizedAt: batch?.finalized_at ?? null,
    batchFinalizedExportId: batch?.finalized_export_id ?? null,
    batchId,
    batchIsFinalized: batch?.is_finalized ?? false,
    batchJobId: batch?.job_id ?? null,
    batchProjectId: batch?.project_id ?? null,
    exportId: input.exportRecord.id,
    exportProjectId: input.exportRecord.project_id,
    projectCanonicalExportId: project?.canonical_export_id ?? null,
    projectId: project?.id ?? null
  })
}
