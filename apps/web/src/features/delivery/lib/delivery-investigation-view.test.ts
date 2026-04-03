import { describe, expect, it } from "vitest"
import {
  buildDeliveryInvestigationBaseHref,
  buildDeliveryInvestigationViewHref,
  hasPinnedDeliveryInvestigationContext,
  summarizeDeliveryInvestigationViewState,
  type DeliveryInvestigationViewState
} from "./delivery-investigation-view"

function createState(
  overrides: Partial<DeliveryInvestigationViewState> = {}
): DeliveryInvestigationViewState {
  return {
    activity: "needs_follow_up",
    focusFollowUpForm: false,
    focusReminderNotificationId: null,
    focusWorkspaceId: null,
    reminderSupportFilter: "all",
    sort: "latest_activity",
    status: "active",
    supportActivityFilter: "all",
    ...overrides
  }
}

describe("buildDeliveryInvestigationViewHref", () => {
  it("builds a canonical shareable href for the full investigation state", () => {
    expect(
      buildDeliveryInvestigationViewHref(
        createState({
          focusFollowUpForm: true,
          focusReminderNotificationId: "notification-123",
          focusWorkspaceId: "workspace-123",
          reminderSupportFilter: "checkpoint_mismatch",
          supportActivityFilter: "failed_reminder_repairs"
        })
      )
    ).toBe(
      "/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity&focus_workspace_id=workspace-123&focus_reminder_notification_id=notification-123&focus_follow_up_form=1&reminder_support_filter=checkpoint_mismatch&support_activity_filter=failed_reminder_repairs#delivery-workspace-workspace-123-follow-up"
    )
  })

  it("omits default support filters when they are all", () => {
    expect(
      buildDeliveryInvestigationViewHref(createState())
    ).toBe(
      "/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity"
    )
  })
})

describe("buildDeliveryInvestigationBaseHref", () => {
  it("keeps only the base delivery scope", () => {
    expect(
      buildDeliveryInvestigationBaseHref(
        createState({
          focusFollowUpForm: true,
          focusReminderNotificationId: "notification-123",
          focusWorkspaceId: "workspace-123",
          reminderSupportFilter: "checkpoint_mismatch",
          supportActivityFilter: "failed_reminder_repairs"
        })
      )
    ).toBe(
      "/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity"
    )
  })
})

describe("hasPinnedDeliveryInvestigationContext", () => {
  it("returns false for the base delivery scope", () => {
    expect(hasPinnedDeliveryInvestigationContext(createState())).toBe(false)
  })

  it("returns true when support filters or focus state are active", () => {
    expect(
      hasPinnedDeliveryInvestigationContext(
        createState({
          focusWorkspaceId: "workspace-123"
        })
      )
    ).toBe(true)

    expect(
      hasPinnedDeliveryInvestigationContext(
        createState({
          supportActivityFilter: "support_handoff_notes"
        })
      )
    ).toBe(true)
  })
})

describe("summarizeDeliveryInvestigationViewState", () => {
  it("returns summary labels for the pinned investigation state", () => {
    expect(
      summarizeDeliveryInvestigationViewState(
        createState({
          focusFollowUpForm: true,
          focusReminderNotificationId: "notification-123",
          focusWorkspaceId: "workspace-123",
          reminderSupportFilter: "checkpoint_mismatch",
          supportActivityFilter: "failed_reminder_repairs"
        })
      )
    ).toEqual([
      "Support activity: Failed reminder repairs",
      "Reminder support: Checkpoint mismatches",
      "Focused workspace: workspace-123",
      "Focused follow-up form",
      "Focused reminder: notification-123"
    ])
  })
})
