import type {
  DeliveryWorkspaceEventRecord,
  DeliveryWorkspaceRecord
} from "@/server/database/types"
import type { DeliveryWorkspaceActivitySummary } from "./delivery-activity"
import { summarizeDeliveryWorkspaceActivity } from "./delivery-activity"

export type DeliveryWorkspaceStatusFilter = "all" | "active" | "archived"
export type DeliveryWorkspaceSortKey = "latest_activity" | "newest"
export type DeliveryWorkspaceQuickFilter =
  | "all"
  | "acknowledged"
  | "viewed_only"
  | "downloaded"

export type DeliveryWorkspaceOverviewRecord = {
  activityExcerpt: string
  activitySummary: DeliveryWorkspaceActivitySummary
  latestActivityAt: string | null
  workspace: DeliveryWorkspaceRecord
}

export type DeliveryDashboardSummary = {
  acknowledgedWorkspaces: number
  activeWorkspaces: number
  totalDownloads: number
  totalWorkspaces: number
  viewedNotAcknowledgedWorkspaces: number
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

function buildDeliveryWorkspaceActivityExcerpt(
  activitySummary: DeliveryWorkspaceActivitySummary
) {
  if (activitySummary.acknowledgedAt) {
    if (activitySummary.acknowledgedBy) {
      return `Acknowledged by ${activitySummary.acknowledgedBy}.`
    }

    return "Acknowledged by recipient."
  }

  if (activitySummary.downloadCount > 0) {
    if (activitySummary.downloadCount === 1) {
      return "Downloaded once. Awaiting acknowledgement."
    }

    return `Downloaded ${activitySummary.downloadCount} times. Awaiting acknowledgement.`
  }

  if (activitySummary.lastViewedAt) {
    return "Viewed by recipient. Awaiting acknowledgement."
  }

  if (activitySummary.deliveredAt) {
    return "Delivered. Awaiting first recipient activity."
  }

  return "No recipient activity yet."
}

function matchesQuickFilter(input: {
  activitySummary: DeliveryWorkspaceActivitySummary
  quickFilter: DeliveryWorkspaceQuickFilter
}) {
  if (input.quickFilter === "all") {
    return true
  }

  if (input.quickFilter === "acknowledged") {
    return Boolean(input.activitySummary.acknowledgedAt)
  }

  if (input.quickFilter === "viewed_only") {
    return Boolean(
      input.activitySummary.lastViewedAt && !input.activitySummary.acknowledgedAt
    )
  }

  return input.activitySummary.downloadCount > 0
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

export function normalizeDeliveryWorkspaceQuickFilter(
  value: string | null | undefined
): DeliveryWorkspaceQuickFilter {
  if (
    value === "acknowledged" ||
    value === "viewed_only" ||
    value === "downloaded"
  ) {
    return value
  }

  return "all"
}

export function buildDeliveryWorkspaceOverviewRecords(input: {
  events: DeliveryWorkspaceEventRecord[]
  workspaces: DeliveryWorkspaceRecord[]
}): DeliveryWorkspaceOverviewRecord[] {
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
      activityExcerpt: buildDeliveryWorkspaceActivityExcerpt(activitySummary),
      activitySummary,
      latestActivityAt,
      workspace
    }
  })
}

export function filterAndSortDeliveryWorkspaceOverviewRecords(input: {
  overviewRecords: DeliveryWorkspaceOverviewRecord[]
  quickFilter: DeliveryWorkspaceQuickFilter
  sortKey: DeliveryWorkspaceSortKey
  statusFilter: DeliveryWorkspaceStatusFilter
}) {
  const filteredRecords = input.overviewRecords.filter((overviewRecord) => {
    const matchesStatus =
      input.statusFilter === "all" ||
      overviewRecord.workspace.status === input.statusFilter

    if (!matchesStatus) {
      return false
    }

    return matchesQuickFilter({
      activitySummary: overviewRecord.activitySummary,
      quickFilter: input.quickFilter
    })
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

export function summarizeDeliveryDashboardOverview(
  overviewRecords: DeliveryWorkspaceOverviewRecord[]
): DeliveryDashboardSummary {
  let activeWorkspaces = 0
  let acknowledgedWorkspaces = 0
  let viewedNotAcknowledgedWorkspaces = 0
  let totalDownloads = 0

  for (const overviewRecord of overviewRecords) {
    if (overviewRecord.workspace.status === "active") {
      activeWorkspaces += 1
    }

    if (overviewRecord.activitySummary.acknowledgedAt) {
      acknowledgedWorkspaces += 1
    }

    if (
      overviewRecord.activitySummary.lastViewedAt &&
      !overviewRecord.activitySummary.acknowledgedAt
    ) {
      viewedNotAcknowledgedWorkspaces += 1
    }

    totalDownloads += overviewRecord.activitySummary.downloadCount
  }

  return {
    acknowledgedWorkspaces,
    activeWorkspaces,
    totalDownloads,
    totalWorkspaces: overviewRecords.length,
    viewedNotAcknowledgedWorkspaces
  }
}
