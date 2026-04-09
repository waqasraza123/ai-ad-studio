import { describe, expect, it } from "vitest"
import {
  DEFAULT_DELIVERY_WORKSPACE_VISIBLE_COUNT,
  DELIVERY_WORKSPACE_VISIBLE_COUNT_STEP,
  getNextDeliveryWorkspaceVisibleCount,
  resolveDeliveryWorkspaceVisibleCount
} from "./delivery-workspace-list-window"

describe("resolveDeliveryWorkspaceVisibleCount", () => {
  it("uses the default visible count when no explicit request is present", () => {
    expect(
      resolveDeliveryWorkspaceVisibleCount({
        totalCount: 20
      })
    ).toBe(DEFAULT_DELIVERY_WORKSPACE_VISIBLE_COUNT)
  })

  it("clamps to the available total count", () => {
    expect(
      resolveDeliveryWorkspaceVisibleCount({
        requestedCount: 99,
        totalCount: 5
      })
    ).toBe(5)
  })

  it("keeps a focused workspace visible by expanding to the next step", () => {
    expect(
      resolveDeliveryWorkspaceVisibleCount({
        focusedWorkspaceIndex: 11,
        totalCount: 20
      })
    ).toBe(DELIVERY_WORKSPACE_VISIBLE_COUNT_STEP * 2)
  })

  it("returns zero when there are no workspaces", () => {
    expect(
      resolveDeliveryWorkspaceVisibleCount({
        requestedCount: 8,
        totalCount: 0
      })
    ).toBe(0)
  })
})

describe("getNextDeliveryWorkspaceVisibleCount", () => {
  it("advances by the configured step without exceeding the total count", () => {
    expect(
      getNextDeliveryWorkspaceVisibleCount({
        currentCount: 8,
        totalCount: 18
      })
    ).toBe(16)

    expect(
      getNextDeliveryWorkspaceVisibleCount({
        currentCount: 16,
        totalCount: 18
      })
    ).toBe(18)
  })
})
