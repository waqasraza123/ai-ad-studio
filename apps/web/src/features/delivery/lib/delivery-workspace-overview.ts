import type {
  DeliveryWorkspaceEventRecord,
  DeliveryWorkspaceRecord
} from "@/server/database/types"
import type { DeliveryWorkspaceActivitySummary } from "@/features/delivery/lib/delivery-activity"
import { summarizeDeliveryWorkspaceActivity } from "@/features/delivery/lib/delivery-activity"

export type DeliveryWorkspaceStatusFilter = "all" | "active" | "archived"
export type DeliveryWorkspaceSortKey = "latest_activity" | "newest"

export type DeliveryWorkspaceOverviewRecord = {
  activitySummary: DeliveryWorkspaceActivitySummary
  latestActivityAt: string | null
  workspace: DeliveryWorkspaceRecord
}

function getLatestIsoTimestamp(values: Array<string | null>) {
  let latestValue: string | null = null

  for (const value of values) {
    if (!value) {
      continue
    }

    if (!latestValue || value > latestValue) {
      latestValue = value
    }
  }

  return latestValue
}

function compareDescending(left: string | null, right: string | null) {
  if (left === right) {
    return 0
  }

  if (left === null) {
    return 1
  }

  if (right === null) {
    return -1
  }

  return right.localeCompare(left)
}

export function normalizeDeliveryWorkspaceStatusFilter(
  value: string | null | undefined
): DeliveryWorkspaceStatusFilter {
  if (value === "active" || value === "archived") {
    return value
  }

  return "all"
}

export function normalizeDeliveryWorkspaceSortKey(
  value: string | null | undefined
): DeliveryWorkspaceSortKey {
  if (value === "newest") {
    return value
  }

  return "latest_activity"
}

export function buildDeliveryWorkspaceOverviewRecords(input: {
  events: DeliveryWorkspaceEventRecord[]
  workspaces: DeliveryWorkspaceRecord[]
}) {
  const eventsByWorkspaceId = new Map<string, DeliveryWorkspaceEventRecord[]>()

  for (const event of input.events) {
    const workspaceEvents = eventsByWorkspaceId.get(event.delivery_workspace_id) ?? []
    workspaceEvents.push(event)
    eventsByWorkspaceId.set(event.delivery_workspace_id, workspaceEvents)
  }

  return input.workspaces.map((workspace) => {
    const workspaceEvents = eventsByWorkspaceId.get(workspace.id) ?? []
    const activitySummary = summarizeDeliveryWorkspaceActivity(workspaceEvents)
    const latestActivityAt = getLatestIsoTimestamp([
      activitySummary.acknowledgedAt,
      activitySummary.lastDownloadedAt,
      activitySummary.lastViewedAt,
      activitySummary.deliveredAt
    ])

    return {
      activitySummary,
      latestActivityAt,
      workspace
    } satisfies DeliveryWorkspaceOverviewRecord
  })
}

export function filterAndSortDeliveryWorkspaceOverviewRecords(input: {
  overviewRecords: DeliveryWorkspaceOverviewRecord[]
  sortKey: DeliveryWorkspaceSortKey
  statusFilter: DeliveryWorkspaceStatusFilter
}) {
  const filteredRecords = input.overviewRecords.filter((overviewRecord) => {
    if (input.statusFilter === "all") {
      return true
    }

    return overviewRecord.workspace.status === input.statusFilter
  })

  return [...filteredRecords].sort((left, right) => {
    if (input.sortKey === "newest") {
      return compareDescending(left.workspace.created_at, right.workspace.created_at)
    }

    const latestActivityComparison = compareDescending(
      left.latestActivityAt,
      right.latestActivityAt
    )

    if (latestActivityComparison !== 0) {
      return latestActivityComparison
    }

    return compareDescending(left.workspace.created_at, right.workspace.created_at)
  })
}
