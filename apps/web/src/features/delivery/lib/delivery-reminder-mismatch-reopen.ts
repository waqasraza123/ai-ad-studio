import { validateModestText } from "@/lib/modest-wording"

export const deliveryReminderMismatchReopenNoteFieldName =
  "reminderMismatchReopenNote"

export const deliveryReminderMismatchReopenNoteMaxLength = 500

export type DeliveryReminderMismatchReopenErrorCode =
  | "disallowed_wording"
  | "not_currently_resolved"
  | "reopen_note_too_long"
  | null

export type DeliveryReminderMismatchReopenActivityMetadata = {
  errorCode: DeliveryReminderMismatchReopenErrorCode
  reminderBucket: "due_today" | "overdue" | null
  reminderNotificationId: string
  reopenNote: string | null
  reopenOutcome: "error" | "success"
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

  if (validateModestText(value)) {
    return "disallowed_wording" as const
  }

  return null
}

export function buildDeliveryReminderMismatchReopenActivityMetadata(input: {
  errorCode: DeliveryReminderMismatchReopenErrorCode
  reminderBucket: "due_today" | "overdue" | null
  reminderNotificationId: string
  reopenNote: string | null
  reopenOutcome: "error" | "success"
}): DeliveryReminderMismatchReopenActivityMetadata {
  return {
    errorCode: input.errorCode,
    reminderBucket: input.reminderBucket,
    reminderNotificationId: input.reminderNotificationId,
    reopenNote: input.reopenNote,
    reopenOutcome: input.reopenOutcome,
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
    (metadata.reopenNote === null ||
      typeof metadata.reopenNote === "string") &&
    (metadata.reopenOutcome === "success" ||
      metadata.reopenOutcome === "error") &&
    (metadata.errorCode === null ||
      metadata.errorCode === "disallowed_wording" ||
      metadata.errorCode === "not_currently_resolved" ||
      metadata.errorCode === "reopen_note_too_long")
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

export function getDeliveryReminderMismatchReopenActivityBadgeLabel(
  metadata: DeliveryReminderMismatchReopenActivityMetadata
) {
  return metadata.reopenOutcome === "success"
    ? "Mismatch reopened"
    : "Mismatch reopen failed"
}

export function getDeliveryReminderMismatchReopenActivityBadgeClasses(
  metadata: DeliveryReminderMismatchReopenActivityMetadata
) {
  return metadata.reopenOutcome === "success"
    ? "border-amber-400/30 bg-amber-500/10 text-amber-200"
    : "border-rose-400/30 bg-rose-500/10 text-rose-200"
}

export function getDeliveryReminderMismatchReopenActivityTitle(
  metadata: DeliveryReminderMismatchReopenActivityMetadata
) {
  return metadata.reopenOutcome === "success"
    ? "Reopened previously resolved reminder mismatch"
    : "Failed to reopen previously resolved reminder mismatch"
}

export function getDeliveryReminderMismatchReopenActivityDescription(
  metadata: DeliveryReminderMismatchReopenActivityMetadata
) {
  if (
    metadata.reopenOutcome === "error" &&
    metadata.errorCode === "disallowed_wording"
  ) {
    return `Attempted to reopen a resolved mismatch from ${getReminderBucketLabel(
      metadata.reminderBucket
    )} reminder context, but the note used disallowed language.`
  }

  if (
    metadata.reopenOutcome === "error" &&
    metadata.errorCode === "reopen_note_too_long"
  ) {
    return `Attempted to reopen a resolved mismatch from ${getReminderBucketLabel(
      metadata.reminderBucket
    )} reminder context, but the reopen note exceeded the allowed length.`
  }

  if (
    metadata.reopenOutcome === "error" &&
    metadata.errorCode === "not_currently_resolved"
  ) {
    return `Attempted to reopen a resolved mismatch from ${getReminderBucketLabel(
      metadata.reminderBucket
    )} reminder context, but that reminder is no longer currently resolved for this workspace.`
  }

  const baseDescription = `Reopened resolved reminder mismatch from ${getReminderBucketLabel(
    metadata.reminderBucket
  )} reminder context.`

  return metadata.reopenNote
    ? `${baseDescription} ${metadata.reopenNote}`
    : baseDescription
}
