import { describe, expect, it } from "vitest"
import {
  buildDeliveryReminderDashboardHref,
  buildDeliveryWorkspaceFocusAnchorId,
  deliveryReminderFocusWorkspaceQueryParam,
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
