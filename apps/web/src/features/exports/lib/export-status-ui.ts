import type { ExportRecord } from "@/server/database/types"

export type ExportWorkflowStatus = ExportRecord["status"]

export function exportStatusIsInProgress(status: ExportWorkflowStatus) {
  return status === "queued" || status === "rendering"
}

export function formatExportStatusLabel(status: ExportWorkflowStatus) {
  switch (status) {
    case "queued":
      return "Queued — waiting for the render worker"
    case "rendering":
      return "Rendering — composing your ad"
    case "ready":
      return "Ready — export complete"
    case "failed":
      return "Failed — check jobs or retry"
    default:
      return status
  }
}
