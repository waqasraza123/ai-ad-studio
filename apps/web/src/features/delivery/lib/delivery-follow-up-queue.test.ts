import { describe, expect, it } from "vitest"
import type { DeliveryWorkspaceActivitySummary } from "./delivery-activity"
import type { DeliveryWorkspaceOverviewRecord } from "./delivery-workspace-overview"
import type {
  DeliveryApprovalSummary,
  DeliveryWorkspaceRecord
} from "@/server/database/types"
import {
  buildDeliveryFollowUpQueueRecords,
  listOverdueDeliveryFollowUpQueueRecords,
  summarizeDeliveryFollowUpQueue
} from "./delivery-follow-up-queue"

function createApprovalSummary(): DeliveryApprovalSummary {
  return {
    approved_count: 0,
    rejected_count: 0,
    pending_count: 0,
    responded_count: 0,
    review_note: null,
    finalization_note: null,
    decided_at: null,
    finalized_at: null
  }
}

function createWorkspaceRecord(
  overrides: Partial<DeliveryWorkspaceRecord>
): DeliveryWorkspaceRecord {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    owner_id: overrides.owner_id ?? "owner-1",
    project_id: overrides.project_id ?? "project-1",
    render_batch_id: overrides.render_batch_id ?? "batch-1",
    canonical_export_id: overrides.canonical_export_id ?? "export-1",
    title: overrides.title ?? "Workspace",
    summary: overrides.summary ?? "Summary",
    handoff_notes: overrides.handoff_notes ?? "Notes",
    approval_summary: overrides.approval_summary ?? createApprovalSummary(),
    token: overrides.token ?? "token-1",
    status: overrides.status ?? "active",
    follow_up_status: overrides.follow_up_status ?? "none",
    follow_up_note: overrides.follow_up_note ?? null,
    follow_up_due_on: overrides.follow_up_due_on ?? null,
    follow_up_updated_at: overrides.follow_up_updated_at ?? null,
    follow_up_last_notification_bucket:
      overrides.follow_up_last_notification_bucket ?? null,
    follow_up_last_notification_date:
      overrides.follow_up_last_notification_date ?? null,
    created_at: overrides.created_at ?? "2026-03-21T10:00:00.000Z",
    updated_at: overrides.updated_at ?? "2026-03-21T10:00:00.000Z"
  }
}

function createActivitySummary(
  overrides: Partial<DeliveryWorkspaceActivitySummary>
): DeliveryWorkspaceActivitySummary {
  return {
    acknowledgedAt: overrides.acknowledgedAt ?? null,
    acknowledgedBy: overrides.acknowledgedBy ?? null,
    acknowledgementNote: overrides.acknowledgementNote ?? null,
    deliveredAt: overrides.deliveredAt ?? null,
    downloadCount: overrides.downloadCount ?? 0,
    lastDownloadedAt: overrides.lastDownloadedAt ?? null,
    lastViewedAt: overrides.lastViewedAt ?? null
  }
}

function createOverviewRecord(
  overrides: Partial<DeliveryWorkspaceOverviewRecord> & {
    workspace: DeliveryWorkspaceRecord
  }
): DeliveryWorkspaceOverviewRecord {
  return {
    activityExcerpt:
      overrides.activityExcerpt ?? "Viewed by recipient. Awaiting acknowledgement.",
    activitySummary:
      overrides.activitySummary ??
      createActivitySummary({
        deliveredAt: "2026-03-23T09:00:00.000Z",
        lastViewedAt: "2026-03-23T10:00:00.000Z"
      }),
    latestActivityAt: overrides.latestActivityAt ?? "2026-03-23T10:00:00.000Z",
    workspace: overrides.workspace
  }
}

