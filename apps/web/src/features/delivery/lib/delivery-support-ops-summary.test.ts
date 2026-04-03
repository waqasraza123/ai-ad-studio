import { describe, expect, it } from "vitest"
import type { DeliveryReminderSupportRecord } from "@/features/delivery/lib/delivery-reminder-support"
import { summarizeDeliverySupportOps } from "./delivery-support-ops-summary"

function createReminderRepairActivity(input?: {
  repairOutcome?: "error" | "success"
}) {
  return {
    metadata: {
      clearReminderReason: null,
      errorCode: null,
      nextFollowUpDueOn: "2026-03-28",
      nextFollowUpStatus: "reminder_scheduled",
      previousFollowUpDueOn: "2026-03-27",
      previousFollowUpStatus: "reminder_scheduled",
      reminderBucket: "overdue",
      reminderNotificationId: "notification-1",
      repairAction: "reschedule_tomorrow",
      repairOutcome: input?.repairOutcome ?? "success",
      source: "reminder_support_repair"
    }
  }
}

function createSupportHandoffActivity() {
  return {
    metadata: {
      linkedRepairAction: "clear_reminder_scheduling",
      note: "Waiting on revised assets",
      reminderBucket: "overdue",
      reminderNotificationId: "notification-1",
      source: "reminder_support_note"
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
    notificationTitle: overrides.notificationTitle ?? "Delivery follow-up due today",
    reminderBucket: overrides.reminderBucket ?? "due_today",
    workspaceFollowUpDueOn: overrides.workspaceFollowUpDueOn ?? "2026-03-26",
    workspaceFollowUpStatus:
      overrides.workspaceFollowUpStatus ?? "reminder_scheduled",
    workspaceId: overrides.workspaceId ?? "workspace-1",
    workspaceLastNotificationBucket:
      overrides.workspaceLastNotificationBucket ?? "due_today",
    workspaceLastNotificationDate:
      overrides.workspaceLastNotificationDate ?? "2026-03-26",
    workspaceTitle: overrides.workspaceTitle ?? "Workspace"
  }
}

describe("summarizeDeliverySupportOps", () => {
  it("summarizes support-ops counts within the visible workspace scope", () => {
    const overviewRecords = [
      {
        activityEntries: [
          createReminderRepairActivity({
            repairOutcome: "error"
          }),
          createGenericActivity()
        ],
        workspace: {
          id: "workspace-a"
        }
      },
      {
        activityEntries: [createSupportHandoffActivity()],
        workspace: {
          id: "workspace-b"
        }
      },
      {
        activityEntries: [
          createReminderRepairActivity({
            repairOutcome: "success"
          })
        ],
        workspace: {
          id: "workspace-c"
        }
      }
    ]

    const reminderSupportRecords = [
      createReminderSupportRecord({
        notificationId: "notification-a",
        workspaceId: "workspace-a"
      }),
      createReminderSupportRecord({
        checkpointState: "in_sync",
        notificationId: "notification-b",
        workspaceId: "workspace-b"
      }),
      createReminderSupportRecord({
        notificationId: "notification-c",
        workspaceId: "workspace-c"
      }),
      createReminderSupportRecord({
        notificationId: "notification-d",
        workspaceId: "workspace-outside-scope"
      })
    ]

    expect(
      summarizeDeliverySupportOps({
        overviewRecords,
        reminderSupportRecords
      })
    ).toEqual({
      failedReminderRepairWorkspaceCount: 1,
      supportHandoffWorkspaceCount: 1,
      unresolvedReminderMismatchWorkspaceCount: 2,
      visibleSupportWorkspaceCount: 3
    })
  })

  it("returns zero counts for an empty scope", () => {
    expect(
      summarizeDeliverySupportOps({
        overviewRecords: [],
        reminderSupportRecords: []
      })
    ).toEqual({
      failedReminderRepairWorkspaceCount: 0,
      supportHandoffWorkspaceCount: 0,
      unresolvedReminderMismatchWorkspaceCount: 0,
      visibleSupportWorkspaceCount: 0
    })
  })
})
