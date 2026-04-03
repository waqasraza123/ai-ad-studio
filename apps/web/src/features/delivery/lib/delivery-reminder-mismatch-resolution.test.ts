import { describe, expect, it } from "vitest"
import {
  buildDeliveryReminderMismatchResolutionActivityMetadata,
  getDeliveryReminderMismatchResolutionActivityDescription,
  isDeliveryReminderMismatchResolutionActivityMetadata,
  isDeliveryReminderMismatchResolved,
  normalizeDeliveryReminderMismatchResolutionNote,
  validateDeliveryReminderMismatchResolutionNote
} from "./delivery-reminder-mismatch-resolution"

describe("normalizeDeliveryReminderMismatchResolutionNote", () => {
  it("returns null for missing or blank values", () => {
    expect(normalizeDeliveryReminderMismatchResolutionNote(undefined)).toBeNull()
    expect(normalizeDeliveryReminderMismatchResolutionNote(null)).toBeNull()
    expect(normalizeDeliveryReminderMismatchResolutionNote("   ")).toBeNull()
  })

  it("returns the trimmed note when present", () => {
    expect(
      normalizeDeliveryReminderMismatchResolutionNote(
        "  Operator confirmed the checkpoint mismatch was already handled  "
      )
    ).toBe("Operator confirmed the checkpoint mismatch was already handled")
  })
})

describe("validateDeliveryReminderMismatchResolutionNote", () => {
  it("allows empty optional notes", () => {
    expect(validateDeliveryReminderMismatchResolutionNote(null)).toBeNull()
  })

  it("rejects overly long notes", () => {
    expect(
      validateDeliveryReminderMismatchResolutionNote("x".repeat(501))
    ).toBe("resolution_note_too_long")
  })

  it("accepts a valid note", () => {
    expect(
      validateDeliveryReminderMismatchResolutionNote(
        "Operator confirmed the mismatch is already handled"
      )
    ).toBeNull()
  })
})

describe("isDeliveryReminderMismatchResolved", () => {
  it("returns true when the workspace resolution matches the reminder notification", () => {
    expect(
      isDeliveryReminderMismatchResolved({
        reminderNotificationId: "notification-1",
        workspace: {
          reminder_mismatch_resolved_notification_id: "notification-1"
        }
      })
    ).toBe(true)
  })

  it("returns false when the resolution does not match the notification", () => {
    expect(
      isDeliveryReminderMismatchResolved({
        reminderNotificationId: "notification-1",
        workspace: {
          reminder_mismatch_resolved_notification_id: "notification-2"
        }
      })
    ).toBe(false)
  })
})

describe("activity metadata", () => {
  const metadata = buildDeliveryReminderMismatchResolutionActivityMetadata({
    reminderBucket: "overdue",
    reminderNotificationId: "notification-1",
    resolutionNote: "Operator confirmed the mismatch is already handled."
  })

  it("builds valid metadata", () => {
    expect(metadata).toEqual({
      reminderBucket: "overdue",
      reminderNotificationId: "notification-1",
      resolutionNote: "Operator confirmed the mismatch is already handled.",
      source: "reminder_mismatch_resolution"
    })
  })

  it("detects valid metadata", () => {
    expect(
      isDeliveryReminderMismatchResolutionActivityMetadata(metadata)
    ).toBe(true)
  })

  it("returns the expected description", () => {
    expect(
      getDeliveryReminderMismatchResolutionActivityDescription(metadata)
    ).toBe(
      "Resolved reminder mismatch from overdue reminder context. Operator confirmed the mismatch is already handled."
    )
  })
})
