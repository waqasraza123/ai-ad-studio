import { describe, expect, it } from "vitest"
import {
  buildDeliveryFollowUpReminderSweepLogPayload,
  createEmptyDeliveryFollowUpReminderBucketTotals,
  incrementDeliveryFollowUpReminderBucketTotals
} from "./delivery-follow-up-reminder-observability"

describe("createEmptyDeliveryFollowUpReminderBucketTotals", () => {
  it("creates zeroed totals for both reminder buckets", () => {
    expect(createEmptyDeliveryFollowUpReminderBucketTotals()).toEqual({
      due_today: {
        failedCount: 0,
        notifiedCount: 0,
        scannedCount: 0,
        skippedCount: 0
      },
      overdue: {
        failedCount: 0,
        notifiedCount: 0,
        scannedCount: 0,
        skippedCount: 0
      }
    })
  })
})

describe("incrementDeliveryFollowUpReminderBucketTotals", () => {
  it("increments the requested field for the requested bucket", () => {
    const reminderBucketTotals =
      createEmptyDeliveryFollowUpReminderBucketTotals()

    incrementDeliveryFollowUpReminderBucketTotals({
      field: "scannedCount",
      reminderBucket: "due_today",
      reminderBucketTotals
    })
    incrementDeliveryFollowUpReminderBucketTotals({
      field: "notifiedCount",
      reminderBucket: "due_today",
      reminderBucketTotals
    })
    incrementDeliveryFollowUpReminderBucketTotals({
      field: "failedCount",
      reminderBucket: "overdue",
      reminderBucketTotals
    })

    expect(reminderBucketTotals).toEqual({
      due_today: {
        failedCount: 0,
        notifiedCount: 1,
        scannedCount: 1,
        skippedCount: 0
      },
      overdue: {
        failedCount: 1,
        notifiedCount: 0,
        scannedCount: 0,
        skippedCount: 0
      }
    })
  })
})

describe("buildDeliveryFollowUpReminderSweepLogPayload", () => {
  it("builds a success payload with reminder bucket totals", () => {
    const reminderBucketTotals =
      createEmptyDeliveryFollowUpReminderBucketTotals()

    incrementDeliveryFollowUpReminderBucketTotals({
      field: "scannedCount",
      reminderBucket: "due_today",
      reminderBucketTotals
    })
    incrementDeliveryFollowUpReminderBucketTotals({
      field: "notifiedCount",
      reminderBucket: "due_today",
      reminderBucketTotals
    })
    incrementDeliveryFollowUpReminderBucketTotals({
      field: "scannedCount",
      reminderBucket: "overdue",
      reminderBucketTotals
    })
    incrementDeliveryFollowUpReminderBucketTotals({
      field: "skippedCount",
      reminderBucket: "overdue",
      reminderBucketTotals
    })

    expect(
      buildDeliveryFollowUpReminderSweepLogPayload({
        durationMs: 87,
        result: {
          failureCount: 0,
          failures: [],
          notifiedCount: 1,
          reminderBucketTotals,
          scannedCount: 2,
          skippedCount: 1,
          todayDateKey: "2026-03-24"
        }
      })
    ).toEqual({
      durationMs: 87,
      errorMessage: null,
      eventKey: "worker.delivery_follow_up_reminder_sweep",
      failureCount: 0,
      failureSample: [],
      notifiedCount: 1,
      reminderBucketTotals,
      scannedCount: 2,
      skippedCount: 1,
      status: "ok",
      todayDateKey: "2026-03-24"
    })
  })

  it("builds a partial failure payload with a limited failure sample", () => {
    const reminderBucketTotals =
      createEmptyDeliveryFollowUpReminderBucketTotals()

    incrementDeliveryFollowUpReminderBucketTotals({
      field: "scannedCount",
      reminderBucket: "due_today",
      reminderBucketTotals
    })
    incrementDeliveryFollowUpReminderBucketTotals({
      field: "failedCount",
      reminderBucket: "due_today",
      reminderBucketTotals
    })

    expect(
      buildDeliveryFollowUpReminderSweepLogPayload({
        durationMs: 91,
        failureSampleLimit: 2,
        result: {
          failureCount: 3,
          failures: ["a", "b", "c"],
          notifiedCount: 0,
          reminderBucketTotals,
          scannedCount: 1,
          skippedCount: 0,
          todayDateKey: "2026-03-24"
        }
      })
    ).toEqual({
      durationMs: 91,
      errorMessage: null,
      eventKey: "worker.delivery_follow_up_reminder_sweep",
      failureCount: 3,
      failureSample: ["a", "b"],
      notifiedCount: 0,
      reminderBucketTotals,
      scannedCount: 1,
      skippedCount: 0,
      status: "partial_failure",
      todayDateKey: "2026-03-24"
    })
  })

  it("builds a failed payload when the sweep throws before returning a result", () => {
    expect(
      buildDeliveryFollowUpReminderSweepLogPayload({
        durationMs: 102,
        error: new Error("boom")
      })
    ).toEqual({
      durationMs: 102,
      errorMessage: "boom",
      eventKey: "worker.delivery_follow_up_reminder_sweep",
      failureCount: 1,
      failureSample: [],
      notifiedCount: 0,
      reminderBucketTotals: {
        due_today: {
          failedCount: 0,
          notifiedCount: 0,
          scannedCount: 0,
          skippedCount: 0
        },
        overdue: {
          failedCount: 0,
          notifiedCount: 0,
          scannedCount: 0,
          skippedCount: 0
        }
      },
      scannedCount: 0,
      skippedCount: 0,
      status: "failed",
      todayDateKey: null
    })
  })
})
