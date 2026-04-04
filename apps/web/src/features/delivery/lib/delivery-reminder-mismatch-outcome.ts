export const deliveryReminderMismatchActionQueryParam =
  "reminder_mismatch_action"
export const deliveryReminderMismatchStatusQueryParam =
  "reminder_mismatch_status"
export const deliveryReminderMismatchWorkspaceIdQueryParam =
  "reminder_mismatch_workspace_id"
export const deliveryReminderMismatchNotificationIdQueryParam =
  "reminder_mismatch_notification_id"
export const deliveryReminderMismatchErrorCodeQueryParam =
  "reminder_mismatch_error_code"

export type DeliveryReminderMismatchLifecycleAction =
  | "reopened"
  | "resolved"

export type DeliveryReminderMismatchLifecycleStatus = "error" | "success"

export type DeliveryReminderMismatchLifecycleErrorCode =
  | "not_currently_resolved"
  | "reopen_note_too_long"
  | "resolution_note_too_long"

export type DeliveryReminderMismatchLifecycleOutcome = {
  action: DeliveryReminderMismatchLifecycleAction
  errorCode: DeliveryReminderMismatchLifecycleErrorCode | null
  notificationId: string | null
  status: DeliveryReminderMismatchLifecycleStatus
  workspaceId: string
}

function normalizeNonEmptyString(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null
  }

  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : null
}

function normalizeAction(
  value: string | null | undefined
): DeliveryReminderMismatchLifecycleAction | null {
  if (value === "resolved" || value === "reopened") {
    return value
  }

  return null
}

function normalizeStatus(
  value: string | null | undefined
): DeliveryReminderMismatchLifecycleStatus | null {
  if (value === "success" || value === "error") {
    return value
  }

  return null
}

function normalizeErrorCode(
  value: string | null | undefined
): DeliveryReminderMismatchLifecycleErrorCode | null {
  if (
    value === "resolution_note_too_long" ||
    value === "reopen_note_too_long" ||
    value === "not_currently_resolved"
  ) {
    return value
  }

  return null
}

export function buildDeliveryReminderMismatchOutcomeHref(input: {
  action: DeliveryReminderMismatchLifecycleAction
  baseHref: string
  errorCode?: DeliveryReminderMismatchLifecycleErrorCode | null
  notificationId: string | null
  status: DeliveryReminderMismatchLifecycleStatus
  workspaceId: string
}) {
  const url = new URL(input.baseHref, "http://localhost")

  url.searchParams.set(deliveryReminderMismatchActionQueryParam, input.action)
  url.searchParams.set(deliveryReminderMismatchStatusQueryParam, input.status)
  url.searchParams.set(
    deliveryReminderMismatchWorkspaceIdQueryParam,
    input.workspaceId
  )

  if (input.notificationId) {
    url.searchParams.set(
      deliveryReminderMismatchNotificationIdQueryParam,
      input.notificationId
    )
  } else {
    url.searchParams.delete(deliveryReminderMismatchNotificationIdQueryParam)
  }

  if (input.errorCode) {
    url.searchParams.set(
      deliveryReminderMismatchErrorCodeQueryParam,
      input.errorCode
    )
  } else {
    url.searchParams.delete(deliveryReminderMismatchErrorCodeQueryParam)
  }

  return `${url.pathname}${url.search}${url.hash}`
}

export function normalizeDeliveryReminderMismatchLifecycleOutcome(input: {
  action: string | null | undefined
  errorCode?: string | null | undefined
  notificationId: string | null | undefined
  status: string | null | undefined
  workspaceId: string | null | undefined
}): DeliveryReminderMismatchLifecycleOutcome | null {
  const action = normalizeAction(input.action)
  const status = normalizeStatus(input.status)
  const workspaceId = normalizeNonEmptyString(input.workspaceId)

  if (!action || !status || !workspaceId) {
    return null
  }

  return {
    action,
    errorCode: normalizeErrorCode(input.errorCode),
    notificationId: normalizeNonEmptyString(input.notificationId),
    status,
    workspaceId
  }
}

export function getDeliveryReminderMismatchLifecycleMessage(
  outcome: DeliveryReminderMismatchLifecycleOutcome
) {
  if (outcome.status === "success") {
    return outcome.action === "resolved"
      ? `Marked reminder mismatch as resolved for workspace ${outcome.workspaceId}.`
      : `Reopened resolved reminder mismatch for workspace ${outcome.workspaceId}.`
  }

  if (outcome.errorCode === "resolution_note_too_long") {
    return "Mismatch resolution note must be 500 characters or fewer."
  }

  if (outcome.errorCode === "reopen_note_too_long") {
    return "Mismatch reopen note must be 500 characters or fewer."
  }

  if (outcome.errorCode === "not_currently_resolved") {
    return "This reminder mismatch is no longer currently resolved for the selected notification."
  }

  return outcome.action === "resolved"
    ? `Could not mark reminder mismatch as resolved for workspace ${outcome.workspaceId}.`
    : `Could not reopen resolved reminder mismatch for workspace ${outcome.workspaceId}.`
}
