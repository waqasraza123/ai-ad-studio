import type { DeliveryReminderNotificationBucket } from "./delivery-follow-up-reminder-notification"

export type DeliveryFollowUpReminderBucketCounts = {
  failedCount: number
  notifiedCount: number
  scannedCount: number
  skippedCount: number
}

export type DeliveryFollowUpReminderBucketTotals = Record<
  DeliveryReminderNotificationBucket,
  DeliveryFollowUpReminderBucketCounts
>

export type DeliveryFollowUpReminderSweepLogPayload = {
  durationMs: number
  errorMessage: string | null
  eventKey: "worker.delivery_follow_up_reminder_sweep"
  failureCount: number
  failureSample: string[]
  notifiedCount: number
  reminderBucketTotals: DeliveryFollowUpReminderBucketTotals
  scannedCount: number
  skippedCount: number
  status: "failed" | "ok" | "partial_failure"
  todayDateKey: string | null
}

type DeliveryFollowUpReminderBucketCountField =
  keyof DeliveryFollowUpReminderBucketCounts

function createEmptyDeliveryFollowUpReminderBucketCounts(): DeliveryFollowUpReminderBucketCounts {
  return {
    failedCount: 0,
    notifiedCount: 0,
    scannedCount: 0,
    skippedCount: 0
  }
}

export function createEmptyDeliveryFollowUpReminderBucketTotals(): DeliveryFollowUpReminderBucketTotals {
  return {
    due_today: createEmptyDeliveryFollowUpReminderBucketCounts(),
    overdue: createEmptyDeliveryFollowUpReminderBucketCounts()
  }
}

export function incrementDeliveryFollowUpReminderBucketTotals(input: {
  field: DeliveryFollowUpReminderBucketCountField
  reminderBucket: DeliveryReminderNotificationBucket
  reminderBucketTotals: DeliveryFollowUpReminderBucketTotals
}) {
  input.reminderBucketTotals[input.reminderBucket][input.field] += 1
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string" && error.length > 0) {
    return error
  }

  return "Unknown delivery reminder sweep error"
}

export function buildDeliveryFollowUpReminderSweepLogPayload(input: {
  durationMs: number
  error?: unknown
  failureSampleLimit?: number
  result?: {
    failureCount: number
    failures: string[]
    notifiedCount: number
    reminderBucketTotals: DeliveryFollowUpReminderBucketTotals
    scannedCount: number
    skippedCount: number
    todayDateKey: string
  }
}): DeliveryFollowUpReminderSweepLogPayload {
  const failureSampleLimit = input.failureSampleLimit ?? 5

  if (input.result) {
    return {
      durationMs: input.durationMs,
      errorMessage: null,
      eventKey: "worker.delivery_follow_up_reminder_sweep",
      failureCount: input.result.failureCount,
      failureSample: input.result.failures.slice(0, failureSampleLimit),
      notifiedCount: input.result.notifiedCount,
      reminderBucketTotals: input.result.reminderBucketTotals,
      scannedCount: input.result.scannedCount,
      skippedCount: input.result.skippedCount,
      status: input.result.failureCount > 0 ? "partial_failure" : "ok",
      todayDateKey: input.result.todayDateKey
    }
  }

  return {
    durationMs: input.durationMs,
    errorMessage: getErrorMessage(input.error),
    eventKey: "worker.delivery_follow_up_reminder_sweep",
    failureCount: 1,
    failureSample: [],
    notifiedCount: 0,
    reminderBucketTotals: createEmptyDeliveryFollowUpReminderBucketTotals(),
    scannedCount: 0,
    skippedCount: 0,
    status: "failed",
    todayDateKey: null
  }
}
