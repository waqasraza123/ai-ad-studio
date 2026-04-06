import { describe, expect, it } from "vitest"
import { MODEST_WORDING_ERROR_MESSAGE } from "../../../lib/modest-wording/index"
import {
  buildDeliveryReminderMismatchOutcomeHref,
  getDeliveryReminderMismatchLifecycleMessage,
  normalizeDeliveryReminderMismatchLifecycleOutcome
} from "./delivery-reminder-mismatch-outcome"

describe("buildDeliveryReminderMismatchOutcomeHref", () => {
  it("builds a success href while preserving the hash", () => {
    expect(
      buildDeliveryReminderMismatchOutcomeHref({
        action: "reopened",
        baseHref:
          "/dashboard/delivery?activity=needs_follow_up#delivery-workspace-workspace-1-follow-up",
        notificationId: "notification-1",
        status: "success",
        workspaceId: "workspace-1"
      })
    ).toBe(
      "/dashboard/delivery?activity=needs_follow_up&reminder_mismatch_action=reopened&reminder_mismatch_status=success&reminder_mismatch_workspace_id=workspace-1&reminder_mismatch_notification_id=notification-1#delivery-workspace-workspace-1-follow-up"
    )
  })

  it("includes an error code when present", () => {
    expect(
      buildDeliveryReminderMismatchOutcomeHref({
        action: "reopened",
        baseHref: "/dashboard/delivery",
        errorCode: "not_currently_resolved",
        notificationId: "notification-1",
        status: "error",
        workspaceId: "workspace-1"
      })
    ).toBe(
      "/dashboard/delivery?reminder_mismatch_action=reopened&reminder_mismatch_status=error&reminder_mismatch_workspace_id=workspace-1&reminder_mismatch_notification_id=notification-1&reminder_mismatch_error_code=not_currently_resolved"
    )
  })
})

describe("normalizeDeliveryReminderMismatchLifecycleOutcome", () => {
  it("returns null when required fields are missing", () => {
    expect(
      normalizeDeliveryReminderMismatchLifecycleOutcome({
        action: "resolved",
        notificationId: "notification-1",
        status: "success",
        workspaceId: null
      })
    ).toBeNull()
  })

  it("returns the normalized outcome when valid", () => {
    expect(
      normalizeDeliveryReminderMismatchLifecycleOutcome({
        action: "reopened",
        errorCode: "reopen_note_too_long",
        notificationId: " notification-1 ",
        status: "error",
        workspaceId: " workspace-1 "
      })
    ).toEqual({
      action: "reopened",
      errorCode: "reopen_note_too_long",
      notificationId: "notification-1",
      status: "error",
      workspaceId: "workspace-1"
    })
  })
})

describe("getDeliveryReminderMismatchLifecycleMessage", () => {
  it("returns the expected success messages", () => {
    expect(
      getDeliveryReminderMismatchLifecycleMessage({
        action: "resolved",
        errorCode: null,
        notificationId: "notification-1",
        status: "success",
        workspaceId: "workspace-1"
      })
    ).toBe(
      "Marked reminder mismatch as resolved for workspace workspace-1."
    )

    expect(
      getDeliveryReminderMismatchLifecycleMessage({
        action: "reopened",
        errorCode: null,
        notificationId: "notification-1",
        status: "success",
        workspaceId: "workspace-1"
      })
    ).toBe(
      "Reopened resolved reminder mismatch for workspace workspace-1."
    )
  })

  it("returns the expected error message", () => {
    expect(
      getDeliveryReminderMismatchLifecycleMessage({
        action: "reopened",
        errorCode: "not_currently_resolved",
        notificationId: "notification-1",
        status: "error",
        workspaceId: "workspace-1"
      })
    ).toBe(
      "This reminder mismatch is no longer currently resolved for the selected notification."
    )
  })

  it("returns the shared wording moderation message", () => {
    expect(
      getDeliveryReminderMismatchLifecycleMessage({
        action: "resolved",
        errorCode: "disallowed_wording",
        notificationId: "notification-1",
        status: "error",
        workspaceId: "workspace-1"
      })
    ).toBe(MODEST_WORDING_ERROR_MESSAGE)
  })
})
