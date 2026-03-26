import { describe, expect, it } from "vitest"
import {
  buildDeliveryReminderRepairValues,
  normalizeDeliveryReminderRepairAction
} from "./delivery-reminder-repair"

describe("normalizeDeliveryReminderRepairAction", () => {
  it("returns null for missing values", () => {
    expect(normalizeDeliveryReminderRepairAction(undefined)).toBeNull()
    expect(normalizeDeliveryReminderRepairAction(null)).toBeNull()
  })

  it("returns null for invalid values", () => {
    expect(normalizeDeliveryReminderRepairAction("invalid")).toBeNull()
  })

  it("returns the supported repair actions", () => {
    expect(normalizeDeliveryReminderRepairAction("reschedule_tomorrow")).toBe(
      "reschedule_tomorrow"
    )
    expect(
      normalizeDeliveryReminderRepairAction("clear_reminder_scheduling")
    ).toBe("clear_reminder_scheduling")
  })
})

describe("buildDeliveryReminderRepairValues", () => {
  it("builds a reminder_scheduled patch for tomorrow", () => {
    expect(
      buildDeliveryReminderRepairValues({
        action: "reschedule_tomorrow",
        now: new Date("2026-03-26T09:30:00.000Z")
      })
    ).toEqual({
      followUpDueOn: "2026-03-27",
      followUpStatus: "reminder_scheduled"
    })
  })

  it("builds a cleared reminder scheduling patch", () => {
    expect(
      buildDeliveryReminderRepairValues({
        action: "clear_reminder_scheduling",
        now: new Date("2026-03-26T09:30:00.000Z")
      })
    ).toEqual({
      followUpDueOn: null,
      followUpStatus: "none"
    })
  })
})
