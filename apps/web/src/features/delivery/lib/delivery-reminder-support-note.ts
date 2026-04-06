import type { DeliveryReminderRepairAction } from "./delivery-reminder-repair"
import { validateModestText } from "@/lib/modest-wording"

export const deliveryReminderSupportHandoffNoteFieldName = "supportHandoffNote"
export const deliveryReminderSupportHandoffNoteMaxLength = 500

export type DeliveryReminderSupportNoteValidationError =
  | "disallowed_wording"
  | "handoff_note_too_long"

export type DeliveryReminderSupportNoteActivityMetadata = {
  linkedRepairAction: DeliveryReminderRepairAction
  note: string
  reminderBucket: "due_today" | "overdue" | null
  reminderNotificationId: string | null
  source: "reminder_support_note"
}

export function normalizeDeliveryReminderSupportHandoffNote(
  value: FormDataEntryValue | null | undefined
) {
  if (typeof value !== "string") {
    return null
  }

  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : null
}

export function validateDeliveryReminderSupportHandoffNote(
  value: string | null
): DeliveryReminderSupportNoteValidationError | null {
  if (!value) {
    return null
  }

  if (value.length > deliveryReminderSupportHandoffNoteMaxLength) {
    return "handoff_note_too_long"
  }

  if (validateModestText(value)) {
    return "disallowed_wording"
  }

  return null
}

export function buildDeliveryReminderSupportNoteActivityMetadata(input: {
  linkedRepairAction: DeliveryReminderRepairAction
  note: string
  reminderBucket: "due_today" | "overdue" | null
  reminderNotificationId: string | null
}): DeliveryReminderSupportNoteActivityMetadata {
  return {
    linkedRepairAction: input.linkedRepairAction,
    note: input.note,
    reminderBucket: input.reminderBucket,
    reminderNotificationId: input.reminderNotificationId,
    source: "reminder_support_note"
  }
}

export function isDeliveryReminderSupportNoteActivityMetadata(
  value: unknown
): value is DeliveryReminderSupportNoteActivityMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  const metadata = value as Record<string, unknown>

  return (
    metadata.source === "reminder_support_note" &&
    typeof metadata.note === "string" &&
    metadata.note.length > 0 &&
    (metadata.linkedRepairAction === "reschedule_tomorrow" ||
      metadata.linkedRepairAction === "clear_reminder_scheduling") &&
    (metadata.reminderBucket === null ||
      metadata.reminderBucket === "due_today" ||
      metadata.reminderBucket === "overdue")
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

export function getDeliveryReminderSupportNoteActivityBadgeLabel() {
  return "Support handoff"
}

export function getDeliveryReminderSupportNoteActivityBadgeClasses() {
  return "border-violet-400/30 bg-violet-500/10 text-violet-200"
}

export function getDeliveryReminderSupportNoteActivityTitle(
  metadata: DeliveryReminderSupportNoteActivityMetadata
) {
  return metadata.linkedRepairAction === "clear_reminder_scheduling"
    ? "Saved support handoff note after clearing reminder scheduling"
    : "Saved support handoff note after rescheduling reminder follow-up"
}

export function getDeliveryReminderSupportNoteActivityDescription(
  metadata: DeliveryReminderSupportNoteActivityMetadata
) {
  return `Added from ${getReminderBucketLabel(
    metadata.reminderBucket
  )} reminder context. ${metadata.note}`
}
