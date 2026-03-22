import { describe, expect, it } from "vitest"
import {
  getDeliveryWorkspaceFollowUpClasses,
  getDeliveryWorkspaceFollowUpLabel,
  normalizeDeliveryWorkspaceFollowUpStatus
} from "./delivery-workspace-follow-up"

describe("normalizeDeliveryWorkspaceFollowUpStatus", () => {
  it("defaults to none for unsupported values", () => {
    expect(normalizeDeliveryWorkspaceFollowUpStatus(undefined)).toBe("none")
    expect(normalizeDeliveryWorkspaceFollowUpStatus("unknown")).toBe("none")
  })

  it("accepts supported follow-up states", () => {
    expect(normalizeDeliveryWorkspaceFollowUpStatus("needs_follow_up")).toBe(
      "needs_follow_up"
    )
    expect(normalizeDeliveryWorkspaceFollowUpStatus("reminder_scheduled")).toBe(
      "reminder_scheduled"
    )
    expect(normalizeDeliveryWorkspaceFollowUpStatus("waiting_on_client")).toBe(
      "waiting_on_client"
    )
    expect(normalizeDeliveryWorkspaceFollowUpStatus("resolved")).toBe(
      "resolved"
    )
  })
})

describe("getDeliveryWorkspaceFollowUpLabel", () => {
  it("returns readable labels", () => {
    expect(getDeliveryWorkspaceFollowUpLabel("none")).toBe("No owner follow-up")
    expect(getDeliveryWorkspaceFollowUpLabel("needs_follow_up")).toBe(
      "Needs follow-up"
    )
    expect(getDeliveryWorkspaceFollowUpLabel("reminder_scheduled")).toBe(
      "Reminder scheduled"
    )
    expect(getDeliveryWorkspaceFollowUpLabel("waiting_on_client")).toBe(
      "Waiting on client"
    )
    expect(getDeliveryWorkspaceFollowUpLabel("resolved")).toBe("Resolved")
  })
})

describe("getDeliveryWorkspaceFollowUpClasses", () => {
  it("returns stable class strings for each status", () => {
    expect(getDeliveryWorkspaceFollowUpClasses("none")).toContain("text-slate-300")
    expect(getDeliveryWorkspaceFollowUpClasses("needs_follow_up")).toContain(
      "text-amber-100"
    )
    expect(getDeliveryWorkspaceFollowUpClasses("reminder_scheduled")).toContain(
      "text-indigo-100"
    )
    expect(getDeliveryWorkspaceFollowUpClasses("waiting_on_client")).toContain(
      "text-sky-100"
    )
    expect(getDeliveryWorkspaceFollowUpClasses("resolved")).toContain(
      "text-emerald-100"
    )
  })
})
