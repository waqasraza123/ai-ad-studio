import type { ExportRecord } from "@/server/database/types"
import type { AppMessageKey } from "@/lib/i18n/messages/en"

export type ExportWorkflowStatus = ExportRecord["status"]

export function exportStatusIsInProgress(status: ExportWorkflowStatus) {
  return status === "queued" || status === "rendering"
}

export function getExportStatusLabelKey(
  status: ExportWorkflowStatus
): AppMessageKey {
  switch (status) {
    case "queued":
      return "exports.status.queued"
    case "rendering":
      return "exports.status.rendering"
    case "ready":
      return "exports.status.ready"
    case "failed":
      return "exports.status.failed"
    default:
      return "exports.status.ready"
  }
}
