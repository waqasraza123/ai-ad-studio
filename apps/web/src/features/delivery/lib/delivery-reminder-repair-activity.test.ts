import { describe, expect, it } from "vitest"
import {
  buildDeliveryReminderRepairActivityMetadata,
  getDeliveryReminderRepairActivityBadgeLabel,
  getDeliveryReminderRepairActivityDescription,
  getDeliveryReminderRepairActivityTitle,
  isDeliveryReminderRepairActivityMetadata
} from "./delivery-reminder-repair-activity"

describe("buildDeliveryReminderRepairActivityMetadata", () => {
  it("builds the expected repair metadata", () => {
    expect(
      buildDeliveryReminderRepairActivityMetadata({
        clearReminderReason: "Client confirmed no further reminders needed",
        errorCode: null,
        nextFollowUpDueOn: null,
        nextFollowUpStatus: "none",
        previousFollowUpDueOn: "2026-03-27",
        previousFollowUpStatus: "reminder_scheduled",
        reminderBucket: "overdue",
        reminderNotificationId: "notification-1",
        repairAction: "clear_reminder_scheduling",
        repairOutcome: "success"
      })
    ).toEqual({
      clearReminderReason: "Client confirmed no further reminders needed",
      errorCode: null,
      nextFollowUpDueOn: null,
      nextFollowUpStatus: "none",
      previousFollowUpDueOn: "2026-03-27",
      previousFollowUpStatus: "reminder_scheduled",
      reminderBucket: "overdue",
      reminderNotificationId: "notification-1",
      repairAction: "clear_reminder_scheduling",
      repairOutcome: "success",
      source: "reminder_support_repair"
    })
  })
})

describe("isDeliveryReminderRepairActivityMetadata", () => {
  it("returns true for valid repair metadata", () => {
    expect(
      isDeliveryReminderRepairActivityMetadata({
        clearReminderReason: null,
        errorCode: "reason_required",
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
  it("returns the expected success description with a reason", () => {
    const metadata = buildDeliveryReminderRepairActivityMetadata({
      clearReminderReason: "Client confirmed no further reminders needed",
      errorCode: null,
      nextFollowUpDueOn: null,
      nextFollowUpStatus: "none",
      previousFollowUpDueOn: "2026-03-27",
      previousFollowUpStatus: "reminder_scheduled",
      reminderBucket: "overdue",
      reminderNotificationId: "notification-1",
      repairAction: "clear_reminder_scheduling",
      repairOutcome: "success"
    })

    expect(getDeliveryReminderRepairActivityBadgeLabel(metadata)).toBe(
      "Reminder repair"
    )
    expect(getDeliveryReminderRepairActivityTitle(metadata)).toBe(
      "Cleared reminder scheduling from support context"
    )
    expect(getDeliveryReminderRepairActivityDescription(metadata)).toBe(
      "Triggered from overdue reminder context. Follow-up changed from reminder_scheduled on 2026-03-27 to none. Reason: Client confirmed no further reminders needed"
    )
  })

  it("returns the expected validation failure description", () => {
    const metadata = buildDeliveryReminderRepairActivityMetadata({
      clearReminderReason: null,
      errorCode: "reason_required",
      nextFollowUpDueOn: "2026-03-27",
      nextFollowUpStatus: "reminder_scheduled",
      previousFollowUpDueOn: "2026-03-27",
      previousFollowUpStatus: "reminder_scheduled",
      reminderBucket: "due_today",
      reminderNotificationId: "notification-1",
      repairAction: "clear_reminder_scheduling",
      repairOutcome: "error"
    })

    expect(getDeliveryReminderRepairActivityDescription(metadata)).toBe(
      "Triggered from due today reminder context. Clear reminder scheduling requires an explicit operator reason."
    )
  })
})
