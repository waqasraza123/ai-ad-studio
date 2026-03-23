import { describe, expect, it } from "vitest"
import {
  getDeliveryWorkspaceFollowUpClasses,
  getDeliveryWorkspaceFollowUpLabel,
  getDeliveryWorkspaceReminderBucketClasses,
  getDeliveryWorkspaceReminderBucketLabel,
  hasDeliveryWorkspaceRecipientActivity,
  isDeliveryWorkspaceFollowUpUnresolved,
  normalizeDeliveryWorkspaceFollowUpStatus,
  resolveDeliveryWorkspaceReminderBucket,
  resolveEffectiveDeliveryWorkspaceFollowUpStatus
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

describe("hasDeliveryWorkspaceRecipientActivity", () => {
  it("returns true for view or download activity", () => {
    expect(
      hasDeliveryWorkspaceRecipientActivity({
        acknowledgedAt: null,
        acknowledgedBy: null,
        acknowledgementNote: null,
        deliveredAt: null,
        downloadCount: 0,
        lastDownloadedAt: null,
        lastViewedAt: "2026-03-23T10:00:00.000Z"
      })
    ).toBe(true)

    expect(
      hasDeliveryWorkspaceRecipientActivity({
        acknowledgedAt: null,
        acknowledgedBy: null,
        acknowledgementNote: null,
        deliveredAt: null,
        downloadCount: 1,
        lastDownloadedAt: "2026-03-23T11:00:00.000Z",
        lastViewedAt: null
      })
    ).toBe(true)
  })

  it("returns false when there is no client activity", () => {
    expect(
      hasDeliveryWorkspaceRecipientActivity({
        acknowledgedAt: null,
        acknowledgedBy: null,
        acknowledgementNote: null,
        deliveredAt: "2026-03-23T09:00:00.000Z",
        downloadCount: 0,
        lastDownloadedAt: null,
        lastViewedAt: null
      })
    ).toBe(false)
  })
})

describe("resolveEffectiveDeliveryWorkspaceFollowUpStatus", () => {
  it("keeps explicit owner follow-up states", () => {
    expect(
      resolveEffectiveDeliveryWorkspaceFollowUpStatus({
        activitySummary: {
          acknowledgedAt: null,
          acknowledgedBy: null,
          acknowledgementNote: null,
          deliveredAt: "2026-03-23T09:00:00.000Z",
          downloadCount: 1,
          lastDownloadedAt: "2026-03-23T11:00:00.000Z",
          lastViewedAt: "2026-03-23T10:00:00.000Z"
        },
        workspaceFollowUpStatus: "waiting_on_client"
      })
    ).toBe("waiting_on_client")
  })

  it("derives needs_follow_up when there is recipient activity without acknowledgement", () => {
    expect(
      resolveEffectiveDeliveryWorkspaceFollowUpStatus({
        activitySummary: {
          acknowledgedAt: null,
          acknowledgedBy: null,
          acknowledgementNote: null,
          deliveredAt: "2026-03-23T09:00:00.000Z",
          downloadCount: 1,
          lastDownloadedAt: "2026-03-23T11:00:00.000Z",
          lastViewedAt: "2026-03-23T10:00:00.000Z"
        },
        workspaceFollowUpStatus: "none"
      })
    ).toBe("needs_follow_up")
  })

  it("returns none when there is no unresolved activity and no explicit status", () => {
    expect(
      resolveEffectiveDeliveryWorkspaceFollowUpStatus({
        activitySummary: {
          acknowledgedAt: "2026-03-23T12:00:00.000Z",
          acknowledgedBy: "Client Team",
          acknowledgementNote: "Approved.",
          deliveredAt: "2026-03-23T09:00:00.000Z",
          downloadCount: 1,
          lastDownloadedAt: "2026-03-23T11:00:00.000Z",
          lastViewedAt: "2026-03-23T10:00:00.000Z"
        },
        workspaceFollowUpStatus: "none"
      })
    ).toBe("none")
  })
})

describe("isDeliveryWorkspaceFollowUpUnresolved", () => {
  it("identifies unresolved statuses", () => {
    expect(isDeliveryWorkspaceFollowUpUnresolved("needs_follow_up")).toBe(true)
    expect(isDeliveryWorkspaceFollowUpUnresolved("reminder_scheduled")).toBe(true)
    expect(isDeliveryWorkspaceFollowUpUnresolved("waiting_on_client")).toBe(true)
  })

  it("excludes none and resolved", () => {
    expect(isDeliveryWorkspaceFollowUpUnresolved("none")).toBe(false)
    expect(isDeliveryWorkspaceFollowUpUnresolved("resolved")).toBe(false)
  })
})

describe("resolveDeliveryWorkspaceReminderBucket", () => {
  it("returns none when reminder scheduling is not active", () => {
    expect(
      resolveDeliveryWorkspaceReminderBucket({
        followUpDueOn: "2026-03-24",
        followUpStatus: "needs_follow_up",
        todayDateKey: "2026-03-23"
      })
    ).toBe("none")
  })

  it("returns overdue when due date is before today", () => {
    expect(
      resolveDeliveryWorkspaceReminderBucket({
        followUpDueOn: "2026-03-22",
        followUpStatus: "reminder_scheduled",
        todayDateKey: "2026-03-23"
      })
    ).toBe("overdue")
  })

  it("returns due_today when due date matches today", () => {
    expect(
      resolveDeliveryWorkspaceReminderBucket({
        followUpDueOn: "2026-03-23",
        followUpStatus: "reminder_scheduled",
        todayDateKey: "2026-03-23"
      })
    ).toBe("due_today")
  })

  it("returns upcoming when due date is after today", () => {
    expect(
      resolveDeliveryWorkspaceReminderBucket({
        followUpDueOn: "2026-03-24",
        followUpStatus: "reminder_scheduled",
        todayDateKey: "2026-03-23"
      })
    ).toBe("upcoming")
  })
})

describe("reminder bucket labels and classes", () => {
  it("returns readable reminder labels", () => {
    expect(getDeliveryWorkspaceReminderBucketLabel("none")).toBe("No reminder date")
    expect(getDeliveryWorkspaceReminderBucketLabel("overdue")).toBe("Overdue")
    expect(getDeliveryWorkspaceReminderBucketLabel("due_today")).toBe("Due today")
    expect(getDeliveryWorkspaceReminderBucketLabel("upcoming")).toBe("Upcoming")
  })

  it("returns stable reminder class strings", () => {
    expect(getDeliveryWorkspaceReminderBucketClasses("none")).toContain(
      "text-slate-300"
    )
    expect(getDeliveryWorkspaceReminderBucketClasses("overdue")).toContain(
      "text-rose-100"
    )
    expect(getDeliveryWorkspaceReminderBucketClasses("due_today")).toContain(
      "text-amber-100"
    )
    expect(getDeliveryWorkspaceReminderBucketClasses("upcoming")).toContain(
      "text-sky-100"
    )
  })
})
