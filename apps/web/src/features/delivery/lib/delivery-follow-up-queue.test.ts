import { describe, expect, it } from "vitest"
import type { DeliveryWorkspaceOverviewRecord } from "@/features/delivery/lib/delivery-workspace-overview"
import type {
  DeliveryApprovalSummary,
  DeliveryWorkspaceRecord
} from "@/server/database/types"
import type { DeliveryWorkspaceActivitySummary } from "./delivery-activity"
import { buildDeliveryFollowUpQueueRecords } from "./delivery-follow-up-queue"

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
    follow_up_updated_at: overrides.follow_up_updated_at ?? null,
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
  it("includes active unresolved workspaces and sorts by latest client activity", () => {
    const queueRecords = buildDeliveryFollowUpQueueRecords({
      overviewRecords: [
        createOverviewRecord({
          latestActivityAt: "2026-03-23T11:00:00.000Z",
          workspace: createWorkspaceRecord({
            id: "workspace-reminder",
            follow_up_note: "Send reminder tomorrow morning.",
            follow_up_status: "reminder_scheduled"
          })
        }),
        createOverviewRecord({
          latestActivityAt: "2026-03-23T12:00:00.000Z",
          workspace: createWorkspaceRecord({
            id: "workspace-derived",
            follow_up_status: "none"
          })
        }),
        createOverviewRecord({
          activitySummary: createActivitySummary({
            acknowledgedAt: "2026-03-23T13:00:00.000Z",
            deliveredAt: "2026-03-23T09:00:00.000Z",
            downloadCount: 1,
            lastDownloadedAt: "2026-03-23T12:30:00.000Z",
            lastViewedAt: "2026-03-23T12:00:00.000Z"
          }),
          latestActivityAt: "2026-03-23T13:00:00.000Z",
          workspace: createWorkspaceRecord({
            id: "workspace-resolved",
            follow_up_status: "resolved"
          })
        }),
        createOverviewRecord({
          latestActivityAt: "2026-03-23T14:00:00.000Z",
          workspace: createWorkspaceRecord({
            id: "workspace-archived",
            status: "archived",
            follow_up_status: "needs_follow_up"
          })
        })
      ]
    })

    expect(queueRecords.map((record) => record.overviewRecord.workspace.id)).toEqual([
      "workspace-derived",
      "workspace-reminder"
    ])

    expect(queueRecords[0]?.effectiveFollowUpStatus).toBe("needs_follow_up")
    expect(queueRecords[0]?.primaryNote).toBe(
      "Viewed by recipient. Awaiting acknowledgement."
    )

    expect(queueRecords[1]?.effectiveFollowUpStatus).toBe("reminder_scheduled")
    expect(queueRecords[1]?.primaryNote).toBe("Send reminder tomorrow morning.")
  })

  it("uses follow_up_updated_at as a tie-breaker when latest activity matches", () => {
    const queueRecords = buildDeliveryFollowUpQueueRecords({
      overviewRecords: [
        createOverviewRecord({
          latestActivityAt: "2026-03-23T12:00:00.000Z",
          workspace: createWorkspaceRecord({
            id: "workspace-older-follow-up",
            follow_up_status: "waiting_on_client",
            follow_up_updated_at: "2026-03-23T10:00:00.000Z"
          })
        }),
        createOverviewRecord({
          latestActivityAt: "2026-03-23T12:00:00.000Z",
          workspace: createWorkspaceRecord({
            id: "workspace-newer-follow-up",
            follow_up_status: "waiting_on_client",
            follow_up_updated_at: "2026-03-23T11:00:00.000Z"
          })
        })
      ]
    })

    expect(queueRecords.map((record) => record.overviewRecord.workspace.id)).toEqual([
      "workspace-newer-follow-up",
      "workspace-older-follow-up"
    ])
  })
})
