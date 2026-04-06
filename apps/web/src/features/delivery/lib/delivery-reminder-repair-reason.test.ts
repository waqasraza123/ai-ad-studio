import { describe, expect, it } from "vitest"
import {
  normalizeDeliveryReminderClearReason,
  validateDeliveryReminderClearReason
} from "./delivery-reminder-repair-reason"

describe("normalizeDeliveryReminderClearReason", () => {
  it("returns null for missing values", () => {
    expect(normalizeDeliveryReminderClearReason(undefined)).toBeNull()
    expect(normalizeDeliveryReminderClearReason(null)).toBeNull()
  })

  it("returns null for blank values", () => {
    expect(normalizeDeliveryReminderClearReason("")).toBeNull()
    expect(normalizeDeliveryReminderClearReason("   ")).toBeNull()
  })

  it("returns the trimmed reason when present", () => {
    expect(
      normalizeDeliveryReminderClearReason("  Client asked to stop reminders  ")
    ).toBe("Client asked to stop reminders")
  })
})

describe("validateDeliveryReminderClearReason", () => {
  it("requires a reason", () => {
    expect(validateDeliveryReminderClearReason(null)).toBe("reason_required")
  })

  it("rejects overly long reasons", () => {
    expect(validateDeliveryReminderClearReason("x".repeat(281))).toBe(
      "reason_too_long"
    )
  })

  it("rejects disallowed wording", () => {
    expect(validateDeliveryReminderClearReason("porn headline")).toBe(
      "disallowed_wording"
    )
  })

  it("accepts a valid reason", () => {
    expect(
      validateDeliveryReminderClearReason("Client confirmed no follow-up needed")
    ).toBeNull()
  })
})
