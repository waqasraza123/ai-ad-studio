import { describe, expect, it } from "vitest"
import {
  assertExactNotificationCount,
  assertReminderCheckpoint,
  assertSmokeWorkspaceEligible,
  buildSmokeProofNote,
  getDateKey,
  getDateKeyOffset,
  type SmokeNotificationRecord,
  type SmokeWorkspaceRecord
} from "./delivery-follow-up-reminder-smoke-helpers"

function createWorkspaceRecord(
  overrides: Partial<SmokeWorkspaceRecord> = {}
): SmokeWorkspaceRecord {
  return {
    canonical_export_id: overrides.canonical_export_id ?? "export-1",
    follow_up_due_on: overrides.follow_up_due_on ?? null,
    follow_up_last_notification_bucket:
      overrides.follow_up_last_notification_bucket ?? null,
    follow_up_last_notification_date:
      overrides.follow_up_last_notification_date ?? null,
    follow_up_note: overrides.follow_up_note ?? null,
    follow_up_status: overrides.follow_up_status ?? null,
    id: overrides.id ?? "workspace-1",
    owner_id: overrides.owner_id ?? "owner-1",
    project_id: overrides.project_id ?? "project-1",
    status: overrides.status ?? "active",
    title: overrides.title ?? "Delivery workspace"
  }
}

function createNotificationRecord(
  overrides: Partial<SmokeNotificationRecord> = {}
): SmokeNotificationRecord {
  return {
    body: overrides.body ?? "body",
    id: overrides.id ?? "notification-1",
    kind: overrides.kind ?? "delivery_follow_up_due_today",
    metadata: overrides.metadata ?? null,
    title: overrides.title ?? "title"
  }
}

describe("getDateKey", () => {
  it("returns the UTC date key", () => {
    expect(getDateKey(new Date("2026-03-24T12:34:56.000Z"))).toBe("2026-03-24")
  })
})

describe("getDateKeyOffset", () => {
  it("returns the shifted UTC date key", () => {
    expect(getDateKeyOffset(new Date("2026-03-24T12:34:56.000Z"), -1)).toBe(
      "2026-03-23"
    )
  })
})

describe("buildSmokeProofNote", () => {
  it("embeds the marker in the note", () => {
    expect(buildSmokeProofNote("marker-123")).toBe(
      "Delivery reminder smoke proof marker marker-123"
    )
  })
})

describe("assertSmokeWorkspaceEligible", () => {
  it("accepts an eligible workspace", () => {
    expect(() =>
      assertSmokeWorkspaceEligible({
        label: "due_today",
        workspace: createWorkspaceRecord()
      })
    ).not.toThrow()
  })

  it("throws when the workspace is inactive", () => {
    expect(() =>
      assertSmokeWorkspaceEligible({
        label: "due_today",
        workspace: createWorkspaceRecord({
          status: "archived"
        })
      })
    ).toThrow("due_today workspace must be active")
  })

  it("throws when canonical_export_id is missing", () => {
    expect(() =>
      assertSmokeWorkspaceEligible({
        label: "overdue",
        workspace: createWorkspaceRecord({
          canonical_export_id: null
        })
      })
    ).toThrow("overdue workspace must have canonical_export_id set")
  })
})

describe("assertReminderCheckpoint", () => {
  it("accepts the expected checkpoint", () => {
    expect(() =>
      assertReminderCheckpoint({
        expectedReminderBucket: "due_today",
        todayDateKey: "2026-03-24",
        workspace: createWorkspaceRecord({
          follow_up_last_notification_bucket: "due_today",
          follow_up_last_notification_date: "2026-03-24"
        })
      })
    ).not.toThrow()
  })

  it("throws on bucket mismatch", () => {
    expect(() =>
      assertReminderCheckpoint({
        expectedReminderBucket: "overdue",
        todayDateKey: "2026-03-24",
        workspace: createWorkspaceRecord({
          follow_up_last_notification_bucket: "due_today",
          follow_up_last_notification_date: "2026-03-24"
        })
      })
    ).toThrow("follow_up_last_notification_bucket overdue")
  })

  it("throws on date mismatch", () => {
    expect(() =>
      assertReminderCheckpoint({
        expectedReminderBucket: "due_today",
        todayDateKey: "2026-03-24",
        workspace: createWorkspaceRecord({
          follow_up_last_notification_bucket: "due_today",
          follow_up_last_notification_date: "2026-03-23"
        })
      })
    ).toThrow("follow_up_last_notification_date 2026-03-24")
  })
})

describe("assertExactNotificationCount", () => {
  it("accepts the expected notification count", () => {
    expect(() =>
      assertExactNotificationCount({
        expectedCount: 1,
        label: "due_today",
        notifications: [createNotificationRecord()]
      })
    ).not.toThrow()
  })

  it("throws on count mismatch", () => {
    expect(() =>
      assertExactNotificationCount({
        expectedCount: 1,
        label: "overdue",
        notifications: []
      })
    ).toThrow("Expected 1 overdue notifications, received 0")
  })
})
