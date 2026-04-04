import { describe, expect, it } from "vitest"
import {
  buildDeliveryReminderMismatchReopenActivityMetadata,
  getDeliveryReminderMismatchReopenActivityDescription,
  isDeliveryReminderMismatchReopenActivityMetadata,
  normalizeDeliveryReminderMismatchReopenNote,
  validateDeliveryReminderMismatchReopenNote
} from "./delivery-reminder-mismatch-reopen"

describe("normalizeDeliveryReminderMismatchReopenNote", () => {
  it("returns null for missing or blank values", () => {
    expect(normalizeDeliveryReminderMismatchReopenNote(undefined)).toBeNull()
    expect(normalizeDeliveryReminderMismatchReopenNote(null)).toBeNull()
    expect(normalizeDeliveryReminderMismatchReopenNote("   ")).toBeNull()
  })

  it("returns the trimmed note when present", () => {
    expect(
      normalizeDeliveryReminderMismatchReopenNote(
        "  Operator determined the earlier resolution was incorrect  "
      )
    ).toBe("Operator determined the earlier resolution was incorrect")
  })
})

describe("validateDeliveryReminderMismatchReopenNote", () => {
  it("allows empty optional notes", () => {
    expect(validateDeliveryReminderMismatchReopenNote(null)).toBeNull()
  })

  it("rejects overly long notes", () => {
    expect(validateDeliveryReminderMismatchReopenNote("x".repeat(501))).toBe(
      "reopen_note_too_long"
    )
  })

  it("accepts a valid note", () => {
    expect(
      validateDeliveryReminderMismatchReopenNote(
        "Operator determined the earlier resolution was incorrect"
      )
    ).toBeNull()
  })
})

describe("activity metadata", () => {
  const metadata = buildDeliveryReminderMismatchReopenActivityMetadata({
    reminderBucket: "overdue",
    reminderNotificationId: "notification-1",
    reopenNote: "Operator determined the earlier resolution was incorrect."
  })

  it("builds valid metadata", () => {
    expect(metadata).toEqual({
      reminderBucket: "overdue",
      reminderNotificationId: "notification-1",
      reopenNote: "Operator determined the earlier resolution was incorrect.",
      source: "reminder_mismatch_reopened"
    })
  })

  it("detects valid metadata", () => {
    expect(isDeliveryReminderMismatchReopenActivityMetadata(metadata)).toBe(true)
  })

  it("returns the expected description", () => {
    expect(
      getDeliveryReminderMismatchReopenActivityDescription(metadata)
    ).toBe(
      "Reopened resolved reminder mismatch from overdue reminder context. Operator determined the earlier resolution was incorrect."
    )
  })
})
