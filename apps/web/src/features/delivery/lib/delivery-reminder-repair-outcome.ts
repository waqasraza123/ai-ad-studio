import type { DeliveryReminderRepairAction } from "./delivery-reminder-repair"
import type { DeliveryReminderSupportRecord } from "./delivery-reminder-support"

export const deliveryReminderRepairActionQueryParam = "reminder_repair_action"
export const deliveryReminderRepairNotificationIdQueryParam =
  "reminder_repair_notification_id"
export const deliveryReminderRepairStatusQueryParam = "reminder_repair_status"
export const deliveryReminderRepairWorkspaceIdQueryParam =
  "reminder_repair_workspace_id"

export type DeliveryReminderRepairStatus = "error" | "success"

export type DeliveryReminderRepairOutcome = {
  action: DeliveryReminderRepairAction
  notificationId: string | null
  status: DeliveryReminderRepairStatus
  workspaceId: string
}

function normalizeNonEmptyString(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null
  }

  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : null
}

function normalizeDeliveryReminderRepairStatus(
  value: string | null | undefined
): DeliveryReminderRepairStatus | null {
  if (value === "success" || value === "error") {
    return value
  }

  return null
}

function normalizeDeliveryReminderRepairAction(
  value: string | null | undefined
): DeliveryReminderRepairAction | null {
  if (value === "reschedule_tomorrow") {
    return value
  }

  if (value === "clear_reminder_scheduling") {
    return value
  }

  return null
}

export function buildDeliveryReminderRepairResultHref(input: {
  action: DeliveryReminderRepairAction
  baseHref: string
  notificationId: string | null
  status: DeliveryReminderRepairStatus
  workspaceId: string
}) {
  const url = new URL(input.baseHref, "http://localhost")

  url.searchParams.set(deliveryReminderRepairActionQueryParam, input.action)
  url.searchParams.set(deliveryReminderRepairStatusQueryParam, input.status)
  url.searchParams.set(
    deliveryReminderRepairWorkspaceIdQueryParam,
    input.workspaceId
  )

  if (input.notificationId) {
    url.searchParams.set(
      deliveryReminderRepairNotificationIdQueryParam,
      input.notificationId
    )
  } else {
    url.searchParams.delete(deliveryReminderRepairNotificationIdQueryParam)
  }

  return `${url.pathname}${url.search}${url.hash}`
}

export function normalizeDeliveryReminderRepairOutcome(input: {
  action: string | null | undefined
  notificationId: string | null | undefined
  status: string | null | undefined
  workspaceId: string | null | undefined
}): DeliveryReminderRepairOutcome | null {
  const action = normalizeDeliveryReminderRepairAction(input.action)
  const status = normalizeDeliveryReminderRepairStatus(input.status)
  const workspaceId = normalizeNonEmptyString(input.workspaceId)

  if (!action || !status || !workspaceId) {
    return null
  }

  return {
    action,
    notificationId: normalizeNonEmptyString(input.notificationId),
    status,
    workspaceId
  }
}

export function doesDeliveryReminderRepairOutcomeMatchRecord(input: {
  outcome: DeliveryReminderRepairOutcome | null
  record: DeliveryReminderSupportRecord
}) {
  if (!input.outcome) {
    return false
  }

  if (!input.record.workspaceId) {
    return false
  }

  return (
    input.outcome.workspaceId === input.record.workspaceId &&
    input.outcome.notificationId === input.record.notificationId
  )
}

export function getDeliveryReminderRepairActionLabel(
  action: DeliveryReminderRepairAction
) {
  if (action === "reschedule_tomorrow") {
    return "Rescheduled for tomorrow"
  }

  return "Cleared reminder scheduling"
}
