export type DeliveryReminderNotificationBucket = "due_today" | "overdue"

export function shouldGenerateDeliveryReminderNotification(input: {
  followUpLastNotificationBucket: string | null
  followUpLastNotificationDate: string | null
  reminderBucket: DeliveryReminderNotificationBucket
  todayDateKey: string
}) {
  return (
    input.followUpLastNotificationBucket !== input.reminderBucket ||
    input.followUpLastNotificationDate !== input.todayDateKey
  )
}

export function buildDeliveryReminderNotificationKind(
  reminderBucket: DeliveryReminderNotificationBucket
) {
  return reminderBucket === "overdue"
    ? "delivery_follow_up_overdue"
    : "delivery_follow_up_due_today"
}

export function buildDeliveryReminderNotificationTitle(
  reminderBucket: DeliveryReminderNotificationBucket
) {
  return reminderBucket === "overdue"
    ? "Delivery follow-up overdue"
    : "Delivery follow-up due today"
}

export function buildDeliveryReminderNotificationBody(input: {
  followUpDueOn: string
  followUpNote: string | null
  reminderBucket: DeliveryReminderNotificationBucket
  workspaceTitle: string
}) {
  const prefix =
    input.reminderBucket === "overdue"
      ? `Delivery follow-up is overdue for ${input.workspaceTitle}.`
      : `Delivery follow-up is due today for ${input.workspaceTitle}.`

  const dueDateText = `Scheduled date: ${input.followUpDueOn}.`
  const trimmedNote = input.followUpNote?.trim()

  if (!trimmedNote) {
    return `${prefix} ${dueDateText}`
  }

  return `${prefix} ${dueDateText} ${trimmedNote}`
}
