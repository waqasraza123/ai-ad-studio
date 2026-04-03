import type { DeliveryReminderSupportRecord } from "@/features/delivery/lib/delivery-reminder-support"
import {
  isDeliveryReminderRepairActivityMetadata
} from "@/features/delivery/lib/delivery-reminder-repair-activity"
import {
  isDeliveryReminderSupportNoteActivityMetadata
} from "@/features/delivery/lib/delivery-reminder-support-note"

type SupportActivityRecord = {
  metadata: unknown
}

type SupportWorkspaceRecord = {
  id: string
}

export type DeliverySupportOpsSummary = {
  failedReminderRepairWorkspaceCount: number
  supportHandoffWorkspaceCount: number
  unresolvedReminderMismatchWorkspaceCount: number
  visibleSupportWorkspaceCount: number
}

export type DeliverySupportOpsWorkspaceOverviewRecord<
  TActivity extends SupportActivityRecord = SupportActivityRecord,
  TWorkspace extends SupportWorkspaceRecord = SupportWorkspaceRecord
> = {
  activityEntries?: TActivity[]
  activityTimeline?: TActivity[]
  workspace: TWorkspace
}

function getActivityEntries<TActivity extends SupportActivityRecord>(
  record: DeliverySupportOpsWorkspaceOverviewRecord<TActivity>
) {
  if (Array.isArray(record.activityEntries)) {
    return record.activityEntries
  }

  if (Array.isArray(record.activityTimeline)) {
    return record.activityTimeline
  }

  return []
}

function hasFailedReminderRepairActivity(activities: SupportActivityRecord[]) {
  return activities.some((activity) => {
    if (!isDeliveryReminderRepairActivityMetadata(activity.metadata)) {
      return false
    }

    return activity.metadata.repairOutcome === "error"
  })
}

function hasSupportHandoffNoteActivity(activities: SupportActivityRecord[]) {
  return activities.some((activity) =>
    isDeliveryReminderSupportNoteActivityMetadata(activity.metadata)
  )
}

export function summarizeDeliverySupportOps<
  TActivity extends SupportActivityRecord,
  TWorkspace extends SupportWorkspaceRecord,
  TRecord extends DeliverySupportOpsWorkspaceOverviewRecord<TActivity, TWorkspace>
>(input: {
  overviewRecords: TRecord[]
  reminderSupportRecords: DeliveryReminderSupportRecord[]
}): DeliverySupportOpsSummary {
  const visibleWorkspaceIds = new Set<string>()
  const failedReminderRepairWorkspaceIds = new Set<string>()
  const supportHandoffWorkspaceIds = new Set<string>()
  const unresolvedReminderMismatchWorkspaceIds = new Set<string>()

  for (const overviewRecord of input.overviewRecords) {
    const workspaceId = overviewRecord.workspace.id
    visibleWorkspaceIds.add(workspaceId)

    const activityEntries = getActivityEntries(overviewRecord)

    if (hasFailedReminderRepairActivity(activityEntries)) {
      failedReminderRepairWorkspaceIds.add(workspaceId)
    }

    if (hasSupportHandoffNoteActivity(activityEntries)) {
      supportHandoffWorkspaceIds.add(workspaceId)
    }
  }

  for (const reminderSupportRecord of input.reminderSupportRecords) {
    if (reminderSupportRecord.checkpointState !== "checkpoint_mismatch") {
      continue
    }

    if (!reminderSupportRecord.workspaceId) {
      continue
    }

    if (!visibleWorkspaceIds.has(reminderSupportRecord.workspaceId)) {
      continue
    }

    unresolvedReminderMismatchWorkspaceIds.add(reminderSupportRecord.workspaceId)
  }

  return {
    failedReminderRepairWorkspaceCount: failedReminderRepairWorkspaceIds.size,
    supportHandoffWorkspaceCount: supportHandoffWorkspaceIds.size,
    unresolvedReminderMismatchWorkspaceCount:
      unresolvedReminderMismatchWorkspaceIds.size,
    visibleSupportWorkspaceCount: visibleWorkspaceIds.size
  }
}
