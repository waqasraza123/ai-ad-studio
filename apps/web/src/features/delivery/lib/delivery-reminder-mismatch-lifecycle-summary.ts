import { isDeliveryReminderMismatchReopenActivityMetadata } from "@/features/delivery/lib/delivery-reminder-mismatch-reopen"

type ReminderMismatchLifecycleSummaryActivityRecord = {
  metadata: unknown
}

type ReminderMismatchLifecycleSummarySupportRecord = {
  checkpointState: string | null
}

type ReminderMismatchLifecycleSummaryWorkspaceRecord = {
  activities?: ReminderMismatchLifecycleSummaryActivityRecord[] | null
  activityRecords?: ReminderMismatchLifecycleSummaryActivityRecord[] | null
  activityTimeline?: ReminderMismatchLifecycleSummaryActivityRecord[] | null
  timeline?: ReminderMismatchLifecycleSummaryActivityRecord[] | null
}

export type DeliveryReminderMismatchLifecycleSummary = {
  failedReopenAttemptsCount: number
  reopenedCount: number
  resolvedCount: number
  unresolvedCount: number
}

function getWorkspaceActivityRecords(
  record: ReminderMismatchLifecycleSummaryWorkspaceRecord
) {
  if (Array.isArray(record.activityTimeline)) {
    return record.activityTimeline
  }

  if (Array.isArray(record.activityRecords)) {
    return record.activityRecords
  }

  if (Array.isArray(record.activities)) {
    return record.activities
  }

  if (Array.isArray(record.timeline)) {
    return record.timeline
  }

  return []
}

export function buildDeliveryReminderMismatchLifecycleSummary(input: {
  reminderSupportRecords: ReminderMismatchLifecycleSummarySupportRecord[]
  workspaceRecords: ReminderMismatchLifecycleSummaryWorkspaceRecord[]
}): DeliveryReminderMismatchLifecycleSummary {
  let unresolvedCount = 0
  let resolvedCount = 0

  for (const record of input.reminderSupportRecords) {
    if (record.checkpointState === "checkpoint_mismatch") {
      unresolvedCount += 1
      continue
    }

    if (record.checkpointState === "resolved") {
      resolvedCount += 1
    }
  }

  let reopenedCount = 0
  let failedReopenAttemptsCount = 0

  for (const workspaceRecord of input.workspaceRecords) {
    for (const activity of getWorkspaceActivityRecords(workspaceRecord)) {
      if (!isDeliveryReminderMismatchReopenActivityMetadata(activity.metadata)) {
        continue
      }

      if (activity.metadata.reopenOutcome === "error") {
        failedReopenAttemptsCount += 1
      } else {
        reopenedCount += 1
      }
    }
  }

  return {
    failedReopenAttemptsCount,
    reopenedCount,
    resolvedCount,
    unresolvedCount
  }
}
