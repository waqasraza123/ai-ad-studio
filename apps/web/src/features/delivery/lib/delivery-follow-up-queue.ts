import {
  getDeliveryWorkspaceFollowUpLabel,
  isDeliveryWorkspaceFollowUpUnresolved,
  resolveEffectiveDeliveryWorkspaceFollowUpStatus
} from "./delivery-workspace-follow-up"
import type { DeliveryWorkspaceOverviewRecord } from "@/features/delivery/lib/delivery-workspace-overview"
import type { DeliveryFollowUpStatus } from "@/server/database/types"

export type DeliveryFollowUpQueueRecord = {
  effectiveFollowUpLabel: string
  effectiveFollowUpStatus: DeliveryFollowUpStatus
  overviewRecord: DeliveryWorkspaceOverviewRecord
  primaryNote: string
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

export function buildDeliveryFollowUpQueueRecords(input: {
  overviewRecords: DeliveryWorkspaceOverviewRecord[]
}) {
  const queueRecords = input.overviewRecords
    .map((overviewRecord) => {
      const effectiveFollowUpStatus = resolveEffectiveDeliveryWorkspaceFollowUpStatus({
        activitySummary: overviewRecord.activitySummary,
        workspaceFollowUpStatus: overviewRecord.workspace.follow_up_status
      })

      return {
        effectiveFollowUpLabel: getDeliveryWorkspaceFollowUpLabel(
          effectiveFollowUpStatus
        ),
        effectiveFollowUpStatus,
        overviewRecord,
        primaryNote: buildPrimaryNote(overviewRecord)
      } satisfies DeliveryFollowUpQueueRecord
    })
    .filter((queueRecord) => {
      return (
        queueRecord.overviewRecord.workspace.status === "active" &&
        isDeliveryWorkspaceFollowUpUnresolved(queueRecord.effectiveFollowUpStatus)
      )
    })

  return queueRecords.sort((left, right) => {
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
