import type {
  DeliveryApprovalSummary,
  ExportRecord
} from "@/server/database/types"

type DeliveryApprovalSummaryInput = {
  batchFinalizationNote: string | null
  batchReviewLinks: Array<{
    response_status: string
    status: string
  }>
  batchReviewNote: string | null
  decidedAt: string | null
  finalizedAt: string | null
}

type DeliveryWorkspaceExportsInput = {
  batchExports: ExportRecord[]
  canonicalExport: ExportRecord
  selectedExportIds: string[]
}

export function buildDeliveryApprovalSummary(
  input: DeliveryApprovalSummaryInput
): DeliveryApprovalSummary {
  const approvedCount = input.batchReviewLinks.filter(
    (link) => link.response_status === "approved"
  ).length
  const rejectedCount = input.batchReviewLinks.filter(
    (link) => link.response_status === "rejected"
  ).length
  const pendingCount = input.batchReviewLinks.filter(
    (link) => link.response_status === "pending" && link.status === "active"
  ).length

  return {
    approved_count: approvedCount,
    decided_at: input.decidedAt,
    finalization_note: input.batchFinalizationNote,
    finalized_at: input.finalizedAt,
    pending_count: pendingCount,
    rejected_count: rejectedCount,
    responded_count: approvedCount + rejectedCount,
    review_note: input.batchReviewNote
  }
}

export function resolveDeliveryWorkspaceExports(
  input: DeliveryWorkspaceExportsInput
) {
  const exportsById = new Map(
    input.batchExports.map((exportRecord) => [exportRecord.id, exportRecord] as const)
  )
  const resolvedExports: ExportRecord[] = [input.canonicalExport]
  const includedExportIds = new Set([input.canonicalExport.id])

  for (const selectedExportId of input.selectedExportIds) {
    const exportRecord = exportsById.get(selectedExportId)

    if (!exportRecord || includedExportIds.has(exportRecord.id)) {
      continue
    }

    includedExportIds.add(exportRecord.id)
    resolvedExports.push(exportRecord)
  }

  return resolvedExports
}
