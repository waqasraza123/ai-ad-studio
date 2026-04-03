import { describe, expect, it } from "vitest"
import type { DeliveryReminderSupportRecord } from "@/features/delivery/lib/delivery-reminder-support"
import { buildDeliveryInvestigationContextSummary } from "./delivery-investigation-context-summary"

function createReminderRepairActivity(input?: {
  errorCode?: "handoff_note_too_long" | "reason_required" | "reason_too_long" | null
  repairOutcome?: "error" | "success"
}) {
  return {
    metadata: {
      clearReminderReason: null,
      errorCode: input?.errorCode ?? null,
      nextFollowUpDueOn: "2026-03-28",
      nextFollowUpStatus: "reminder_scheduled",
      previousFollowUpDueOn: "2026-03-27",
      previousFollowUpStatus: "reminder_scheduled",
      reminderBucket: "overdue",
      reminderNotificationId: "notification-1",
      repairAction: "clear_reminder_scheduling",
      repairOutcome: input?.repairOutcome ?? "error",
      source: "reminder_support_repair"
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
      overrides.workspaceLastNotificationBucket ?? null,
    workspaceLastNotificationDate:
      overrides.workspaceLastNotificationDate ?? null,
    workspaceTitle: overrides.workspaceTitle ?? "Workspace"
  }
}

describe("buildDeliveryInvestigationContextSummary", () => {
  it("returns a failed repair summary when the focused workspace has a failed repair", () => {
    const summary = buildDeliveryInvestigationContextSummary({
      focusedReminderSupportRecord: createReminderSupportRecord(),
      focusWorkspaceId: "workspace-1",
      overviewRecords: [
        {
          activityEntries: [
            createReminderRepairActivity({
              errorCode: "reason_required"
            })
          ],
          workspace: {
            id: "workspace-1",
            title: "Launch workspace"
          }
        }
      ]
    })

    expect(summary).toEqual({
      badges: [
        "Failed reminder repair",
        "Overdue",
        "Cleared reminder scheduling"
      ],
      description:
        "The latest support repair for Launch workspace tried to cleared reminder scheduling from overdue reminder context because clear reminder scheduling required an explicit operator reason. Current follow-up state is reminder_scheduled on 2026-03-27.",
      title:
        "Why this view matters: Launch workspace has a failed reminder repair",
      tone: "rose"
    })
  })

  it("returns an unresolved mismatch summary when no failed repair exists", () => {
    const summary = buildDeliveryInvestigationContextSummary({
      focusedReminderSupportRecord: createReminderSupportRecord({
        notificationId: "notification-22",
        reminderBucket: "due_today",
        workspaceId: "workspace-1",
        workspaceLastNotificationBucket: null,
        workspaceLastNotificationDate: null
      }),
      focusWorkspaceId: "workspace-1",
      overviewRecords: [
        {
          activityEntries: [],
          workspace: {
            id: "workspace-1",
            title: "Launch workspace"
          }
        }
      ]
    })

    expect(summary).toEqual({
      badges: [
        "Unresolved mismatch",
        "Due today",
        "Notification notification-22"
      ],
      description:
        "The focused reminder notification for Launch workspace is still out of sync with the current workspace checkpoint. The reminder was sent for due today context, but the workspace currently shows no recorded reminder checkpoint. Current follow-up state is reminder_scheduled on 2026-03-26.",
      title:
        "Why this view matters: Launch workspace still has an unresolved reminder mismatch",
      tone: "amber"
    })
  })

  it("returns null when the focused workspace has no summary-worthy context", () => {
    expect(
      buildDeliveryInvestigationContextSummary({
        focusedReminderSupportRecord: null,
        focusWorkspaceId: "workspace-1",
        overviewRecords: [
          {
            activityEntries: [],
            workspace: {
              id: "workspace-1",
              title: "Launch workspace"
            }
          }
        ]
      })
    ).toBeNull()
  })

  it("returns null when the focused workspace is not visible in the current scope", () => {
    expect(
      buildDeliveryInvestigationContextSummary({
        focusedReminderSupportRecord: createReminderSupportRecord(),
        focusWorkspaceId: "workspace-missing",
        overviewRecords: []
      })
    ).toBeNull()
  })
})
