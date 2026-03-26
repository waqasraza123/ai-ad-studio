import { describe, expect, it } from "vitest"
import {
  buildDeliveryReminderDashboardHref,
  buildDeliveryReminderFollowUpFormHref,
  buildDeliveryReminderSupportFilterHref,
  buildDeliveryWorkspaceFocusAnchorId,
  buildDeliveryWorkspaceFollowUpAnchorId,
  deliveryReminderFollowUpFormFocusQueryParam,
  deliveryReminderFocusWorkspaceQueryParam,
  deliveryReminderNotificationIdQueryParam,
  deliveryReminderSupportFilterQueryParam,
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

  it("trims surrounding whitespace", () => {
    expect(buildDeliveryWorkspaceFocusAnchorId("  workspace-123  ")).toBe(
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

  it("preserves a non-default support filter when requested", () => {
    expect(
      buildDeliveryReminderDashboardHref("workspace-123", {
        reminderSupportFilter: "overdue"
      })
    ).toBe(
      `/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity&${deliveryReminderFocusWorkspaceQueryParam}=workspace-123&${deliveryReminderSupportFilterQueryParam}=overdue#delivery-workspace-workspace-123`
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

  it("preserves a non-default support filter when requested", () => {
    expect(
      buildDeliveryReminderFollowUpFormHref({
        notificationId: "notification-123",
        reminderSupportFilter: "checkpoint_mismatch",
        workspaceId: "workspace-123"
      })
    ).toBe(
      `/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity&${deliveryReminderFocusWorkspaceQueryParam}=workspace-123&${deliveryReminderFollowUpFormFocusQueryParam}=1&${deliveryReminderNotificationIdQueryParam}=notification-123&${deliveryReminderSupportFilterQueryParam}=checkpoint_mismatch#delivery-workspace-workspace-123-follow-up`
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
        status: "active"
      })
    ).toBe(
      `/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity&${deliveryReminderFocusWorkspaceQueryParam}=workspace-123&${deliveryReminderFollowUpFormFocusQueryParam}=1&${deliveryReminderNotificationIdQueryParam}=notification-123&${deliveryReminderSupportFilterQueryParam}=workspace_missing`
    )
  })

  it("omits the support filter query param for the all filter", () => {
    expect(
      buildDeliveryReminderSupportFilterHref({
        activity: "needs_follow_up",
        reminderSupportFilter: "all",
        sort: "latest_activity",
        status: "active"
      })
    ).toBe(
      "/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity"
    )
  })
})

describe("normalizeFocusedWorkspaceId", () => {
  it("returns null for missing values", () => {
    expect(normalizeFocusedWorkspaceId(undefined)).toBeNull()
    expect(normalizeFocusedWorkspaceId(null)).toBeNull()
  })

  it("returns null for blank values", () => {
    expect(normalizeFocusedWorkspaceId("")).toBeNull()
    expect(normalizeFocusedWorkspaceId("   ")).toBeNull()
  })

  it("returns the trimmed workspace id when present", () => {
    expect(normalizeFocusedWorkspaceId("  workspace-123  ")).toBe(
      "workspace-123"
    )
  })
})

describe("normalizeFollowUpFormFocus", () => {
  it("returns false for missing or invalid values", () => {
    expect(normalizeFollowUpFormFocus(undefined)).toBe(false)
    expect(normalizeFollowUpFormFocus(null)).toBe(false)
    expect(normalizeFollowUpFormFocus("0")).toBe(false)
  })

  it("returns true for supported truthy values", () => {
    expect(normalizeFollowUpFormFocus("1")).toBe(true)
    expect(normalizeFollowUpFormFocus("true")).toBe(true)
    expect(normalizeFollowUpFormFocus(" TRUE ")).toBe(true)
  })
})

describe("normalizeFocusedReminderNotificationId", () => {
  it("returns null for missing values", () => {
    expect(normalizeFocusedReminderNotificationId(undefined)).toBeNull()
    expect(normalizeFocusedReminderNotificationId(null)).toBeNull()
    expect(normalizeFocusedReminderNotificationId("   ")).toBeNull()
  })

  it("returns the trimmed notification id when present", () => {
    expect(normalizeFocusedReminderNotificationId("  notification-123  ")).toBe(
      "notification-123"
    )
  })
})
