import { describe, expect, it } from "vitest"
import type {
  DeliveryWorkspaceEventRecord,
  DeliveryWorkspaceRecord
} from "@/server/database/types"
import {
  buildDeliveryWorkspaceOverviewRecords,
  filterAndSortDeliveryWorkspaceOverviewRecords,
  normalizeDeliveryWorkspaceQuickFilter,
  normalizeDeliveryWorkspaceSortKey,
  normalizeDeliveryWorkspaceStatusFilter,
  summarizeDeliveryDashboardOverview
} from "./delivery-workspace-overview"

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
    approval_summary: overrides.approval_summary ?? {
      approved_count: 0,
      rejected_count: 0,
      pending_count: 0,
      responded_count: 0,
      review_note: null,
      finalization_note: null,
      decided_at: null,
      finalized_at: null
    },
    token: overrides.token ?? "token-1",
    status: overrides.status ?? "active",
    created_at: overrides.created_at ?? "2026-03-21T10:00:00.000Z",
    updated_at: overrides.updated_at ?? "2026-03-21T10:00:00.000Z"
  }
}

function createEventRecord(
  overrides: Partial<DeliveryWorkspaceEventRecord>
): DeliveryWorkspaceEventRecord {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    delivery_workspace_id: overrides.delivery_workspace_id ?? "workspace-1",
    owner_id: overrides.owner_id ?? "owner-1",
    project_id: overrides.project_id ?? "project-1",
    export_id: overrides.export_id ?? null,
    event_type: overrides.event_type ?? "viewed",
    actor_label: overrides.actor_label ?? null,
    metadata: overrides.metadata ?? {},
    created_at: overrides.created_at ?? "2026-03-21T10:00:00.000Z"
  }
}

describe("normalizeDeliveryWorkspaceStatusFilter", () => {
  it("returns all for unsupported values", () => {
    expect(normalizeDeliveryWorkspaceStatusFilter(undefined)).toBe("all")
    expect(normalizeDeliveryWorkspaceStatusFilter("unknown")).toBe("all")
  })

  it("returns active and archived for supported values", () => {
    expect(normalizeDeliveryWorkspaceStatusFilter("active")).toBe("active")
    expect(normalizeDeliveryWorkspaceStatusFilter("archived")).toBe("archived")
  })
})

describe("normalizeDeliveryWorkspaceSortKey", () => {
  it("defaults to latest activity", () => {
    expect(normalizeDeliveryWorkspaceSortKey(undefined)).toBe("latest_activity")
    expect(normalizeDeliveryWorkspaceSortKey("unknown")).toBe("latest_activity")
  })

  it("accepts newest", () => {
    expect(normalizeDeliveryWorkspaceSortKey("newest")).toBe("newest")
  })
})

describe("normalizeDeliveryWorkspaceQuickFilter", () => {
  it("defaults to all for unsupported values", () => {
    expect(normalizeDeliveryWorkspaceQuickFilter(undefined)).toBe("all")
    expect(normalizeDeliveryWorkspaceQuickFilter("unknown")).toBe("all")
  })

  it("accepts supported quick filter values", () => {
    expect(normalizeDeliveryWorkspaceQuickFilter("acknowledged")).toBe(
      "acknowledged"
    )
    expect(normalizeDeliveryWorkspaceQuickFilter("viewed_only")).toBe(
      "viewed_only"
    )
    expect(normalizeDeliveryWorkspaceQuickFilter("downloaded")).toBe(
      "downloaded"
    )
  })
})

