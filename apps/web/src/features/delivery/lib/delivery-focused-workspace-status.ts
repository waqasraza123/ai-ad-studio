import type { DeliveryFollowUpStatus } from "@/server/database/types"
import {
  getDeliveryWorkspaceFollowUpLabel,
  getDeliveryWorkspaceReminderBucketLabel
} from "@/features/delivery/lib/delivery-workspace-follow-up"
import {
  isDeliveryReminderRepairActivityMetadata
} from "@/features/delivery/lib/delivery-reminder-repair-activity"
import {
  isDeliveryReminderSupportNoteActivityMetadata
} from "@/features/delivery/lib/delivery-reminder-support-note"
import {
  isDeliveryReminderMismatchResolutionActivityMetadata
} from "@/features/delivery/lib/delivery-reminder-mismatch-resolution"

type FocusedWorkspaceActivityRecord = {
  metadata: unknown
}

type FocusedWorkspaceRecord = {
  follow_up_due_on: string | null
  follow_up_last_notification_bucket: string | null
  follow_up_last_notification_date: string | null
  follow_up_status: DeliveryFollowUpStatus | null
  id: string
  title: string
}

export type DeliveryFocusedWorkspaceOverviewRecord<
  TActivity extends FocusedWorkspaceActivityRecord = FocusedWorkspaceActivityRecord,
  TWorkspace extends FocusedWorkspaceRecord = FocusedWorkspaceRecord
> = {
  activityEntries?: TActivity[]
  activityTimeline?: TActivity[]
  workspace: TWorkspace
}

export type DeliveryFocusedWorkspaceStatusSummary = {
  followUpDueOnLabel: string
  followUpStatusLabel: string
  latestSupportEventLabel: string
  reminderCheckpointLabel: string
  workspaceId: string
  workspaceTitle: string
}

function getActivityEntries<TActivity extends FocusedWorkspaceActivityRecord>(
  record: DeliveryFocusedWorkspaceOverviewRecord<TActivity>
) {
  if (Array.isArray(record.activityEntries)) {
    return record.activityEntries
  }

  if (Array.isArray(record.activityTimeline)) {
    return record.activityTimeline
  }

  return []
}

function formatNullableDate(value: string | null) {
  return value ?? "—"
}

function getReminderCheckpointLabel(input: {
  bucket: string | null
  date: string | null
}) {
  if (!input.bucket && !input.date) {
    return "No reminder checkpoint"
  }

  const bucketLabel =
    input.bucket === "due_today" || input.bucket === "overdue"
      ? getDeliveryWorkspaceReminderBucketLabel(input.bucket)
      : input.bucket ?? "Unknown checkpoint"

  if (input.bucket && input.date) {
    return `${bucketLabel} on ${input.date}`
  }

  if (input.bucket) {
    return bucketLabel
  }

  return `Checkpoint date ${input.date}`
}

function getSupportEventLabel(activity: FocusedWorkspaceActivityRecord) {
  if (isDeliveryReminderMismatchResolutionActivityMetadata(activity.metadata)) {
    return "Resolved reminder mismatch"
  }

  if (isDeliveryReminderSupportNoteActivityMetadata(activity.metadata)) {
    return "Support handoff note"
  }

  if (isDeliveryReminderRepairActivityMetadata(activity.metadata)) {
    return activity.metadata.repairOutcome === "error"
      ? "Failed reminder repair"
      : "Reminder repair"
  }

  return null
}

function findLatestSupportEventLabel(
  activityEntries: FocusedWorkspaceActivityRecord[]
) {
  for (const activityEntry of activityEntries) {
    const label = getSupportEventLabel(activityEntry)

    if (label) {
      return label
    }
  }

  return "No support event"
}

export function buildDeliveryFocusedWorkspaceStatusSummary<
  TActivity extends FocusedWorkspaceActivityRecord,
  TWorkspace extends FocusedWorkspaceRecord,
  TRecord extends DeliveryFocusedWorkspaceOverviewRecord<TActivity, TWorkspace>
>(input: {
  focusWorkspaceId: string | null
  overviewRecords: TRecord[]
}): DeliveryFocusedWorkspaceStatusSummary | null {
  if (!input.focusWorkspaceId) {
    return null
  }

  const focusedOverviewRecord =
    input.overviewRecords.find(
      (overviewRecord) => overviewRecord.workspace.id === input.focusWorkspaceId
    ) ?? null

  if (!focusedOverviewRecord) {
    return null
  }

  return {
    followUpDueOnLabel: formatNullableDate(
      focusedOverviewRecord.workspace.follow_up_due_on
    ),
    followUpStatusLabel: getDeliveryWorkspaceFollowUpLabel(
      focusedOverviewRecord.workspace.follow_up_status ?? "none"
    ),
    latestSupportEventLabel: findLatestSupportEventLabel(
      getActivityEntries(focusedOverviewRecord)
    ),
    reminderCheckpointLabel: getReminderCheckpointLabel({
      bucket:
        focusedOverviewRecord.workspace.follow_up_last_notification_bucket ?? null,
      date: focusedOverviewRecord.workspace.follow_up_last_notification_date ?? null
    }),
    workspaceId: focusedOverviewRecord.workspace.id,
    workspaceTitle: focusedOverviewRecord.workspace.title
  }
}
