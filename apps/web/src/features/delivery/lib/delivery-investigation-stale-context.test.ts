import { describe, expect, it } from "vitest"
import type { DeliveryReminderSupportRecord } from "@/features/delivery/lib/delivery-reminder-support"
import { buildDeliveryInvestigationStaleContextSummary } from "./delivery-investigation-stale-context"

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

describe("buildDeliveryInvestigationStaleContextSummary", () => {
  it("returns a stale follow-up summary when the follow-up focus target is not visible", () => {
    expect(
      buildDeliveryInvestigationStaleContextSummary({
        focusFollowUpForm: true,
        focusReminderNotificationId: "notification-1",
        focusWorkspaceId: "workspace-1",
        reminderSupportRecords: [],
        overviewRecords: []
      })
    ).toEqual({
      badges: [
        "Stale follow-up context",
        "Workspace workspace-1"
      ],
      description:
        "The investigation view is still pinned to a focused follow-up form, but that workspace is no longer visible in the current support scope. Keep the current filters and clear the stale focus, or reset to the base delivery scope.",
      title:
        "Focused follow-up context is outside the current visible support scope",
      tone: "amber"
    })
  })

  it("returns a stale reminder summary when the focused reminder is not visible in the current reminder scope", () => {
    expect(
      buildDeliveryInvestigationStaleContextSummary({
        focusFollowUpForm: false,
        focusReminderNotificationId: "notification-77",
        focusWorkspaceId: null,
        reminderSupportRecords: [],
        overviewRecords: [
          {
            activityEntries: [],
            workspace: {
              id: "workspace-1",
              title: "Workspace 1"
            }
          }
        ]
      })
    ).toEqual({
      badges: [
        "Stale reminder context",
        "Reminder notification-77"
      ],
      description:
        "The investigation view is still pinned to a reminder notification, but that reminder no longer appears inside the current visible reminder support scope. This usually happens after reminder support filters or support activity filters change.",
      title:
        "Focused reminder is outside the current visible reminder support scope",
      tone: "amber"
    })
  })

  it("returns a stale workspace summary when the focused workspace is no longer visible", () => {
    expect(
      buildDeliveryInvestigationStaleContextSummary({
        focusFollowUpForm: false,
        focusReminderNotificationId: null,
        focusWorkspaceId: "workspace-42",
        reminderSupportRecords: [],
        overviewRecords: []
      })
    ).toEqual({
      badges: [
        "Stale workspace focus",
        "Workspace workspace-42"
      ],
      description:
        "The investigation view is still pinned to a workspace that is no longer visible under the current support activity scope. Keep the current filters and clear the stale focus, or reset to the base delivery scope.",
      title:
        "Focused workspace is outside the current visible support activity scope",
      tone: "amber"
    })
  })

  it("returns null when the investigation context is still fresh", () => {
    expect(
      buildDeliveryInvestigationStaleContextSummary({
        focusFollowUpForm: false,
        focusReminderNotificationId: "notification-1",
        focusWorkspaceId: "workspace-1",
        reminderSupportRecords: [
          createReminderSupportRecord({
            notificationId: "notification-1",
            workspaceId: "workspace-1"
          })
        ],
        overviewRecords: [
          {
            activityEntries: [],
            workspace: {
              id: "workspace-1",
              title: "Workspace 1"
            }
          }
        ]
      })
    ).toBeNull()
  })
})
