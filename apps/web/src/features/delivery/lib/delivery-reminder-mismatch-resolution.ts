import type { DeliveryWorkspaceRecord } from "@/server/database/types"
import { validateModestText } from "../../../lib/modest-wording/index"

export const deliveryReminderMismatchResolutionNoteFieldName =
  "reminderMismatchResolutionNote"

export const deliveryReminderMismatchResolutionNoteMaxLength = 500

export type DeliveryReminderMismatchResolutionActivityMetadata = {
  reminderBucket: "due_today" | "overdue" | null
  reminderNotificationId: string
  resolutionNote: string | null
  source: "reminder_mismatch_resolution"
}

export function normalizeDeliveryReminderMismatchResolutionNote(
  value: FormDataEntryValue | null | undefined
) {
  if (typeof value !== "string") {
    return null
  }

  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : null
}

export function validateDeliveryReminderMismatchResolutionNote(
  value: string | null
) {
  if (!value) {
    return null
  }

  if (value.length > deliveryReminderMismatchResolutionNoteMaxLength) {
    return "resolution_note_too_long" as const
  }

  if (validateModestText(value)) {
    return "disallowed_wording" as const
  }

  return null
}

export function isDeliveryReminderMismatchResolved(input: {
  reminderNotificationId: string
  workspace: Pick<
    DeliveryWorkspaceRecord,
    "reminder_mismatch_resolved_notification_id"
  > | null
}) {
  if (!input.workspace) {
    return false
  }

  return (
    input.workspace.reminder_mismatch_resolved_notification_id ===
    input.reminderNotificationId
  )
}

export function buildDeliveryReminderMismatchResolutionActivityMetadata(input: {
  reminderBucket: "due_today" | "overdue" | null
  reminderNotificationId: string
  resolutionNote: string | null
}): DeliveryReminderMismatchResolutionActivityMetadata {
  return {
    reminderBucket: input.reminderBucket,
    reminderNotificationId: input.reminderNotificationId,
    resolutionNote: input.resolutionNote,
    source: "reminder_mismatch_resolution"
  }
}

export function isDeliveryReminderMismatchResolutionActivityMetadata(
  value: unknown
): value is DeliveryReminderMismatchResolutionActivityMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  const metadata = value as Record<string, unknown>

  return (
    metadata.source === "reminder_mismatch_resolution" &&
    typeof metadata.reminderNotificationId === "string" &&
    metadata.reminderNotificationId.length > 0 &&
    (metadata.reminderBucket === null ||
      metadata.reminderBucket === "due_today" ||
      metadata.reminderBucket === "overdue") &&
    (metadata.resolutionNote === null ||
      typeof metadata.resolutionNote === "string")
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

export function getDeliveryReminderMismatchResolutionActivityBadgeLabel() {
  return "Mismatch resolved"
}

export function getDeliveryReminderMismatchResolutionActivityBadgeClasses() {
  return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
}

export function getDeliveryReminderMismatchResolutionActivityTitle() {
  return "Marked reminder mismatch as resolved"
}

export function getDeliveryReminderMismatchResolutionActivityDescription(
  metadata: DeliveryReminderMismatchResolutionActivityMetadata
) {
  const baseDescription = `Resolved reminder mismatch from ${getReminderBucketLabel(
    metadata.reminderBucket
  )} reminder context.`

  return metadata.resolutionNote
    ? `${baseDescription} ${metadata.resolutionNote}`
    : baseDescription
}
