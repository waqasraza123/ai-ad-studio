import { describe, expect, it } from "vitest"
import {
  buildDeliveryReminderDashboardHref,
  buildDeliveryReminderFollowUpFormHref,
  buildDeliveryReminderSupportFilterHref,
  buildDeliverySupportActivityFilterHref,
  buildDeliveryWorkspaceFocusAnchorId,
  buildDeliveryWorkspaceFollowUpAnchorId,
  deliveryReminderFollowUpFormFocusQueryParam,
  deliveryReminderFocusWorkspaceQueryParam,
  deliveryReminderNotificationIdQueryParam,
  deliveryReminderSupportFilterQueryParam,
  deliverySupportActivityFilterQueryParam,
  normalizeFocusedReminderNotificationId,
  normalizeFocusedWorkspaceId,
  normalizeFollowUpFormFocus
} from "./delivery-reminder-support-links"

describe("buildDeliveryWorkspaceFocusAnchorId", () => {
  it("builds a stable anchor id for a workspace", () => {
    expect(buildDeliveryWorkspaceFocusAnchorId("workspace-123")).toBe(
      "delivery-workspace-workspace-123"
    )
  })
})

describe("buildDeliveryWorkspaceFollowUpAnchorId", () => {
  it("builds a stable follow-up anchor id for a workspace", () => {
    expect(buildDeliveryWorkspaceFollowUpAnchorId("workspace-123")).toBe(
      "delivery-workspace-workspace-123-follow-up"
    )
  })
})

describe("buildDeliveryReminderDashboardHref", () => {
  it("builds a filtered delivery dashboard href with a focus anchor", () => {
    expect(buildDeliveryReminderDashboardHref("workspace-123")).toBe(
      `/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity&${deliveryReminderFocusWorkspaceQueryParam}=workspace-123#delivery-workspace-workspace-123`
    )
  })

  it("preserves non-default reminder and support activity filters", () => {
    expect(
      buildDeliveryReminderDashboardHref("workspace-123", {
        reminderSupportFilter: "overdue",
        supportActivityFilter: "failed_reminder_repairs"
      })
    ).toBe(
      `/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity&${deliveryReminderFocusWorkspaceQueryParam}=workspace-123&${deliveryReminderSupportFilterQueryParam}=overdue&${deliverySupportActivityFilterQueryParam}=failed_reminder_repairs#delivery-workspace-workspace-123`
    )
  })
})

describe("buildDeliveryReminderFollowUpFormHref", () => {
  it("builds a follow-up-form-focused href with reminder notification context", () => {
    expect(
      buildDeliveryReminderFollowUpFormHref({
        notificationId: "notification-123",
        workspaceId: "workspace-123"
      })
    ).toBe(
      `/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity&${deliveryReminderFocusWorkspaceQueryParam}=workspace-123&${deliveryReminderFollowUpFormFocusQueryParam}=1&${deliveryReminderNotificationIdQueryParam}=notification-123#delivery-workspace-workspace-123-follow-up`
    )
  })

  it("preserves the support activity filter when requested", () => {
    expect(
      buildDeliveryReminderFollowUpFormHref({
        notificationId: "notification-123",
        reminderSupportFilter: "checkpoint_mismatch",
        supportActivityFilter: "support_handoff_notes",
        workspaceId: "workspace-123"
      })
    ).toBe(
      `/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity&${deliveryReminderFocusWorkspaceQueryParam}=workspace-123&${deliveryReminderFollowUpFormFocusQueryParam}=1&${deliveryReminderNotificationIdQueryParam}=notification-123&${deliveryReminderSupportFilterQueryParam}=checkpoint_mismatch&${deliverySupportActivityFilterQueryParam}=support_handoff_notes#delivery-workspace-workspace-123-follow-up`
    )
  })
})

describe("buildDeliveryReminderSupportFilterHref", () => {
  it("builds a delivery dashboard href that preserves the current dashboard state", () => {
    expect(
      buildDeliveryReminderSupportFilterHref({
        activity: "needs_follow_up",
        focusFollowUpForm: true,
        focusReminderNotificationId: "notification-123",
        focusWorkspaceId: "workspace-123",
        reminderSupportFilter: "workspace_missing",
        sort: "latest_activity",
        status: "active",
        supportActivityFilter: "failed_reminder_repairs"
      })
    ).toBe(
      `/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity&${deliveryReminderFocusWorkspaceQueryParam}=workspace-123&${deliveryReminderFollowUpFormFocusQueryParam}=1&${deliveryReminderNotificationIdQueryParam}=notification-123&${deliveryReminderSupportFilterQueryParam}=workspace_missing&${deliverySupportActivityFilterQueryParam}=failed_reminder_repairs`
    )
  })
})

describe("buildDeliverySupportActivityFilterHref", () => {
  it("builds a delivery dashboard href that preserves reminder support context", () => {
    expect(
      buildDeliverySupportActivityFilterHref({
        activity: "needs_follow_up",
        focusFollowUpForm: true,
        focusReminderNotificationId: "notification-123",
        focusWorkspaceId: "workspace-123",
        reminderSupportFilter: "checkpoint_mismatch",
        sort: "latest_activity",
        status: "active",
        supportActivityFilter: "support_handoff_notes"
      })
    ).toBe(
      `/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity&${deliveryReminderFocusWorkspaceQueryParam}=workspace-123&${deliveryReminderFollowUpFormFocusQueryParam}=1&${deliveryReminderNotificationIdQueryParam}=notification-123&${deliveryReminderSupportFilterQueryParam}=checkpoint_mismatch&${deliverySupportActivityFilterQueryParam}=support_handoff_notes`
    )
  })

  it("omits the support activity filter param for all", () => {
    expect(
      buildDeliverySupportActivityFilterHref({
        activity: "needs_follow_up",
        sort: "latest_activity",
        status: "active",
        supportActivityFilter: "all"
      })
    ).toBe(
      "/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity"
    )
  })
})

describe("normalizeFocusedWorkspaceId", () => {
  it("returns the trimmed workspace id when present", () => {
    expect(normalizeFocusedWorkspaceId("  workspace-123  ")).toBe(
      "workspace-123"
    )
  })
})

describe("normalizeFollowUpFormFocus", () => {
  it("returns true for supported truthy values", () => {
    expect(normalizeFollowUpFormFocus("1")).toBe(true)
    expect(normalizeFollowUpFormFocus("true")).toBe(true)
  })
})

describe("normalizeFocusedReminderNotificationId", () => {
  it("returns the trimmed notification id when present", () => {
    expect(normalizeFocusedReminderNotificationId("  notification-123  ")).toBe(
      "notification-123"
    )
  })
})