describe("buildDeliveryFollowUpQueueRecords", () => {
  it("sorts scheduled reminders by urgency before latest client activity", () => {
    const queueRecords = buildDeliveryFollowUpQueueRecords({
      overviewRecords: [
        createOverviewRecord({
          latestActivityAt: "2026-03-23T13:00:00.000Z",
          workspace: createWorkspaceRecord({
            id: "workspace-derived",
            follow_up_status: "none"
          })
        }),
        createOverviewRecord({
          latestActivityAt: "2026-03-23T11:00:00.000Z",
          workspace: createWorkspaceRecord({
            id: "workspace-upcoming",
            follow_up_due_on: "2026-03-24",
            follow_up_note: "Check tomorrow morning.",
            follow_up_status: "reminder_scheduled"
          })
        }),
        createOverviewRecord({
          latestActivityAt: "2026-03-23T10:00:00.000Z",
          workspace: createWorkspaceRecord({
            id: "workspace-overdue",
            follow_up_due_on: "2026-03-22",
            follow_up_note: "Client opened the delivery but did not reply.",
            follow_up_status: "reminder_scheduled"
          })
        }),
        createOverviewRecord({
          latestActivityAt: "2026-03-23T12:00:00.000Z",
          workspace: createWorkspaceRecord({
            id: "workspace-due-today",
            follow_up_due_on: "2026-03-23",
            follow_up_status: "reminder_scheduled"
          })
        })
      ],
      todayDateKey: "2026-03-23"
    })

    expect(queueRecords.map((record) => record.overviewRecord.workspace.id)).toEqual([
      "workspace-overdue",
      "workspace-due-today",
      "workspace-upcoming",
      "workspace-derived"
    ])

    expect(queueRecords[0]?.reminderBucket).toBe("overdue")
    expect(queueRecords[1]?.reminderBucket).toBe("due_today")
    expect(queueRecords[2]?.reminderBucket).toBe("upcoming")
    expect(queueRecords[3]?.reminderBucket).toBe("none")
  })

  it("excludes archived and resolved workspaces from the queue", () => {
    const queueRecords = buildDeliveryFollowUpQueueRecords({
      overviewRecords: [
        createOverviewRecord({
          workspace: createWorkspaceRecord({
            id: "workspace-archived",
            status: "archived",
            follow_up_status: "needs_follow_up"
          })
        }),
        createOverviewRecord({
          activitySummary: createActivitySummary({
            acknowledgedAt: "2026-03-23T12:00:00.000Z",
            deliveredAt: "2026-03-23T09:00:00.000Z",
            downloadCount: 1,
            lastDownloadedAt: "2026-03-23T11:30:00.000Z",
            lastViewedAt: "2026-03-23T11:00:00.000Z"
          }),
          workspace: createWorkspaceRecord({
            id: "workspace-resolved",
            follow_up_status: "resolved"
          })
        }),
        createOverviewRecord({
          workspace: createWorkspaceRecord({
            id: "workspace-waiting",
            follow_up_status: "waiting_on_client"
          })
        })
      ],
      todayDateKey: "2026-03-23"
    })

    expect(queueRecords.map((record) => record.overviewRecord.workspace.id)).toEqual([
      "workspace-waiting"
    ])
  })
})

describe("listOverdueDeliveryFollowUpQueueRecords", () => {
  it("returns only overdue queue records", () => {
    const queueRecords = buildDeliveryFollowUpQueueRecords({
      overviewRecords: [
        createOverviewRecord({
          workspace: createWorkspaceRecord({
            id: "workspace-overdue",
            follow_up_due_on: "2026-03-22",
            follow_up_status: "reminder_scheduled"
          })
        }),
        createOverviewRecord({
          workspace: createWorkspaceRecord({
            id: "workspace-due-today",
            follow_up_due_on: "2026-03-23",
            follow_up_status: "reminder_scheduled"
          })
        }),
        createOverviewRecord({
          workspace: createWorkspaceRecord({
            id: "workspace-derived",
            follow_up_status: "none"
          })
        })
      ],
      todayDateKey: "2026-03-23"
    })

    expect(
      listOverdueDeliveryFollowUpQueueRecords(queueRecords).map(
        (record) => record.overviewRecord.workspace.id
      )
    ).toEqual(["workspace-overdue"])
  })
})

describe("summarizeDeliveryFollowUpQueue", () => {
  it("builds overdue, due today, and upcoming reminder counts", () => {
    const queueRecords = buildDeliveryFollowUpQueueRecords({
      overviewRecords: [
        createOverviewRecord({
          workspace: createWorkspaceRecord({
            id: "workspace-overdue",
            follow_up_due_on: "2026-03-22",
            follow_up_status: "reminder_scheduled"
          })
        }),
        createOverviewRecord({
          workspace: createWorkspaceRecord({
            id: "workspace-due-today",
            follow_up_due_on: "2026-03-23",
            follow_up_status: "reminder_scheduled"
          })
        }),
        createOverviewRecord({
          workspace: createWorkspaceRecord({
            id: "workspace-upcoming",
            follow_up_due_on: "2026-03-24",
            follow_up_status: "reminder_scheduled"
          })
        }),
        createOverviewRecord({
          workspace: createWorkspaceRecord({
            id: "workspace-derived",
            follow_up_status: "none"
          })
        })
      ],
      todayDateKey: "2026-03-23"
    })

    expect(summarizeDeliveryFollowUpQueue(queueRecords)).toEqual({
      dueTodayCount: 1,
      overdueCount: 1,
      totalCount: 4,
      upcomingCount: 1
    })
  })
})
