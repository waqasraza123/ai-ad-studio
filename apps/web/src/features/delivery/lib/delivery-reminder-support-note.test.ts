import { describe, expect, it } from "vitest"
import {
  buildDeliveryReminderSupportNoteActivityMetadata,
  getDeliveryReminderSupportNoteActivityBadgeLabel,
  getDeliveryReminderSupportNoteActivityDescription,
  getDeliveryReminderSupportNoteActivityTitle,
  isDeliveryReminderSupportNoteActivityMetadata,
  normalizeDeliveryReminderSupportHandoffNote,
  validateDeliveryReminderSupportHandoffNote
} from "./delivery-reminder-support-note"

describe("normalizeDeliveryReminderSupportHandoffNote", () => {
  it("returns null for missing or blank values", () => {
    expect(normalizeDeliveryReminderSupportHandoffNote(undefined)).toBeNull()
    expect(normalizeDeliveryReminderSupportHandoffNote(null)).toBeNull()
    expect(normalizeDeliveryReminderSupportHandoffNote("   ")).toBeNull()
  })

  it("returns the trimmed note when present", () => {
    expect(
      normalizeDeliveryReminderSupportHandoffNote("  Waiting on revised assets  ")
    ).toBe("Waiting on revised assets")
  })
})

describe("validateDeliveryReminderSupportHandoffNote", () => {
  it("allows empty optional notes", () => {
    expect(validateDeliveryReminderSupportHandoffNote(null)).toBeNull()
  })

  it("rejects overly long notes", () => {
    expect(validateDeliveryReminderSupportHandoffNote("x".repeat(501))).toBe(
      "handoff_note_too_long"
    )
  })

  it("accepts a valid note", () => {
    expect(
      validateDeliveryReminderSupportHandoffNote("Waiting on revised assets")
    ).toBeNull()
  })
})

describe("support note activity metadata", () => {
  const metadata = buildDeliveryReminderSupportNoteActivityMetadata({
    linkedRepairAction: "clear_reminder_scheduling",
    note: "Client asked to pause follow-up until next quarter.",
    reminderBucket: "overdue",
    reminderNotificationId: "notification-1"
  })

  it("builds valid metadata", () => {
    expect(metadata).toEqual({
      linkedRepairAction: "clear_reminder_scheduling",
      note: "Client asked to pause follow-up until next quarter.",
      reminderBucket: "overdue",
      reminderNotificationId: "notification-1",
      source: "reminder_support_note"
    })
  })

  it("detects valid metadata", () => {
    expect(isDeliveryReminderSupportNoteActivityMetadata(metadata)).toBe(true)
  })

  it("returns the expected presentation values", () => {
    expect(getDeliveryReminderSupportNoteActivityBadgeLabel()).toBe(
      "Support handoff"
    )
    expect(getDeliveryReminderSupportNoteActivityTitle(metadata)).toBe(
      "Saved support handoff note after clearing reminder scheduling"
    )
    expect(getDeliveryReminderSupportNoteActivityDescription(metadata)).toBe(
      "Added from overdue reminder context. Client asked to pause follow-up until next quarter."
    )
  })
})
