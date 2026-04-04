import { describe, expect, it } from "vitest"
import { buildDeliveryReminderMismatchReopenActivityMetadata } from "./delivery-reminder-mismatch-reopen"
import { buildDeliveryReminderMismatchLifecycleSummary } from "./delivery-reminder-mismatch-lifecycle-summary"

describe("buildDeliveryReminderMismatchLifecycleSummary", () => {
  it("builds lifecycle totals for the current visible scope", () => {
    const summary = buildDeliveryReminderMismatchLifecycleSummary({
      reminderSupportRecords: [
        { checkpointState: "checkpoint_mismatch" },
        { checkpointState: "checkpoint_mismatch" },
        { checkpointState: "resolved" },
        { checkpointState: "other" }
      ],
      workspaceRecords: [
        {
          activityTimeline: [
            {
              metadata: buildDeliveryReminderMismatchReopenActivityMetadata({
                errorCode: null,
                reminderBucket: "overdue",
                reminderNotificationId: "notification-1",
                reopenNote: null,
                reopenOutcome: "success"
              })
            },
            {
              metadata: buildDeliveryReminderMismatchReopenActivityMetadata({
                errorCode: "not_currently_resolved",
                reminderBucket: "due_today",
                reminderNotificationId: "notification-2",
                reopenNote: null,
                reopenOutcome: "error"
              })
            }
          ]
        },
        {
          activityTimeline: [
            {
              metadata: {
                source: "other_activity"
              }
            }
          ]
        }
      ]
    })

    expect(summary).toEqual({
      failedReopenAttemptsCount: 1,
      reopenedCount: 1,
      resolvedCount: 1,
      unresolvedCount: 2
    })
  })

  it("returns zeroed lifecycle totals for empty input", () => {
    expect(
      buildDeliveryReminderMismatchLifecycleSummary({
        reminderSupportRecords: [],
        workspaceRecords: []
      })
    ).toEqual({
      failedReopenAttemptsCount: 0,
      reopenedCount: 0,
      resolvedCount: 0,
      unresolvedCount: 0
    })
  })
})
