import { describe, expect, it } from "vitest"
import { buildDeliveryFocusedWorkspaceStatusSummary } from "./delivery-focused-workspace-status"

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

describe("buildDeliveryFocusedWorkspaceStatusSummary", () => {
  it("returns the focused workspace summary with the latest support event label", () => {
    expect(
      buildDeliveryFocusedWorkspaceStatusSummary({
        focusWorkspaceId: "workspace-1",
        overviewRecords: [
          {
            activityEntries: [
              createSupportHandoffActivity(),
              createReminderRepairActivity()
            ],
            workspace: {
              follow_up_due_on: "2026-03-28",
              follow_up_last_notification_bucket: "overdue" as const,
              follow_up_last_notification_date: "2026-03-27",
              follow_up_status: "reminder_scheduled",
              id: "workspace-1",
              title: "Launch workspace"
            }
          }
        ]
      })
    ).toEqual({
      followUpDueOnLabel: "2026-03-28",
      followUpStatusLabel: "Reminder scheduled",
      latestSupportEventLabel: "Support handoff note",
      reminderCheckpointLabel: "Overdue on 2026-03-27",
      workspaceId: "workspace-1",
      workspaceTitle: "Launch workspace"
    })
  })

  it("returns the failed repair label when the latest visible support event is a failed repair", () => {
    expect(
      buildDeliveryFocusedWorkspaceStatusSummary({
        focusWorkspaceId: "workspace-1",
        overviewRecords: [
          {
            activityEntries: [
              createReminderRepairActivity({
                repairOutcome: "error"
              }),
              createGenericActivity()
            ],
            workspace: {
              follow_up_due_on: null,
              follow_up_last_notification_bucket: null,
              follow_up_last_notification_date: null,
              follow_up_status: "none",
              id: "workspace-1",
              title: "Launch workspace"
            }
          }
        ]
      })?.latestSupportEventLabel.toLowerCase()
    ).toBe("failed reminder repair")
  })

  it("returns null when no focused workspace is present in the current scope", () => {
    expect(
      buildDeliveryFocusedWorkspaceStatusSummary({
        focusWorkspaceId: "workspace-missing",
        overviewRecords: []
      })
    ).toBeNull()
  })
})
