import { describe, expect, it } from "vitest"
import {
  buildDeliveryReminderNotificationBody,
  buildDeliveryReminderNotificationKind,
  buildDeliveryReminderNotificationTitle,
  shouldGenerateDeliveryReminderNotification
} from "./delivery-follow-up-reminder-notification"

describe("shouldGenerateDeliveryReminderNotification", () => {
  it("returns false when the same bucket was already notified today", () => {
    expect(
      shouldGenerateDeliveryReminderNotification({
        followUpLastNotificationBucket: "due_today",
        followUpLastNotificationDate: "2026-03-23",
        reminderBucket: "due_today",
        todayDateKey: "2026-03-23"
      })
    ).toBe(false)
  })

  it("returns true when the date changed", () => {
    expect(
      shouldGenerateDeliveryReminderNotification({
        followUpLastNotificationBucket: "due_today",
        followUpLastNotificationDate: "2026-03-22",
        reminderBucket: "due_today",
        todayDateKey: "2026-03-23"
      })
    ).toBe(true)
  })

  it("returns true when the bucket changed on the same day", () => {
    expect(
      shouldGenerateDeliveryReminderNotification({
        followUpLastNotificationBucket: "due_today",
        followUpLastNotificationDate: "2026-03-23",
        reminderBucket: "overdue",
        todayDateKey: "2026-03-23"
      })
    ).toBe(true)
  })
})

describe("delivery reminder notification builders", () => {
  it("builds the expected kind and title", () => {
    expect(buildDeliveryReminderNotificationKind("due_today")).toBe(
      "delivery_follow_up_due_today"
    )
    expect(buildDeliveryReminderNotificationKind("overdue")).toBe(
      "delivery_follow_up_overdue"
    )

    expect(buildDeliveryReminderNotificationTitle("due_today")).toBe(
      "Delivery follow-up due today"
    )
    expect(buildDeliveryReminderNotificationTitle("overdue")).toBe(
      "Delivery follow-up overdue"
    )
  })

  it("builds a body with due date and note", () => {
    expect(
      buildDeliveryReminderNotificationBody({
        followUpDueOn: "2026-03-23",
        followUpNote: "Send a quick WhatsApp follow-up.",
        reminderBucket: "due_today",
        workspaceTitle: "Spring campaign delivery"
      })
    ).toBe(
      "Delivery follow-up is due today for Spring campaign delivery. Scheduled date: 2026-03-23. Send a quick WhatsApp follow-up."
    )
  })

  it("builds a body without note when none exists", () => {
    expect(
      buildDeliveryReminderNotificationBody({
        followUpDueOn: "2026-03-22",
        followUpNote: null,
        reminderBucket: "overdue",
        workspaceTitle: "Launch delivery"
      })
    ).toBe(
      "Delivery follow-up is overdue for Launch delivery. Scheduled date: 2026-03-22."
    )
  })
})
