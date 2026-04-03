import { describe, expect, it } from "vitest"
import {
  buildDeliveryReminderRepairActivityMetadata,
  getDeliveryReminderRepairActivityBadgeLabel,
  getDeliveryReminderRepairActivityDescription,
  getDeliveryReminderRepairActivityTitle,
  isDeliveryReminderRepairActivityMetadata,
  normalizeReminderBucketForRepairActivity,
  normalizeReminderNotificationIdForRepairActivity
} from "./delivery-reminder-repair-activity"

describe("buildDeliveryReminderRepairActivityMetadata", () => {
  it("builds the expected repair metadata", () => {
    expect(
      buildDeliveryReminderRepairActivityMetadata({
        nextFollowUpDueOn: "2026-03-28",
        nextFollowUpStatus: "reminder_scheduled",
        previousFollowUpDueOn: "2026-03-27",
        previousFollowUpStatus: "reminder_scheduled",
        reminderBucket: "overdue",
        reminderNotificationId: "notification-1",
        repairAction: "reschedule_tomorrow",
        repairOutcome: "success"
      })
    ).toEqual({
      nextFollowUpDueOn: "2026-03-28",
      nextFollowUpStatus: "reminder_scheduled",
      previousFollowUpDueOn: "2026-03-27",
      previousFollowUpStatus: "reminder_scheduled",
      reminderBucket: "overdue",
      reminderNotificationId: "notification-1",
      repairAction: "reschedule_tomorrow",
      repairOutcome: "success",
      source: "reminder_support_repair"
    })
  })
})

describe("isDeliveryReminderRepairActivityMetadata", () => {
  it("returns true for valid repair metadata", () => {
    expect(
      isDeliveryReminderRepairActivityMetadata({
        nextFollowUpDueOn: "2026-03-28",
        nextFollowUpStatus: "reminder_scheduled",
        previousFollowUpDueOn: "2026-03-27",
        previousFollowUpStatus: "reminder_scheduled",
        reminderBucket: "due_today",
        reminderNotificationId: "notification-1",
        repairAction: "reschedule_tomorrow",
        repairOutcome: "success",
        source: "reminder_support_repair"
      })
    ).toBe(true)
  })

  it("returns false for unrelated metadata", () => {
    expect(
      isDeliveryReminderRepairActivityMetadata({
        source: "something_else"
      })
    ).toBe(false)
  })
})

describe("presentation helpers", () => {
  const metadata = buildDeliveryReminderRepairActivityMetadata({
    nextFollowUpDueOn: "2026-03-28",
    nextFollowUpStatus: "reminder_scheduled",
    previousFollowUpDueOn: "2026-03-27",
    previousFollowUpStatus: "reminder_scheduled",
    reminderBucket: "overdue",
    reminderNotificationId: "notification-1",
    repairAction: "reschedule_tomorrow",
    repairOutcome: "success"
  })

  it("returns the expected badge label", () => {
    expect(getDeliveryReminderRepairActivityBadgeLabel(metadata)).toBe(
      "Reminder repair"
    )
  })

  it("returns the expected title", () => {
    expect(getDeliveryReminderRepairActivityTitle(metadata)).toBe(
      "Rescheduled reminder follow-up from support context"
    )
  })

  it("returns the expected description", () => {
    expect(getDeliveryReminderRepairActivityDescription(metadata)).toBe(
      "Triggered from overdue reminder context. Follow-up changed from reminder_scheduled on 2026-03-27 to reminder_scheduled on 2026-03-28."
    )
  })
})

describe("normalizers", () => {
  it("normalizes reminder bucket values", () => {
    expect(normalizeReminderBucketForRepairActivity("due_today")).toBe("due_today")
    expect(normalizeReminderBucketForRepairActivity("overdue")).toBe("overdue")
    expect(normalizeReminderBucketForRepairActivity("invalid")).toBeNull()
  })

  it("normalizes reminder notification ids", () => {
    expect(
      normalizeReminderNotificationIdForRepairActivity("notification-1")
    ).toBe("notification-1")
    expect(normalizeReminderNotificationIdForRepairActivity("")).toBeNull()
    expect(normalizeReminderNotificationIdForRepairActivity(null)).toBeNull()
  })
})
