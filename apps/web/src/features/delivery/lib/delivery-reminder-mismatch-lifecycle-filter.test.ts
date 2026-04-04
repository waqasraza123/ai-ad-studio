import { describe, expect, it } from "vitest"
import type { DeliveryReminderSupportRecord } from "./delivery-reminder-support"
import {
  filterDeliveryReminderMismatchLifecycleScope,
  getDeliveryReminderMismatchLifecycleFilterLabel,
  normalizeDeliveryReminderMismatchLifecycleFilter
} from "./delivery-reminder-mismatch-lifecycle-filter"

function createMismatchReopenActivity(input?: {
  reopenOutcome?: "error" | "success"
}) {
  return {
    metadata: {
      errorCode:
        input?.reopenOutcome === "error" ? "not_currently_resolved" : null,
      reminderBucket: "overdue",
      reminderNotificationId: "notification-1",
      reopenNote: null,
      reopenOutcome: input?.reopenOutcome ?? "success",
      source: "reminder_mismatch_reopened"
    }
  }
}

function createReminderSupportRecord(
  overrides: Partial<DeliveryReminderSupportRecord> = {}
): DeliveryReminderSupportRecord {
  return {
    checkpointState: overrides.checkpointState ?? "checkpoint_mismatch",
    notificationBody: overrides.notificationBody ?? "body",
    notificationCreatedAt:
      overrides.notificationCreatedAt ?? "2026-03-26T09:30:00.000Z",
    notificationFollowUpDueOn:
      overrides.notificationFollowUpDueOn ?? "2026-03-26",
    notificationId: overrides.notificationId ?? "notification-1",
    notificationKind:
      overrides.notificationKind ?? "delivery_follow_up_due_today",
    notificationTitle:
      overrides.notificationTitle ?? "Delivery follow-up due today",
    reminderBucket: overrides.reminderBucket ?? "due_today",
    workspaceFollowUpDueOn: overrides.workspaceFollowUpDueOn ?? "2026-03-26",
    workspaceFollowUpStatus:
      overrides.workspaceFollowUpStatus ?? "reminder_scheduled",
    workspaceId: overrides.workspaceId ?? "workspace-1",
    workspaceLastNotificationBucket:
      overrides.workspaceLastNotificationBucket ?? null,
    workspaceLastNotificationDate:
      overrides.workspaceLastNotificationDate ?? null,
    workspaceTitle: overrides.workspaceTitle ?? "Workspace"
  }
}

describe("normalizeDeliveryReminderMismatchLifecycleFilter", () => {
  it("returns all for missing or invalid values", () => {
    expect(normalizeDeliveryReminderMismatchLifecycleFilter(undefined)).toBe(
      "all"
    )
    expect(normalizeDeliveryReminderMismatchLifecycleFilter("invalid")).toBe(
      "all"
    )
  })

  it("returns valid lifecycle filter values", () => {
    expect(normalizeDeliveryReminderMismatchLifecycleFilter("unresolved")).toBe(
      "unresolved"
    )
    expect(normalizeDeliveryReminderMismatchLifecycleFilter("resolved")).toBe(
      "resolved"
    )
    expect(
      normalizeDeliveryReminderMismatchLifecycleFilter(
        "failed_reopen_attempts"
      )
    ).toBe("failed_reopen_attempts")
  })
})

describe("getDeliveryReminderMismatchLifecycleFilterLabel", () => {
  it("returns the expected labels", () => {
    expect(getDeliveryReminderMismatchLifecycleFilterLabel("all")).toBe(
      "All lifecycle buckets"
    )
    expect(getDeliveryReminderMismatchLifecycleFilterLabel("unresolved")).toBe(
      "Unresolved mismatches"
    )
    expect(getDeliveryReminderMismatchLifecycleFilterLabel("resolved")).toBe(
      "Resolved mismatches"
    )
    expect(
      getDeliveryReminderMismatchLifecycleFilterLabel("failed_reopen_attempts")
    ).toBe("Failed reopen attempts")
  })
})

describe("filterDeliveryReminderMismatchLifecycleScope", () => {
  const overviewRecords = [
    {
      activityTimeline: [createMismatchReopenActivity()],
      workspace: {
        id: "workspace-a"
      }
    },
    {
      activityTimeline: [
        createMismatchReopenActivity({
          reopenOutcome: "error"
        })
      ],
      workspace: {
        id: "workspace-b"
      }
    }
  ]

  const reminderSupportRecords = [
    createReminderSupportRecord({
      checkpointState: "checkpoint_mismatch",
      notificationId: "notification-a",
      workspaceId: "workspace-a"
    }),
    createReminderSupportRecord({
      checkpointState: "resolved",
      notificationId: "notification-b",
      workspaceId: "workspace-b"
    })
  ]

  it("filters unresolved mismatch scope by reminder support record state", () => {
    expect(
      filterDeliveryReminderMismatchLifecycleScope({
        filter: "unresolved",
        overviewRecords,
        reminderSupportRecords
      })
    ).toEqual({
      overviewRecords: [
        {
          activityTimeline: [createMismatchReopenActivity()],
          workspace: {
            id: "workspace-a"
          }
        }
      ],
      reminderSupportRecords: [
        createReminderSupportRecord({
          checkpointState: "checkpoint_mismatch",
          notificationId: "notification-a",
          workspaceId: "workspace-a"
        })
      ]
    })
  })

  it("filters resolved mismatch scope by reminder support record state", () => {
    expect(
      filterDeliveryReminderMismatchLifecycleScope({
        filter: "resolved",
        overviewRecords,
        reminderSupportRecords
      })
    ).toEqual({
      overviewRecords: [
        {
          activityTimeline: [
            createMismatchReopenActivity({
              reopenOutcome: "error"
            })
          ],
          workspace: {
            id: "workspace-b"
          }
        }
      ],
      reminderSupportRecords: [
        createReminderSupportRecord({
          checkpointState: "resolved",
          notificationId: "notification-b",
          workspaceId: "workspace-b"
        })
      ]
    })
  })

  it("filters failed reopen scope by visible failed reopen activity", () => {
    expect(
      filterDeliveryReminderMismatchLifecycleScope({
        filter: "failed_reopen_attempts",
        overviewRecords,
        reminderSupportRecords
      })
    ).toEqual({
      overviewRecords: [
        {
          activityTimeline: [
            createMismatchReopenActivity({
              reopenOutcome: "error"
            })
          ],
          workspace: {
            id: "workspace-b"
          }
        }
      ],
      reminderSupportRecords: [
        createReminderSupportRecord({
          checkpointState: "resolved",
          notificationId: "notification-b",
          workspaceId: "workspace-b"
        })
      ]
    })
  })
})
