export const deliveryReminderMismatchReopenNoteFieldName =
  "reminderMismatchReopenNote"

export const deliveryReminderMismatchReopenNoteMaxLength = 500

export type DeliveryReminderMismatchReopenActivityMetadata = {
  reminderBucket: "due_today" | "overdue" | null
  reminderNotificationId: string
  reopenNote: string | null
  source: "reminder_mismatch_reopened"
}

export function normalizeDeliveryReminderMismatchReopenNote(
  value: FormDataEntryValue | null | undefined
) {
  if (typeof value !== "string") {
    return null
  }

  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : null
}

export function validateDeliveryReminderMismatchReopenNote(
  value: string | null
) {
  if (!value) {
    return null
  }

  if (value.length > deliveryReminderMismatchReopenNoteMaxLength) {
    return "reopen_note_too_long" as const
  }

  return null
}

export function buildDeliveryReminderMismatchReopenActivityMetadata(input: {
  reminderBucket: "due_today" | "overdue" | null
  reminderNotificationId: string
  reopenNote: string | null
}): DeliveryReminderMismatchReopenActivityMetadata {
  return {
    reminderBucket: input.reminderBucket,
    reminderNotificationId: input.reminderNotificationId,
    reopenNote: input.reopenNote,
    source: "reminder_mismatch_reopened"
  }
}

export function isDeliveryReminderMismatchReopenActivityMetadata(
  value: unknown
): value is DeliveryReminderMismatchReopenActivityMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  const metadata = value as Record<string, unknown>

  return (
    metadata.source === "reminder_mismatch_reopened" &&
    typeof metadata.reminderNotificationId === "string" &&
    metadata.reminderNotificationId.length > 0 &&
    (metadata.reminderBucket === null ||
      metadata.reminderBucket === "due_today" ||
      metadata.reminderBucket === "overdue") &&
    (metadata.reopenNote === null || typeof metadata.reopenNote === "string")
  )
}

function getReminderBucketLabel(reminderBucket: "due_today" | "overdue" | null) {
  if (reminderBucket === "due_today") {
    return "due today"
  }

  if (reminderBucket === "overdue") {
    return "overdue"
  }

  return "unspecified"
}

export function getDeliveryReminderMismatchReopenActivityBadgeLabel() {
  return "Mismatch reopened"
}

export function getDeliveryReminderMismatchReopenActivityBadgeClasses() {
  return "border-amber-400/30 bg-amber-500/10 text-amber-200"
}

export function getDeliveryReminderMismatchReopenActivityTitle() {
  return "Reopened previously resolved reminder mismatch"
}

export function getDeliveryReminderMismatchReopenActivityDescription(
  metadata: DeliveryReminderMismatchReopenActivityMetadata
) {
  const baseDescription = `Reopened resolved reminder mismatch from ${getReminderBucketLabel(
    metadata.reminderBucket
  )} reminder context.`

  return metadata.reopenNote
    ? `${baseDescription} ${metadata.reopenNote}`
    : baseDescription
}
