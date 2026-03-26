import type { DeliveryReminderSupportRecord } from "./delivery-reminder-support"

export function findFocusedDeliveryReminderSupportRecord(
  records: DeliveryReminderSupportRecord[],
  notificationId: string | null
) {
  if (!notificationId) {
    return null
  }

  return records.find((record) => record.notificationId === notificationId) ?? null
}

export function resolveFocusedFollowUpFormWorkspaceId(input: {
  record: DeliveryReminderSupportRecord | null
  shouldFocusFollowUpForm: boolean
}) {
  if (!input.shouldFocusFollowUpForm) {
    return null
  }

  if (!input.record) {
    return null
  }

  if (input.record.checkpointState !== "checkpoint_mismatch") {
    return null
  }

  return input.record.workspaceId ?? null
}
