import type { DeliveryWorkspaceActivitySummary } from "@/features/delivery/lib/delivery-activity"
import type { DeliveryFollowUpStatus } from "@/server/database/types"

export function normalizeDeliveryWorkspaceFollowUpStatus(
  value: string | null | undefined
): DeliveryFollowUpStatus {
  if (
    value === "needs_follow_up" ||
    value === "reminder_scheduled" ||
    value === "waiting_on_client" ||
    value === "resolved"
  ) {
    return value
  }

  return "none"
}

export function getDeliveryWorkspaceFollowUpLabel(
  status: DeliveryFollowUpStatus
) {
  if (status === "needs_follow_up") {
    return "Needs follow-up"
  }

  if (status === "reminder_scheduled") {
    return "Reminder scheduled"
  }

  if (status === "waiting_on_client") {
    return "Waiting on client"
  }

  if (status === "resolved") {
    return "Resolved"
  }

  return "No owner follow-up"
}

export function getDeliveryWorkspaceFollowUpClasses(
  status: DeliveryFollowUpStatus
) {
  if (status === "needs_follow_up") {
    return "border-amber-400/20 bg-amber-500/10 text-amber-100"
  }

  if (status === "reminder_scheduled") {
    return "border-indigo-400/20 bg-indigo-500/10 text-indigo-100"
  }

  if (status === "waiting_on_client") {
    return "border-sky-400/20 bg-sky-500/10 text-sky-100"
  }

  if (status === "resolved") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
  }

  return "border-white/10 bg-white/[0.05] text-slate-300"
}

export function hasDeliveryWorkspaceRecipientActivity(
  activitySummary: DeliveryWorkspaceActivitySummary
) {
  return Boolean(activitySummary.lastViewedAt) || activitySummary.downloadCount > 0
}

export function resolveEffectiveDeliveryWorkspaceFollowUpStatus(input: {
  activitySummary: DeliveryWorkspaceActivitySummary
  workspaceFollowUpStatus: DeliveryFollowUpStatus
}): DeliveryFollowUpStatus {
  if (input.workspaceFollowUpStatus !== "none") {
    return input.workspaceFollowUpStatus
  }

  if (
    hasDeliveryWorkspaceRecipientActivity(input.activitySummary) &&
    !input.activitySummary.acknowledgedAt
  ) {
    return "needs_follow_up"
  }

  return "none"
}

export function isDeliveryWorkspaceFollowUpUnresolved(
  status: DeliveryFollowUpStatus
) {
  return (
    status === "needs_follow_up" ||
    status === "reminder_scheduled" ||
    status === "waiting_on_client"
  )
}
