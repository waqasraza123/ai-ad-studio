import type { DeliveryWorkspaceEventRecord } from "@/server/database/types"

export type DeliveryWorkspaceActivitySummary = {
  acknowledgedAt: string | null
  acknowledgedBy: string | null
  acknowledgementNote: string | null
  deliveredAt: string | null
  downloadCount: number
  lastDownloadedAt: string | null
  lastViewedAt: string | null
}

function readEventNote(event: DeliveryWorkspaceEventRecord) {
  const value = event.metadata.note

  return typeof value === "string" && value.trim().length > 0 ? value : null
}

export function summarizeDeliveryWorkspaceActivity(
  events: DeliveryWorkspaceEventRecord[]
): DeliveryWorkspaceActivitySummary {
  let deliveredAt: string | null = null
  let lastViewedAt: string | null = null
  let lastDownloadedAt: string | null = null
  let downloadCount = 0
  let acknowledgedAt: string | null = null
  let acknowledgedBy: string | null = null
  let acknowledgementNote: string | null = null

  for (const event of events) {
    if (event.event_type === "delivered") {
      if (!deliveredAt || event.created_at < deliveredAt) {
        deliveredAt = event.created_at
      }
      continue
    }

    if (event.event_type === "viewed") {
      if (!lastViewedAt || event.created_at > lastViewedAt) {
        lastViewedAt = event.created_at
      }
      continue
    }

    if (event.event_type === "downloaded") {
      downloadCount += 1
      if (!lastDownloadedAt || event.created_at > lastDownloadedAt) {
        lastDownloadedAt = event.created_at
      }
      continue
    }

    if (event.event_type === "acknowledged") {
      if (!acknowledgedAt || event.created_at > acknowledgedAt) {
        acknowledgedAt = event.created_at
        acknowledgedBy = event.actor_label
        acknowledgementNote = readEventNote(event)
      }
    }
  }

  return {
    acknowledgedAt,
    acknowledgedBy,
    acknowledgementNote,
    deliveredAt,
    downloadCount,
    lastDownloadedAt,
    lastViewedAt
  }
}
