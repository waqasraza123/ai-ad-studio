import {
  getDeliveryReminderMismatchReopenActivityBadgeClasses,
  getDeliveryReminderMismatchReopenActivityBadgeLabel,
  getDeliveryReminderMismatchReopenActivityDescription,
  getDeliveryReminderMismatchReopenActivityTitle,
  isDeliveryReminderMismatchReopenActivityMetadata
} from "./delivery-reminder-mismatch-reopen"
import {
  getDeliveryReminderRepairActivityBadgeClasses,
  getDeliveryReminderRepairActivityBadgeLabel,
  getDeliveryReminderRepairActivityDescription,
  getDeliveryReminderRepairActivityTitle,
  isDeliveryReminderRepairActivityMetadata
} from "./delivery-reminder-repair-activity"
import {
  getDeliveryReminderSupportNoteActivityBadgeClasses,
  getDeliveryReminderSupportNoteActivityBadgeLabel,
  getDeliveryReminderSupportNoteActivityDescription,
  getDeliveryReminderSupportNoteActivityTitle,
  isDeliveryReminderSupportNoteActivityMetadata
} from "./delivery-reminder-support-note"
import {
  getDeliveryReminderMismatchResolutionActivityBadgeClasses,
  getDeliveryReminderMismatchResolutionActivityBadgeLabel,
  getDeliveryReminderMismatchResolutionActivityDescription,
  getDeliveryReminderMismatchResolutionActivityTitle,
  isDeliveryReminderMismatchResolutionActivityMetadata
} from "./delivery-reminder-mismatch-resolution"
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


export function resolveDeliveryWorkspaceEventPresentation(
  event: DeliveryWorkspaceEventRecord
) {
  if (isDeliveryReminderRepairActivityMetadata(event.metadata)) {
    return {
      badgeClassName: getDeliveryReminderRepairActivityBadgeClasses(
        event.metadata
      ),
      badgeLabel: getDeliveryReminderRepairActivityBadgeLabel(event.metadata),
      description: getDeliveryReminderRepairActivityDescription(event.metadata),
      title: getDeliveryReminderRepairActivityTitle(event.metadata)
    }
  }

  if (isDeliveryReminderMismatchResolutionActivityMetadata(event.metadata)) {
    return {
      badgeClassName: getDeliveryReminderMismatchResolutionActivityBadgeClasses(),
      badgeLabel: getDeliveryReminderMismatchResolutionActivityBadgeLabel(),
      description: getDeliveryReminderMismatchResolutionActivityDescription(
        event.metadata
      ),
      title: getDeliveryReminderMismatchResolutionActivityTitle()
    }
  }

  if (isDeliveryReminderSupportNoteActivityMetadata(event.metadata)) {
    return {
      badgeClassName: getDeliveryReminderSupportNoteActivityBadgeClasses(),
      badgeLabel: getDeliveryReminderSupportNoteActivityBadgeLabel(),
      description: getDeliveryReminderSupportNoteActivityDescription(
        event.metadata
      ),
      title: getDeliveryReminderSupportNoteActivityTitle(event.metadata)
    }
  }

  if (event.event_type === "acknowledged") {
    return {
      badgeClassName: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
      badgeLabel: "Acknowledged",
      description:
        typeof event.metadata.note === "string" && event.metadata.note.length > 0
          ? event.metadata.note
          : "Recipient acknowledged the delivery workspace.",
      title: "Delivery acknowledged"
    }
  }

  if (event.event_type === "downloaded") {
    return {
      badgeClassName: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
      badgeLabel: "Downloaded",
      description: "Recipient downloaded delivery assets.",
      title: "Delivery assets downloaded"
    }
  }

  if (event.event_type === "viewed") {
    return {
      badgeClassName: "border-indigo-400/30 bg-indigo-500/10 text-indigo-200",
      badgeLabel: "Viewed",
      description: "Recipient viewed the delivery workspace.",
      title: "Delivery workspace viewed"
    }
  }

  if (event.event_type === "delivered") {
    return {
      badgeClassName: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
      badgeLabel: "Delivered",
      description: "Delivery workspace became available to the recipient.",
      title: "Delivery sent"
    }
  }

  return {
    badgeClassName: "border-white/10 bg-white/[0.05] text-slate-300",
    badgeLabel: "Activity",
    description: "Delivery workspace activity recorded.",
    title: "Delivery activity"
  }
}
