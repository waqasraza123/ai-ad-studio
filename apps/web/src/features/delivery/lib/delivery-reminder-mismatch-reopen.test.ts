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

  it("rejects disallowed wording", () => {
    expect(validateDeliveryReminderMismatchReopenNote("nude wording")).toBe(
      "disallowed_wording"
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
  it("builds valid success metadata", () => {
    const metadata = buildDeliveryReminderMismatchReopenActivityMetadata({
      errorCode: null,
      reminderBucket: "overdue",
      reminderNotificationId: "notification-1",
      reopenNote: "Operator determined the earlier resolution was incorrect.",
      reopenOutcome: "success"
    })

    expect(metadata).toEqual({
      errorCode: null,
      reminderBucket: "overdue",
      reminderNotificationId: "notification-1",
      reopenNote: "Operator determined the earlier resolution was incorrect.",
      reopenOutcome: "success",
      source: "reminder_mismatch_reopened"
    })

    expect(isDeliveryReminderMismatchReopenActivityMetadata(metadata)).toBe(true)

    expect(
      getDeliveryReminderMismatchReopenActivityDescription(metadata)
    ).toBe(
      "Reopened resolved reminder mismatch from overdue reminder context. Operator determined the earlier resolution was incorrect."
    )
  })

  it("builds valid failed metadata", () => {
    const metadata = buildDeliveryReminderMismatchReopenActivityMetadata({
      errorCode: "not_currently_resolved",
      reminderBucket: "due_today",
      reminderNotificationId: "notification-1",
      reopenNote: null,
      reopenOutcome: "error"
    })

    expect(isDeliveryReminderMismatchReopenActivityMetadata(metadata)).toBe(true)

    expect(
      getDeliveryReminderMismatchReopenActivityDescription(metadata)
    ).toBe(
      "Attempted to reopen a resolved mismatch from due today reminder context, but that reminder is no longer currently resolved for this workspace."
    )
  })
})
