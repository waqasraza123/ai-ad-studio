import { describe, expect, it } from "vitest"
import type { DeliveryReminderSupportRecord } from "./delivery-reminder-support"
import {
  filterDeliveryReminderSupportRecords,
  getDeliveryReminderSupportFilterLabel,
  normalizeDeliveryReminderSupportFilter
} from "./delivery-reminder-support-filter"

function createSupportRecord(
  overrides: Partial<DeliveryReminderSupportRecord> = {}
): DeliveryReminderSupportRecord {
  return {
    checkpointState: overrides.checkpointState ?? "in_sync",
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

describe("normalizeDeliveryReminderSupportFilter", () => {
  it("returns all for missing values", () => {
    expect(normalizeDeliveryReminderSupportFilter(undefined)).toBe("all")
    expect(normalizeDeliveryReminderSupportFilter(null)).toBe("all")
  })

  it("returns all for invalid values", () => {
    expect(normalizeDeliveryReminderSupportFilter("invalid")).toBe("all")
  })

  it("returns the provided valid value", () => {
    expect(normalizeDeliveryReminderSupportFilter("checkpoint_mismatch")).toBe(
      "checkpoint_mismatch"
    )
    expect(normalizeDeliveryReminderSupportFilter("workspace_missing")).toBe(
      "workspace_missing"
    )
    expect(normalizeDeliveryReminderSupportFilter("overdue")).toBe("overdue")
  })
})

describe("getDeliveryReminderSupportFilterLabel", () => {
  it("returns the expected labels", () => {
    expect(getDeliveryReminderSupportFilterLabel("all")).toBe("All recent")
    expect(getDeliveryReminderSupportFilterLabel("checkpoint_mismatch")).toBe(
      "Checkpoint mismatches"
    )
    expect(getDeliveryReminderSupportFilterLabel("workspace_missing")).toBe(
      "Missing workspaces"
    )
    expect(getDeliveryReminderSupportFilterLabel("overdue")).toBe(
      "Overdue reminders"
    )
  })
})

describe("filterDeliveryReminderSupportRecords", () => {
  const records = [
    createSupportRecord({
      checkpointState: "in_sync",
      notificationId: "notification-in-sync",
      reminderBucket: "due_today"
    }),
    createSupportRecord({
      checkpointState: "checkpoint_mismatch",
      notificationId: "notification-mismatch",
      reminderBucket: "due_today"
    }),
    createSupportRecord({
      checkpointState: "workspace_missing",
      notificationId: "notification-missing",
      reminderBucket: "due_today",
      workspaceId: "workspace-missing",
      workspaceTitle: null
    }),
    createSupportRecord({
      checkpointState: "in_sync",
      notificationId: "notification-overdue",
      notificationKind: "delivery_follow_up_overdue",
      reminderBucket: "overdue",
      workspaceLastNotificationBucket: "overdue"
    })
  ]

  it("returns all records for the all filter", () => {
    expect(filterDeliveryReminderSupportRecords(records, "all")).toEqual(records)
  })

  it("returns only checkpoint mismatches", () => {
    expect(
      filterDeliveryReminderSupportRecords(records, "checkpoint_mismatch").map(
        (record) => record.notificationId
      )
    ).toEqual(["notification-mismatch"])
  })

  it("returns only workspace missing records", () => {
    expect(
      filterDeliveryReminderSupportRecords(records, "workspace_missing").map(
        (record) => record.notificationId
      )
    ).toEqual(["notification-missing"])
  })

  it("returns only overdue reminders", () => {
    expect(
      filterDeliveryReminderSupportRecords(records, "overdue").map(
        (record) => record.notificationId
      )
    ).toEqual(["notification-overdue"])
  })
})