describe("buildDeliveryWorkspaceOverviewRecords", () => {
  it("builds summaries, latest activity timestamps, and excerpts per workspace", () => {
    const workspaces = [
      createWorkspaceRecord({
        id: "workspace-a",
        created_at: "2026-03-21T09:00:00.000Z"
      }),
      createWorkspaceRecord({
        id: "workspace-b",
        created_at: "2026-03-21T08:00:00.000Z"
      }),
      createWorkspaceRecord({
        id: "workspace-c",
        created_at: "2026-03-21T07:00:00.000Z"
      })
    ]

    const events = [
      createEventRecord({
        delivery_workspace_id: "workspace-a",
        event_type: "delivered",
        created_at: "2026-03-21T09:30:00.000Z"
      }),
      createEventRecord({
        delivery_workspace_id: "workspace-a",
        event_type: "viewed",
        created_at: "2026-03-21T10:00:00.000Z"
      }),
      createEventRecord({
        delivery_workspace_id: "workspace-b",
        event_type: "downloaded",
        created_at: "2026-03-21T11:00:00.000Z"
      }),
      createEventRecord({
        delivery_workspace_id: "workspace-c",
        event_type: "acknowledged",
        actor_label: "Client Team",
        metadata: {
          note: "Received."
        },
        created_at: "2026-03-21T12:00:00.000Z"
      })
    ]

    const overviewRecords = buildDeliveryWorkspaceOverviewRecords({
      events,
      workspaces
    })

    expect(overviewRecords).toHaveLength(3)

    const workspaceAOverview = overviewRecords.find(
      (overviewRecord) => overviewRecord.workspace.id === "workspace-a"
    )
    const workspaceBOverview = overviewRecords.find(
      (overviewRecord) => overviewRecord.workspace.id === "workspace-b"
    )
    const workspaceCOverview = overviewRecords.find(
      (overviewRecord) => overviewRecord.workspace.id === "workspace-c"
    )

    expect(workspaceAOverview?.latestActivityAt).toBe("2026-03-21T10:00:00.000Z")
    expect(workspaceAOverview?.activityExcerpt).toBe(
      "Viewed by recipient. Awaiting acknowledgement."
    )

    expect(workspaceBOverview?.activitySummary.downloadCount).toBe(1)
    expect(workspaceBOverview?.activityExcerpt).toBe(
      "Downloaded once. Awaiting acknowledgement."
    )

    expect(workspaceCOverview?.activitySummary.acknowledgedBy).toBe("Client Team")
    expect(workspaceCOverview?.activityExcerpt).toBe(
      "Acknowledged by Client Team."
    )
  })
})

describe("filterAndSortDeliveryWorkspaceOverviewRecords", () => {
  const overviewRecords = [
    {
      activityExcerpt: "Viewed by recipient. Awaiting acknowledgement.",
      activitySummary: {
        acknowledgedAt: null,
        acknowledgedBy: null,
        acknowledgementNote: null,
        deliveredAt: "2026-03-21T09:00:00.000Z",
        downloadCount: 0,
        lastDownloadedAt: null,
        lastViewedAt: "2026-03-21T10:00:00.000Z"
      },
      latestActivityAt: "2026-03-21T10:00:00.000Z",
      workspace: createWorkspaceRecord({
        id: "workspace-viewed-only",
        status: "active",
        created_at: "2026-03-21T08:00:00.000Z"
      })
    },
    {
      activityExcerpt: "Downloaded 2 times. Awaiting acknowledgement.",
      activitySummary: {
        acknowledgedAt: null,
        acknowledgedBy: null,
        acknowledgementNote: null,
        deliveredAt: "2026-03-21T09:00:00.000Z",
        downloadCount: 2,
        lastDownloadedAt: "2026-03-21T11:00:00.000Z",
        lastViewedAt: "2026-03-21T10:30:00.000Z"
      },
      latestActivityAt: "2026-03-21T11:00:00.000Z",
      workspace: createWorkspaceRecord({
        id: "workspace-downloaded",
        status: "active",
        created_at: "2026-03-21T09:00:00.000Z"
      })
    },
    {
      activityExcerpt: "Acknowledged by Client Team.",
      activitySummary: {
        acknowledgedAt: "2026-03-21T12:00:00.000Z",
        acknowledgedBy: "Client Team",
        acknowledgementNote: "Received.",
        deliveredAt: "2026-03-21T09:00:00.000Z",
        downloadCount: 1,
        lastDownloadedAt: "2026-03-21T11:30:00.000Z",
        lastViewedAt: "2026-03-21T10:45:00.000Z"
      },
      latestActivityAt: "2026-03-21T12:00:00.000Z",
      workspace: createWorkspaceRecord({
        id: "workspace-acknowledged",
        status: "active",
        created_at: "2026-03-21T10:00:00.000Z"
      })
    },
    {
      activityExcerpt: "No recipient activity yet.",
      activitySummary: {
        acknowledgedAt: null,
        acknowledgedBy: null,
        acknowledgementNote: null,
        deliveredAt: null,
        downloadCount: 0,
        lastDownloadedAt: null,
        lastViewedAt: null
      },
      latestActivityAt: null,
      workspace: createWorkspaceRecord({
        id: "workspace-archived",
        status: "archived",
        created_at: "2026-03-21T12:00:00.000Z"
      })
    }
  ]

  it("filters by status", () => {
    const filtered = filterAndSortDeliveryWorkspaceOverviewRecords({
      overviewRecords,
      quickFilter: "all",
      sortKey: "latest_activity",
      statusFilter: "active"
    })

    expect(filtered.map((record) => record.workspace.id)).toEqual([
      "workspace-acknowledged",
      "workspace-downloaded",
      "workspace-viewed-only"
    ])
  })

  it("filters by acknowledged quick filter", () => {
    const filtered = filterAndSortDeliveryWorkspaceOverviewRecords({
      overviewRecords,
      quickFilter: "acknowledged",
      sortKey: "latest_activity",
      statusFilter: "all"
    })

    expect(filtered.map((record) => record.workspace.id)).toEqual([
      "workspace-acknowledged"
    ])
  })

  it("filters by viewed_only quick filter", () => {
    const filtered = filterAndSortDeliveryWorkspaceOverviewRecords({
      overviewRecords,
      quickFilter: "viewed_only",
      sortKey: "latest_activity",
      statusFilter: "all"
    })

    expect(filtered.map((record) => record.workspace.id)).toEqual([
      "workspace-downloaded",
      "workspace-viewed-only"
    ])
  })

  it("filters by downloaded quick filter", () => {
    const filtered = filterAndSortDeliveryWorkspaceOverviewRecords({
      overviewRecords,
      quickFilter: "downloaded",
      sortKey: "latest_activity",
      statusFilter: "all"
    })

    expect(filtered.map((record) => record.workspace.id)).toEqual([
      "workspace-acknowledged",
      "workspace-downloaded"
    ])
  })

  it("sorts by newest created workspace when requested", () => {
    const sorted = filterAndSortDeliveryWorkspaceOverviewRecords({
      overviewRecords,
      quickFilter: "all",
      sortKey: "newest",
      statusFilter: "all"
    })

    expect(sorted.map((record) => record.workspace.id)).toEqual([
      "workspace-archived",
      "workspace-acknowledged",
      "workspace-downloaded",
      "workspace-viewed-only"
    ])
  })
})

