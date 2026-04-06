import type { DeliveryReminderRepairAction } from "./delivery-reminder-repair"
import type { DeliveryReminderSupportRecord } from "./delivery-reminder-support"
import { MODEST_WORDING_ERROR_MESSAGE } from "../../../lib/modest-wording/index"
import {
  deliveryReminderClearReasonMaxLength,
  type DeliveryReminderClearReasonValidationError
} from "./delivery-reminder-repair-reason"
import {
  deliveryReminderSupportHandoffNoteMaxLength,
  type DeliveryReminderSupportNoteValidationError
} from "./delivery-reminder-support-note"

export const deliveryReminderRepairActionQueryParam = "reminder_repair_action"
export const deliveryReminderRepairNotificationIdQueryParam =
  "reminder_repair_notification_id"
export const deliveryReminderRepairStatusQueryParam = "reminder_repair_status"
export const deliveryReminderRepairWorkspaceIdQueryParam =
  "reminder_repair_workspace_id"
export const deliveryReminderRepairErrorCodeQueryParam =
  "reminder_repair_error_code"
export const deliveryReminderRepairNoteSavedQueryParam =
  "reminder_repair_note_saved"

export type DeliveryReminderRepairStatus = "error" | "success"

export type DeliveryReminderRepairErrorCode =
  | DeliveryReminderClearReasonValidationError
  | DeliveryReminderSupportNoteValidationError

export type DeliveryReminderRepairOutcome = {
  action: DeliveryReminderRepairAction
  errorCode: DeliveryReminderRepairErrorCode | null
  noteSaved: boolean
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

function normalizeDeliveryReminderRepairErrorCode(
  value: string | null | undefined
): DeliveryReminderRepairErrorCode | null {
  if (
    value === "reason_required" ||
    value === "reason_too_long" ||
    value === "disallowed_wording" ||
    value === "handoff_note_too_long"
  ) {
    return value
  }

  return null
}

function normalizeNoteSaved(value: string | null | undefined) {
  if (typeof value !== "string") {
    return false
  }

  const normalizedValue = value.trim().toLowerCase()

  return normalizedValue === "1" || normalizedValue === "true"
}

export function buildDeliveryReminderRepairResultHref(input: {
  action: DeliveryReminderRepairAction
  baseHref: string
  errorCode?: DeliveryReminderRepairErrorCode | null
  noteSaved?: boolean
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

  if (input.errorCode) {
    url.searchParams.set(
      deliveryReminderRepairErrorCodeQueryParam,
      input.errorCode
    )
  } else {
    url.searchParams.delete(deliveryReminderRepairErrorCodeQueryParam)
  }

  if (input.noteSaved) {
    url.searchParams.set(deliveryReminderRepairNoteSavedQueryParam, "1")
  } else {
    url.searchParams.delete(deliveryReminderRepairNoteSavedQueryParam)
  }

  return `${url.pathname}${url.search}${url.hash}`
}

export function normalizeDeliveryReminderRepairOutcome(input: {
  action: string | null | undefined
  errorCode?: string | null | undefined
  noteSaved?: string | null | undefined
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
    errorCode: normalizeDeliveryReminderRepairErrorCode(input.errorCode),
    noteSaved: normalizeNoteSaved(input.noteSaved),
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

export function getDeliveryReminderRepairOutcomeMessage(
  outcome: DeliveryReminderRepairOutcome
) {
  if (outcome.status === "success") {
    const baseMessage = `${getDeliveryReminderRepairActionLabel(
      outcome.action
    )} for workspace ${outcome.workspaceId}.`

    return outcome.noteSaved
      ? `${baseMessage} Support handoff note saved to the activity timeline.`
      : baseMessage
  }

  if (outcome.errorCode === "reason_required") {
    return "Clear reminder scheduling requires an explicit operator reason."
  }

  if (outcome.errorCode === "reason_too_long") {
    return `Clear reason must be ${deliveryReminderClearReasonMaxLength} characters or fewer.`
  }

  if (outcome.errorCode === "handoff_note_too_long") {
    return `Support handoff note must be ${deliveryReminderSupportHandoffNoteMaxLength} characters or fewer.`
  }

  if (outcome.errorCode === "disallowed_wording") {
    return MODEST_WORDING_ERROR_MESSAGE
  }

  return `Could not complete ${getDeliveryReminderRepairActionLabel(
    outcome.action
  ).toLowerCase()} for workspace ${outcome.workspaceId}.`
}
