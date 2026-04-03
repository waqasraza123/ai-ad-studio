import { describe, expect, it } from "vitest"
import type { DeliveryReminderSupportRecord } from "./delivery-reminder-support"
import {
  buildDeliveryReminderRepairResultHref,
  doesDeliveryReminderRepairOutcomeMatchRecord,
  getDeliveryReminderRepairActionLabel,
  normalizeDeliveryReminderRepairOutcome
} from "./delivery-reminder-repair-outcome"

function createSupportRecord(
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

describe("buildDeliveryReminderRepairResultHref", () => {
  it("adds the repair outcome params while preserving the hash", () => {
    expect(
      buildDeliveryReminderRepairResultHref({
        action: "reschedule_tomorrow",
        baseHref:
          "/dashboard/delivery?activity=needs_follow_up&status=active#delivery-workspace-workspace-1-follow-up",
        notificationId: "notification-1",
        status: "success",
        workspaceId: "workspace-1"
      })
    ).toBe(
      "/dashboard/delivery?activity=needs_follow_up&status=active&reminder_repair_action=reschedule_tomorrow&reminder_repair_status=success&reminder_repair_workspace_id=workspace-1&reminder_repair_notification_id=notification-1#delivery-workspace-workspace-1-follow-up"
    )
  })
})

describe("normalizeDeliveryReminderRepairOutcome", () => {
  it("returns null when required fields are missing", () => {
    expect(
      normalizeDeliveryReminderRepairOutcome({
        action: "reschedule_tomorrow",
        notificationId: "notification-1",
        status: "success",
        workspaceId: null
      })
    ).toBeNull()
  })

  it("returns the normalized outcome when valid", () => {
    expect(
      normalizeDeliveryReminderRepairOutcome({
        action: "clear_reminder_scheduling",
        notificationId: " notification-1 ",
        status: "error",
        workspaceId: " workspace-1 "
      })
    ).toEqual({
      action: "clear_reminder_scheduling",
      notificationId: "notification-1",
      status: "error",
      workspaceId: "workspace-1"
    })
  })
})

describe("doesDeliveryReminderRepairOutcomeMatchRecord", () => {
  it("returns true when outcome and record match", () => {
    expect(
      doesDeliveryReminderRepairOutcomeMatchRecord({
        outcome: {
          action: "reschedule_tomorrow",
          notificationId: "notification-1",
          status: "success",
          workspaceId: "workspace-1"
        },
        record: createSupportRecord()
      })
    ).toBe(true)
  })

  it("returns false when workspace or notification do not match", () => {
    expect(
      doesDeliveryReminderRepairOutcomeMatchRecord({
        outcome: {
          action: "reschedule_tomorrow",
          notificationId: "notification-2",
          status: "success",
          workspaceId: "workspace-1"
        },
        record: createSupportRecord()
      })
    ).toBe(false)
  })
})

describe("getDeliveryReminderRepairActionLabel", () => {
  it("returns the expected labels", () => {
    expect(getDeliveryReminderRepairActionLabel("reschedule_tomorrow")).toBe(
      "Rescheduled for tomorrow"
    )
    expect(
      getDeliveryReminderRepairActionLabel("clear_reminder_scheduling")
    ).toBe("Cleared reminder scheduling")
  })
})
