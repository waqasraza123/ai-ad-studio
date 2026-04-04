import type { DeliveryReminderSupportRecord } from "./delivery-reminder-support"
import {
  isDeliveryReminderMismatchReopenActivityMetadata
} from "./delivery-reminder-mismatch-reopen"

export type DeliveryReminderMismatchLifecycleFilter =
  | "all"
  | "failed_reopen_attempts"
  | "resolved"
  | "unresolved"

const validDeliveryReminderMismatchLifecycleFilters =
  new Set<DeliveryReminderMismatchLifecycleFilter>([
    "all",
    "failed_reopen_attempts",
    "resolved",
    "unresolved"
  ])

type LifecycleActivityRecord = {
  metadata: unknown
}

type LifecycleWorkspaceRecord = {
  id: string
}

export type DeliveryReminderMismatchLifecycleFilterWorkspaceOverviewRecord<
  TActivity extends LifecycleActivityRecord = LifecycleActivityRecord,
  TWorkspace extends LifecycleWorkspaceRecord = LifecycleWorkspaceRecord
> = {
  activityEntries?: TActivity[] | null
  activityTimeline?: TActivity[] | null
  workspace: TWorkspace
}

export function normalizeDeliveryReminderMismatchLifecycleFilter(
  value: string | null | undefined
): DeliveryReminderMismatchLifecycleFilter {
  if (!value) {
    return "all"
  }

  return validDeliveryReminderMismatchLifecycleFilters.has(
    value as DeliveryReminderMismatchLifecycleFilter
  )
    ? (value as DeliveryReminderMismatchLifecycleFilter)
    : "all"
}

export function getDeliveryReminderMismatchLifecycleFilterLabel(
  filter: DeliveryReminderMismatchLifecycleFilter
) {
  if (filter === "unresolved") {
    return "Unresolved mismatches"
  }

  if (filter === "resolved") {
    return "Resolved mismatches"
  }

  if (filter === "failed_reopen_attempts") {
    return "Failed reopen attempts"
  }

  return "All lifecycle buckets"
}

function getActivityEntries<
  TActivity extends LifecycleActivityRecord,
  TWorkspace extends LifecycleWorkspaceRecord
>(
  record: DeliveryReminderMismatchLifecycleFilterWorkspaceOverviewRecord<
    TActivity,
    TWorkspace
  >
) {
  if (Array.isArray(record.activityEntries)) {
    return record.activityEntries
  }

  if (Array.isArray(record.activityTimeline)) {
    return record.activityTimeline
  }

  return []
}

function hasFailedReopenAttemptActivity(activities: LifecycleActivityRecord[]) {
  return activities.some((activity) => {
    if (!isDeliveryReminderMismatchReopenActivityMetadata(activity.metadata)) {
      return false
    }

    return activity.metadata.reopenOutcome === "error"
  })
}

export function filterDeliveryReminderMismatchLifecycleScope<
  TActivity extends LifecycleActivityRecord,
  TWorkspace extends LifecycleWorkspaceRecord,
  TRecord extends DeliveryReminderMismatchLifecycleFilterWorkspaceOverviewRecord<
    TActivity,
    TWorkspace
  >
>(input: {
  filter: DeliveryReminderMismatchLifecycleFilter
  overviewRecords: TRecord[]
  reminderSupportRecords: DeliveryReminderSupportRecord[]
}) {
  if (input.filter === "all") {
    return {
      overviewRecords: input.overviewRecords,
      reminderSupportRecords: input.reminderSupportRecords
    }
  }

  if (input.filter === "failed_reopen_attempts") {
    const matchingOverviewRecords = input.overviewRecords.filter((record) =>
      hasFailedReopenAttemptActivity(getActivityEntries(record))
    )
    const matchingWorkspaceIds = new Set(
      matchingOverviewRecords.map((record) => record.workspace.id)
    )

    return {
      overviewRecords: matchingOverviewRecords,
      reminderSupportRecords: input.reminderSupportRecords.filter((record) =>
        record.workspaceId ? matchingWorkspaceIds.has(record.workspaceId) : false
      )
    }
  }

  const targetCheckpointState =
    input.filter === "resolved" ? "resolved" : "checkpoint_mismatch"
  const matchingReminderSupportRecords = input.reminderSupportRecords.filter(
    (record) => record.checkpointState === targetCheckpointState
  )
  const matchingWorkspaceIds = new Set(
    matchingReminderSupportRecords.flatMap((record) =>
      record.workspaceId ? [record.workspaceId] : []
    )
  )

  return {
    overviewRecords: input.overviewRecords.filter((record) =>
      matchingWorkspaceIds.has(record.workspace.id)
    ),
    reminderSupportRecords: matchingReminderSupportRecords
  }
}
