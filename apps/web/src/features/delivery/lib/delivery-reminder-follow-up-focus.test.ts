import { describe, expect, it } from "vitest"
import type { DeliveryReminderSupportRecord } from "./delivery-reminder-support"
import {
  findFocusedDeliveryReminderSupportRecord,
  resolveFocusedFollowUpFormWorkspaceId
} from "./delivery-reminder-follow-up-focus"

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
    workspaceId:
      overrides.workspaceId !== undefined ? overrides.workspaceId : "workspace-1",
    workspaceLastNotificationBucket:
      overrides.workspaceLastNotificationBucket ?? "due_today",
    workspaceLastNotificationDate:
      overrides.workspaceLastNotificationDate ?? "2026-03-26",
    workspaceTitle: overrides.workspaceTitle ?? "Workspace"
  }
}

describe("findFocusedDeliveryReminderSupportRecord", () => {
  it("returns null when no notification id is provided", () => {
    expect(findFocusedDeliveryReminderSupportRecord([], null)).toBeNull()
  })

  it("returns the matching reminder support record", () => {
    const records = [
      createSupportRecord({
        notificationId: "notification-a"
      }),
      createSupportRecord({
        notificationId: "notification-b",
        workspaceId: "workspace-2"
      })
    ]

    expect(
      findFocusedDeliveryReminderSupportRecord(records, "notification-b")
    ).toEqual(records[1])
  })

  it("returns null when the notification id is not found", () => {
    const records = [createSupportRecord()]

    expect(
      findFocusedDeliveryReminderSupportRecord(records, "missing-notification")
    ).toBeNull()
  })
})

describe("resolveFocusedFollowUpFormWorkspaceId", () => {
  it("returns the workspace id for a mismatch record when follow-up focus is enabled", () => {
    expect(
      resolveFocusedFollowUpFormWorkspaceId({
        record: createSupportRecord({
          checkpointState: "checkpoint_mismatch",
          workspaceId: "workspace-1"
        }),
        shouldFocusFollowUpForm: true
      })
    ).toBe("workspace-1")
  })

  it("returns null when follow-up focus is disabled", () => {
    expect(
      resolveFocusedFollowUpFormWorkspaceId({
        record: createSupportRecord(),
        shouldFocusFollowUpForm: false
      })
    ).toBeNull()
  })

  it("returns null when the record is not a checkpoint mismatch", () => {
    expect(
      resolveFocusedFollowUpFormWorkspaceId({
        record: createSupportRecord({
          checkpointState: "in_sync"
        }),
        shouldFocusFollowUpForm: true
      })
    ).toBeNull()
  })

  it("returns null when the record does not have a workspace id", () => {
    expect(
      resolveFocusedFollowUpFormWorkspaceId({
        record: createSupportRecord({
          workspaceId: null
        }),
        shouldFocusFollowUpForm: true
      })
    ).toBeNull()
  })
})
