import type { DeliveryFollowUpStatus } from "@/server/database/types"
import type { DeliveryReminderRepairAction } from "./delivery-reminder-repair"
import type { DeliveryReminderClearReasonValidationError } from "./delivery-reminder-repair-reason"

export type DeliveryReminderRepairActivityMetadata = {
  clearReminderReason: string | null
  errorCode: DeliveryReminderClearReasonValidationError | null
  nextFollowUpDueOn: string | null
  nextFollowUpStatus: DeliveryFollowUpStatus | null
  previousFollowUpDueOn: string | null
  previousFollowUpStatus: DeliveryFollowUpStatus | null
  reminderBucket: "due_today" | "overdue" | null
  reminderNotificationId: string | null
  repairAction: DeliveryReminderRepairAction
  repairOutcome: "error" | "success"
  source: "reminder_support_repair"
}

function isFollowUpStatusValue(value: unknown): value is DeliveryFollowUpStatus {
  return (
    value === "none" ||
    value === "needs_follow_up" ||
    value === "reminder_scheduled" ||
    value === "waiting_on_client" ||
    value === "resolved"
  )
}

export function buildDeliveryReminderRepairActivityMetadata(input: {
  clearReminderReason: string | null
  errorCode: DeliveryReminderClearReasonValidationError | null
  nextFollowUpDueOn: string | null
  nextFollowUpStatus: DeliveryFollowUpStatus | null
  previousFollowUpDueOn: string | null
  previousFollowUpStatus: DeliveryFollowUpStatus | null
  reminderBucket: "due_today" | "overdue" | null
  reminderNotificationId: string | null
  repairAction: DeliveryReminderRepairAction
  repairOutcome: "error" | "success"
}): DeliveryReminderRepairActivityMetadata {
  return {
    clearReminderReason: input.clearReminderReason,
    errorCode: input.errorCode,
    nextFollowUpDueOn: input.nextFollowUpDueOn,
    nextFollowUpStatus: input.nextFollowUpStatus,
    previousFollowUpDueOn: input.previousFollowUpDueOn,
    previousFollowUpStatus: input.previousFollowUpStatus,
    reminderBucket: input.reminderBucket,
    reminderNotificationId: input.reminderNotificationId,
    repairAction: input.repairAction,
    repairOutcome: input.repairOutcome,
    source: "reminder_support_repair"
  }
}

export function isDeliveryReminderRepairActivityMetadata(
  value: unknown
): value is DeliveryReminderRepairActivityMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  const metadata = value as Record<string, unknown>

  const repairAction = metadata.repairAction
  const repairOutcome = metadata.repairOutcome
  const reminderBucket = metadata.reminderBucket
  const previousFollowUpStatus = metadata.previousFollowUpStatus
  const nextFollowUpStatus = metadata.nextFollowUpStatus
  const errorCode = metadata.errorCode

  return (
    metadata.source === "reminder_support_repair" &&
    (repairAction === "reschedule_tomorrow" ||
      repairAction === "clear_reminder_scheduling") &&
    (repairOutcome === "success" || repairOutcome === "error") &&
    (reminderBucket === null ||
      reminderBucket === "due_today" ||
      reminderBucket === "overdue") &&
    (previousFollowUpStatus === null ||
      isFollowUpStatusValue(previousFollowUpStatus)) &&
    (nextFollowUpStatus === null || isFollowUpStatusValue(nextFollowUpStatus)) &&
    (errorCode === null ||
      errorCode === "disallowed_wording" ||
      errorCode === "reason_required" ||
      errorCode === "reason_too_long")
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

function getFollowUpStateLabel(input: {
  dueOn: string | null
  status: DeliveryFollowUpStatus | null
}) {
  if (!input.status) {
    return "unknown"
  }

  if (!input.dueOn) {
    return input.status
  }

  return `${input.status} on ${input.dueOn}`
}

export function getDeliveryReminderRepairActivityBadgeLabel(
  metadata: DeliveryReminderRepairActivityMetadata
) {
  return metadata.repairOutcome === "success"
    ? "Reminder repair"
    : "Reminder repair failed"
}

export function getDeliveryReminderRepairActivityBadgeClasses(
  metadata: DeliveryReminderRepairActivityMetadata
) {
  return metadata.repairOutcome === "success"
    ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-200"
    : "border-rose-400/30 bg-rose-500/10 text-rose-200"
}

export function getDeliveryReminderRepairActivityTitle(
  metadata: DeliveryReminderRepairActivityMetadata
) {
  if (metadata.repairAction === "reschedule_tomorrow") {
    return metadata.repairOutcome === "success"
      ? "Rescheduled reminder follow-up from support context"
      : "Failed to reschedule reminder follow-up from support context"
  }

  return metadata.repairOutcome === "success"
    ? "Cleared reminder scheduling from support context"
    : "Failed to clear reminder scheduling from support context"
}

export function getDeliveryReminderRepairActivityDescription(
  metadata: DeliveryReminderRepairActivityMetadata
) {
  if (
    metadata.repairAction === "clear_reminder_scheduling" &&
    metadata.repairOutcome === "error" &&
    metadata.errorCode === "reason_required"
  ) {
    return `Triggered from ${getReminderBucketLabel(
      metadata.reminderBucket
    )} reminder context. Clear reminder scheduling requires an explicit operator reason.`
  }

  if (
    metadata.repairAction === "clear_reminder_scheduling" &&
    metadata.repairOutcome === "error" &&
    metadata.errorCode === "disallowed_wording"
  ) {
    return `Triggered from ${getReminderBucketLabel(
      metadata.reminderBucket
    )} reminder context. The submitted reason used disallowed language.`
  }

  if (
    metadata.repairAction === "clear_reminder_scheduling" &&
    metadata.repairOutcome === "error" &&
    metadata.errorCode === "reason_too_long"
  ) {
    return `Triggered from ${getReminderBucketLabel(
      metadata.reminderBucket
    )} reminder context. Clear reason exceeded the allowed length.`
  }

  const previousState = getFollowUpStateLabel({
    dueOn: metadata.previousFollowUpDueOn,
    status: metadata.previousFollowUpStatus
  })

  const nextState = getFollowUpStateLabel({
    dueOn: metadata.nextFollowUpDueOn,
    status: metadata.nextFollowUpStatus
  })

  const baseDescription = `Triggered from ${getReminderBucketLabel(
    metadata.reminderBucket
  )} reminder context. Follow-up changed from ${previousState} to ${nextState}.`

  if (
    metadata.repairAction === "clear_reminder_scheduling" &&
    metadata.clearReminderReason
  ) {
    return `${baseDescription} Reason: ${metadata.clearReminderReason}`
  }

  return baseDescription
}


export function normalizeReminderBucketForRepairActivity(
  value: FormDataEntryValue | null | undefined
): "due_today" | "overdue" | null {
  if (value === "due_today" || value === "overdue") {
    return value
  }

  return null
}

export function normalizeReminderNotificationIdForRepairActivity(
  value: FormDataEntryValue | null | undefined
) {
  return typeof value === "string" && value.length > 0 ? value : null
}