describe("summarizeDeliveryDashboardOverview", () => {
  it("builds dashboard KPI counts from overview records", () => {
    const overviewRecords = [
      {
        activityExcerpt: "Viewed by recipient. Awaiting acknowledgement.",
        activitySummary: {
          acknowledgedAt: null,
          acknowledgedBy: null,
          acknowledgementNote: null,
          deliveredAt: "2026-03-21T09:00:00.000Z",
          downloadCount: 2,
          lastDownloadedAt: "2026-03-21T11:00:00.000Z",
          lastViewedAt: "2026-03-21T10:00:00.000Z"
        },
        latestActivityAt: "2026-03-21T11:00:00.000Z",
        workspace: createWorkspaceRecord({
          id: "workspace-active-awaiting-ack",
          status: "active"
        })
      },
      {
        activityExcerpt: "Acknowledged by Client Team.",
        activitySummary: {
          acknowledgedAt: "2026-03-21T12:00:00.000Z",
          acknowledgedBy: "Client Team",
          acknowledgementNote: "Received.",
          deliveredAt: "2026-03-21T09:00:00.000Z",
          downloadCount: 1,
          lastDownloadedAt: "2026-03-21T11:30:00.000Z",
          lastViewedAt: "2026-03-21T10:30:00.000Z"
        },
        latestActivityAt: "2026-03-21T12:00:00.000Z",
        workspace: createWorkspaceRecord({
          id: "workspace-active-acknowledged",
          status: "active"
        })
      },
      {
        activityExcerpt: "No recipient activity yet.",
        activitySummary: {
          acknowledgedAt: null,
          acknowledgedBy: null,
          acknowledgementNote: null,
          deliveredAt: null,
          downloadCount: 0,
          lastDownloadedAt: null,
          lastViewedAt: null
        },
        latestActivityAt: null,
        workspace: createWorkspaceRecord({
          id: "workspace-archived",
          status: "archived"
        })
      }
    ]

    const summary = summarizeDeliveryDashboardOverview(overviewRecords)

    expect(summary).toEqual({
      acknowledgedWorkspaces: 1,
      activeWorkspaces: 2,
      totalDownloads: 3,
      totalWorkspaces: 3,
      viewedNotAcknowledgedWorkspaces: 1
    })
  })
})
