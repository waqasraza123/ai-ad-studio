import type { DeliveryFollowUpStatus } from "@/server/database/types"
import type { AppMessageKey } from "@/lib/i18n/messages/en"
import {
  getDeliveryWorkspaceFollowUpLabel,
  getDeliveryWorkspaceFollowUpLabelKey,
  getDeliveryWorkspaceReminderBucketLabel
  ,
  getDeliveryWorkspaceReminderBucketLabelKey
} from "./delivery-workspace-follow-up"
import {
  isDeliveryReminderRepairActivityMetadata
} from "./delivery-reminder-repair-activity"
import {
  isDeliveryReminderSupportNoteActivityMetadata
} from "./delivery-reminder-support-note"
import {
  isDeliveryReminderMismatchResolutionActivityMetadata
} from "./delivery-reminder-mismatch-resolution"

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

type Translate = (
  key: AppMessageKey,
  values?: Record<string, string | number | null | undefined>
) => string

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
  t?: Translate
}) {
  if (!input.bucket && !input.date) {
    return input.t
      ? input.t("delivery.focusedStatus.noReminderCheckpoint")
      : "No reminder checkpoint"
  }

  const bucketLabel =
    input.bucket === "due_today" || input.bucket === "overdue"
      ? input.t
        ? input.t(getDeliveryWorkspaceReminderBucketLabelKey(input.bucket))
        : getDeliveryWorkspaceReminderBucketLabel(input.bucket)
      : input.bucket ??
        (input.t
          ? input.t("delivery.focusedStatus.unknownCheckpoint")
          : "Unknown checkpoint")

  if (input.bucket && input.date) {
    return input.t
      ? input.t("delivery.focusedStatus.checkpointWithDate", {
          bucket: bucketLabel,
          date: input.date
        })
      : `${bucketLabel} on ${input.date}`
  }

  if (input.bucket) {
    return bucketLabel
  }

  return input.t
    ? input.t("delivery.focusedStatus.checkpointDateOnly", {
        date: input.date
      })
    : `Checkpoint date ${input.date}`
}

function getSupportEventLabel(
  activity: FocusedWorkspaceActivityRecord,
  t?: Translate
) {
  if (isDeliveryReminderMismatchResolutionActivityMetadata(activity.metadata)) {
    return t
      ? t("delivery.focusedStatus.resolvedReminderMismatch")
      : "Resolved reminder mismatch"
  }

  if (isDeliveryReminderSupportNoteActivityMetadata(activity.metadata)) {
    return t
      ? t("delivery.focusedStatus.supportHandoffNote")
      : "Support handoff note"
  }

  if (isDeliveryReminderRepairActivityMetadata(activity.metadata)) {
    return activity.metadata.repairOutcome === "error"
      ? t
        ? t("delivery.focusedStatus.failedReminderRepair")
        : "Failed reminder repair"
      : t
        ? t("delivery.focusedStatus.reminderRepair")
        : "Reminder repair"
  }

  return null
}

function findLatestSupportEventLabel(
  activityEntries: FocusedWorkspaceActivityRecord[],
  t?: Translate
) {
  for (const activityEntry of activityEntries) {
    const label = getSupportEventLabel(activityEntry, t)

    if (label) {
      return label
    }
  }

  return t ? t("delivery.focusedStatus.noSupportEvent") : "No support event"
}

export function buildDeliveryFocusedWorkspaceStatusSummary<
  TActivity extends FocusedWorkspaceActivityRecord,
  TWorkspace extends FocusedWorkspaceRecord,
  TRecord extends DeliveryFocusedWorkspaceOverviewRecord<TActivity, TWorkspace>
>(input: {
  focusWorkspaceId: string | null
  overviewRecords: TRecord[]
  t?: Translate
  formatDate?: (value: Date | number | string) => string
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
    followUpDueOnLabel: focusedOverviewRecord.workspace.follow_up_due_on
      ? input.formatDate
        ? input.formatDate(
            `${focusedOverviewRecord.workspace.follow_up_due_on}T00:00:00Z`
          )
        : focusedOverviewRecord.workspace.follow_up_due_on
      : input.t
        ? input.t("common.words.notSet")
        : formatNullableDate(focusedOverviewRecord.workspace.follow_up_due_on),
    followUpStatusLabel: input.t
      ? input.t(
          getDeliveryWorkspaceFollowUpLabelKey(
            focusedOverviewRecord.workspace.follow_up_status ?? "none"
          )
        )
      : getDeliveryWorkspaceFollowUpLabel(
          focusedOverviewRecord.workspace.follow_up_status ?? "none"
        ),
    latestSupportEventLabel: findLatestSupportEventLabel(
      getActivityEntries(focusedOverviewRecord),
      input.t
    ),
    reminderCheckpointLabel: getReminderCheckpointLabel({
      bucket:
        focusedOverviewRecord.workspace.follow_up_last_notification_bucket ?? null,
      date: focusedOverviewRecord.workspace.follow_up_last_notification_date ?? null,
      t: input.t
    }),
    workspaceId: focusedOverviewRecord.workspace.id,
    workspaceTitle: focusedOverviewRecord.workspace.title
  }
}
