import {
  getDeliveryWorkspaceFollowUpLabel,
  getDeliveryWorkspaceReminderBucketLabel,
  isDeliveryWorkspaceFollowUpUnresolved,
  resolveDeliveryWorkspaceReminderBucket,
  resolveEffectiveDeliveryWorkspaceFollowUpStatus
} from "./delivery-workspace-follow-up"
import type { DeliveryWorkspaceOverviewRecord } from "./delivery-workspace-overview"
import type {
  DeliveryFollowUpStatus,
  DeliveryReminderBucket
} from "@/server/database/types"

export type DeliveryFollowUpQueueRecord = {
  effectiveFollowUpLabel: string
  effectiveFollowUpStatus: DeliveryFollowUpStatus
  overviewRecord: DeliveryWorkspaceOverviewRecord
  primaryNote: string
  reminderBucket: DeliveryReminderBucket
  reminderBucketLabel: string | null
}

export type DeliveryFollowUpQueueSummary = {
  dueTodayCount: number
  overdueCount: number
  totalCount: number
  upcomingCount: number
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

function buildPrimaryNote(overviewRecord: DeliveryWorkspaceOverviewRecord) {
  const ownerNote = overviewRecord.workspace.follow_up_note?.trim()

  if (ownerNote) {
    return ownerNote
  }

  return overviewRecord.activityExcerpt
}

function getReminderBucketPriority(bucket: DeliveryReminderBucket) {
  if (bucket === "overdue") {
    return 0
  }

  if (bucket === "due_today") {
    return 1
  }

  if (bucket === "upcoming") {
    return 2
  }

  return 3
}

export function buildDeliveryFollowUpQueueRecords(input: {
  overviewRecords: DeliveryWorkspaceOverviewRecord[]
  todayDateKey: string
}) {
  const queueRecords = input.overviewRecords
    .map((overviewRecord) => {
      const effectiveFollowUpStatus = resolveEffectiveDeliveryWorkspaceFollowUpStatus({
        activitySummary: overviewRecord.activitySummary,
        workspaceFollowUpStatus: overviewRecord.workspace.follow_up_status
      })

      const reminderBucket = resolveDeliveryWorkspaceReminderBucket({
        followUpDueOn: overviewRecord.workspace.follow_up_due_on,
        followUpStatus: effectiveFollowUpStatus,
        todayDateKey: input.todayDateKey
      })

      return {
        effectiveFollowUpLabel: getDeliveryWorkspaceFollowUpLabel(
          effectiveFollowUpStatus
        ),
        effectiveFollowUpStatus,
        overviewRecord,
        primaryNote: buildPrimaryNote(overviewRecord),
        reminderBucket,
        reminderBucketLabel:
          reminderBucket === "none"
            ? null
            : getDeliveryWorkspaceReminderBucketLabel(reminderBucket)
      } satisfies DeliveryFollowUpQueueRecord
    })
    .filter((queueRecord) => {
      return (
        queueRecord.overviewRecord.workspace.status === "active" &&
        isDeliveryWorkspaceFollowUpUnresolved(queueRecord.effectiveFollowUpStatus)
      )
    })

  return queueRecords.sort((left, right) => {
    const reminderPriorityComparison =
      getReminderBucketPriority(left.reminderBucket) -
      getReminderBucketPriority(right.reminderBucket)

    if (reminderPriorityComparison !== 0) {
      return reminderPriorityComparison
    }

    const latestActivityComparison = compareDescending(
      left.overviewRecord.latestActivityAt,
      right.overviewRecord.latestActivityAt
    )

    if (latestActivityComparison !== 0) {
      return latestActivityComparison
    }

    const followUpUpdatedComparison = compareDescending(
      left.overviewRecord.workspace.follow_up_updated_at,
      right.overviewRecord.workspace.follow_up_updated_at
    )

    if (followUpUpdatedComparison !== 0) {
      return followUpUpdatedComparison
    }

    return compareDescending(
      left.overviewRecord.workspace.created_at,
      right.overviewRecord.workspace.created_at
    )
  })
}

export function summarizeDeliveryFollowUpQueue(
  queueRecords: DeliveryFollowUpQueueRecord[]
): DeliveryFollowUpQueueSummary {
  let overdueCount = 0
  let dueTodayCount = 0
  let upcomingCount = 0

  for (const queueRecord of queueRecords) {
    if (queueRecord.reminderBucket === "overdue") {
      overdueCount += 1
      continue
    }

    if (queueRecord.reminderBucket === "due_today") {
      dueTodayCount += 1
      continue
    }

    if (queueRecord.reminderBucket === "upcoming") {
      upcomingCount += 1
    }
  }

  return {
    dueTodayCount,
    overdueCount,
    totalCount: queueRecords.length,
    upcomingCount
  }
}
