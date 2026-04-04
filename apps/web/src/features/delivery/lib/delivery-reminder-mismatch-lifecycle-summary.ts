import type { DeliveryReminderSupportRecord } from "@/features/delivery/lib/delivery-reminder-support"
import {
  isDeliveryReminderMismatchReopenActivityMetadata
} from "@/features/delivery/lib/delivery-reminder-mismatch-reopen"

type ReminderMismatchLifecycleActivityRecord = {
  metadata: unknown
}

type ReminderMismatchLifecycleWorkspaceRecord = {
  id?: string | null
  workspaceId?: string | null
}

export type DeliveryReminderMismatchLifecycleSummary = {
  failedReopenAttemptsCount: number
  reopenedMismatchCount: number
  resolvedMismatchCount: number
  unresolvedMismatchCount: number
  visibleWorkspaceCount: number
}

export type DeliveryReminderMismatchLifecycleWorkspaceOverviewRecord<
  TActivity extends ReminderMismatchLifecycleActivityRecord = ReminderMismatchLifecycleActivityRecord,
  TWorkspace extends ReminderMismatchLifecycleWorkspaceRecord = ReminderMismatchLifecycleWorkspaceRecord
> = {
  activityEntries?: TActivity[] | null
  activityTimeline?: TActivity[] | null
  workspace?: TWorkspace | null
  workspaceId?: string | null
  id?: string | null
}

function getOverviewActivityEntries<
  TActivity extends ReminderMismatchLifecycleActivityRecord,
  TWorkspace extends ReminderMismatchLifecycleWorkspaceRecord
>(
  overviewRecord: DeliveryReminderMismatchLifecycleWorkspaceOverviewRecord<
    TActivity,
    TWorkspace
  >
) {
  if (Array.isArray(overviewRecord.activityEntries)) {
    return overviewRecord.activityEntries
  }

  if (Array.isArray(overviewRecord.activityTimeline)) {
    return overviewRecord.activityTimeline
  }

  return []
}

function getOverviewWorkspaceId<
  TActivity extends ReminderMismatchLifecycleActivityRecord,
  TWorkspace extends ReminderMismatchLifecycleWorkspaceRecord
>(
  overviewRecord: DeliveryReminderMismatchLifecycleWorkspaceOverviewRecord<
    TActivity,
    TWorkspace
  >
) {
  if (typeof overviewRecord.workspace?.id === "string") {
    return overviewRecord.workspace.id
  }

  if (typeof overviewRecord.workspace?.workspaceId === "string") {
    return overviewRecord.workspace.workspaceId
  }

  if (typeof overviewRecord.workspaceId === "string") {
    return overviewRecord.workspaceId
  }

  if (typeof overviewRecord.id === "string") {
    return overviewRecord.id
  }

  return null
}

function summarizeReopenLifecycleEvents(
  activityEntries: ReminderMismatchLifecycleActivityRecord[]
) {
  let failedReopenAttemptsCount = 0
  let reopenedMismatchCount = 0

  for (const activityEntry of activityEntries) {
    if (!isDeliveryReminderMismatchReopenActivityMetadata(activityEntry.metadata)) {
      continue
    }

    if (activityEntry.metadata.reopenOutcome === "error") {
      failedReopenAttemptsCount += 1
      continue
    }

    reopenedMismatchCount += 1
  }

  return {
    failedReopenAttemptsCount,
    reopenedMismatchCount
  }
}

export function summarizeDeliveryReminderMismatchLifecycle<
  TActivity extends ReminderMismatchLifecycleActivityRecord,
  TWorkspace extends ReminderMismatchLifecycleWorkspaceRecord,
  TRecord extends DeliveryReminderMismatchLifecycleWorkspaceOverviewRecord<
    TActivity,
    TWorkspace
  >
>(input: {
  overviewRecords: TRecord[]
  reminderSupportRecords: DeliveryReminderSupportRecord[]
}): DeliveryReminderMismatchLifecycleSummary {
  const visibleWorkspaceIds = new Set<string>()
  let failedReopenAttemptsCount = 0
  let reopenedMismatchCount = 0
  let resolvedMismatchCount = 0
  let unresolvedMismatchCount = 0

  for (const overviewRecord of input.overviewRecords) {
    const workspaceId = getOverviewWorkspaceId(overviewRecord)

    if (workspaceId) {
      visibleWorkspaceIds.add(workspaceId)
    }

    const reopenLifecycleEventSummary = summarizeReopenLifecycleEvents(
      getOverviewActivityEntries(overviewRecord)
    )

    failedReopenAttemptsCount +=
      reopenLifecycleEventSummary.failedReopenAttemptsCount
    reopenedMismatchCount += reopenLifecycleEventSummary.reopenedMismatchCount
  }

  for (const reminderSupportRecord of input.reminderSupportRecords) {
    if (!reminderSupportRecord.workspaceId) {
      continue
    }

    if (!visibleWorkspaceIds.has(reminderSupportRecord.workspaceId)) {
      continue
    }

    if (reminderSupportRecord.checkpointState === "resolved") {
      resolvedMismatchCount += 1
      continue
    }

    if (reminderSupportRecord.checkpointState === "checkpoint_mismatch") {
      unresolvedMismatchCount += 1
    }
  }

  return {
    failedReopenAttemptsCount,
    reopenedMismatchCount,
    resolvedMismatchCount,
    unresolvedMismatchCount,
    visibleWorkspaceCount: visibleWorkspaceIds.size
  }
}
