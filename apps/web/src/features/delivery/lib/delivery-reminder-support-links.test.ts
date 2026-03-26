import { describe, expect, it } from "vitest"
import {
  buildDeliveryReminderDashboardHref,
  buildDeliveryReminderSupportFilterHref,
  buildDeliveryWorkspaceFocusAnchorId,
  deliveryReminderFocusWorkspaceQueryParam,
  deliveryReminderSupportFilterQueryParam,
  normalizeFocusedWorkspaceId
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

describe("buildDeliveryReminderSupportFilterHref", () => {
  it("builds a delivery dashboard href that preserves the current dashboard state", () => {
    expect(
      buildDeliveryReminderSupportFilterHref({
        activity: "needs_follow_up",
        focusWorkspaceId: "workspace-123",
        reminderSupportFilter: "workspace_missing",
        sort: "latest_activity",
        status: "active"
      })
    ).toBe(
      `/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity&${deliveryReminderFocusWorkspaceQueryParam}=workspace-123&${deliveryReminderSupportFilterQueryParam}=workspace_missing`
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
