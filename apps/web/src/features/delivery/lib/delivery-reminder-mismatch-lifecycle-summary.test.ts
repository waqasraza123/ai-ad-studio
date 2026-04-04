import { describe, expect, it } from "vitest"
import type { DeliveryReminderSupportRecord } from "@/features/delivery/lib/delivery-reminder-support"
import { summarizeDeliveryReminderMismatchLifecycle } from "./delivery-reminder-mismatch-lifecycle-summary"

function createMismatchReopenActivity(input?: {
  errorCode?: "not_currently_resolved" | "reopen_note_too_long" | null
  reopenOutcome?: "error" | "success"
}) {
  return {
    metadata: {
      errorCode: input?.errorCode ?? null,
      reminderBucket: "overdue",
      reminderNotificationId: "notification-1",
      reopenNote: null,
      reopenOutcome: input?.reopenOutcome ?? "success",
      source: "reminder_mismatch_reopened"
    }
  }
}

function createGenericActivity() {
  return {
    metadata: {
      source: "something_else"
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

describe("summarizeDeliveryReminderMismatchLifecycle", () => {
  it("summarizes mismatch lifecycle totals in the visible workspace scope", () => {
    const overviewRecords = [
      {
        activityEntries: [
          createMismatchReopenActivity({
            reopenOutcome: "success"
          }),
          createMismatchReopenActivity({
            errorCode: "not_currently_resolved",
            reopenOutcome: "error"
          }),
          createGenericActivity()
        ],
        workspace: {
          id: "workspace-a"
        }
      },
      {
        activityEntries: [
          createMismatchReopenActivity({
            reopenOutcome: "success"
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
      }),
      createReminderSupportRecord({
        checkpointState: "checkpoint_mismatch",
        notificationId: "notification-outside-scope",
        workspaceId: "workspace-outside-scope"
      })
    ]

    expect(
      summarizeDeliveryReminderMismatchLifecycle({
        overviewRecords,
        reminderSupportRecords
      })
    ).toEqual({
      failedReopenAttemptsCount: 1,
      reopenedMismatchCount: 2,
      resolvedMismatchCount: 1,
      unresolvedMismatchCount: 1,
      visibleWorkspaceCount: 2
    })
  })

  it("returns zero totals for an empty visible scope", () => {
    expect(
      summarizeDeliveryReminderMismatchLifecycle({
        overviewRecords: [],
        reminderSupportRecords: []
      })
    ).toEqual({
      failedReopenAttemptsCount: 0,
      reopenedMismatchCount: 0,
      resolvedMismatchCount: 0,
      unresolvedMismatchCount: 0,
      visibleWorkspaceCount: 0
    })
  })
})
