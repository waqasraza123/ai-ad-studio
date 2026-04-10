import type { DeliveryReminderSupportRecord } from "./delivery-reminder-support"
import type { AppMessageKey } from "@/lib/i18n/messages/en"
import {
  isDeliveryReminderRepairActivityMetadata,
  type DeliveryReminderRepairActivityMetadata
} from "./delivery-reminder-repair-activity"
import { getDeliveryReminderRepairActionLabel } from "./delivery-reminder-repair-outcome"
import {
  getDeliveryWorkspaceFollowUpLabel,
  getDeliveryWorkspaceFollowUpLabelKey
} from "./delivery-workspace-follow-up"

type InvestigationActivityRecord = {
  metadata: unknown
}

type InvestigationWorkspaceRecord = {
  id: string
  title: string
}

export type DeliveryInvestigationWorkspaceOverviewRecord<
  TActivity extends InvestigationActivityRecord = InvestigationActivityRecord,
  TWorkspace extends InvestigationWorkspaceRecord = InvestigationWorkspaceRecord
> = {
  activityEntries?: TActivity[]
  activityTimeline?: TActivity[]
  workspace: TWorkspace
}

export type DeliveryInvestigationContextSummary = {
  badges: string[]
  description: string
  title: string
  tone: "amber" | "emerald" | "rose"
}

type Translate = (
  key: AppMessageKey,
  values?: Record<string, string | number | null | undefined>
) => string

function getActivityEntries<TActivity extends InvestigationActivityRecord>(
  record: DeliveryInvestigationWorkspaceOverviewRecord<TActivity>
) {
  if (Array.isArray(record.activityEntries)) {
    return record.activityEntries
  }

  if (Array.isArray(record.activityTimeline)) {
    return record.activityTimeline
  }

  return []
}

function getReminderBucketLabel(value: string | null, t?: Translate) {
  if (value === "due_today") {
    return t
      ? t("delivery.investigationContext.bucket.dueToday")
      : "Due today"
  }

  if (value === "overdue") {
    return t ? t("delivery.investigationContext.bucket.overdue") : "Overdue"
  }

  return t
    ? t("delivery.investigationContext.bucket.unspecified")
    : "Unspecified bucket"
}

function getReminderBucketDescription(value: string | null, t?: Translate) {
  if (value === "due_today") {
    return t
      ? t("delivery.investigationContext.bucketDescription.dueToday")
      : "due today"
  }

  if (value === "overdue") {
    return t
      ? t("delivery.investigationContext.bucketDescription.overdue")
      : "overdue"
  }

  return t
    ? t("delivery.investigationContext.bucketDescription.unspecified")
    : "unspecified"
}

function getCheckpointLabel(input: {
  bucket: string | null
  date: string | null
  t?: Translate
}) {
  if (!input.bucket && !input.date) {
    return input.t
      ? input.t("delivery.investigationContext.noRecordedCheckpoint")
      : "no recorded reminder checkpoint"
  }

  if (input.bucket && input.date) {
    const bucket = getReminderBucketDescription(input.bucket, input.t)
    return input.t
      ? input.t("delivery.investigationContext.checkpoint.withDate", {
          bucket,
          date: input.date
        })
      : `${bucket} on ${input.date}`
  }

  if (input.bucket) {
    const bucket = getReminderBucketDescription(input.bucket, input.t)
    return input.t
      ? input.t("delivery.investigationContext.checkpoint.withNoDate", {
          bucket
        })
      : `${bucket} with no checkpoint date`
  }

  return input.t
    ? input.t("delivery.investigationContext.checkpoint.unknownBucket", {
        date: input.date
      })
    : `unknown bucket on ${input.date}`
}

function getFollowUpStateLabel(input: {
  dueOn: string | null
  status: string | null
  t?: Translate
}) {
  if (!input.status) {
    return input.t
      ? input.t("delivery.investigationContext.followUp.unknown")
      : "unknown"
  }

  if (!input.dueOn) {
    return input.t
      ? tFromStatus(input.status, input.t)
      : input.status
  }

  const status = input.t ? tFromStatus(input.status, input.t) : input.status
  return input.t
    ? input.t("delivery.investigationContext.followUp.withDate", {
        status,
        date: input.dueOn
      })
    : `${status} on ${input.dueOn}`
}

function tFromStatus(status: string, t: Translate) {
  if (
    status === "none" ||
    status === "needs_follow_up" ||
    status === "reminder_scheduled" ||
    status === "waiting_on_client" ||
    status === "resolved"
  ) {
    return t(getDeliveryWorkspaceFollowUpLabelKey(status))
  }

  return status
}

function getFailedRepairReasonText(
  metadata: DeliveryReminderRepairActivityMetadata,
  t?: Translate
) {
  if (metadata.errorCode === "reason_required") {
    return t
      ? t("delivery.investigationContext.failedRepair.reasonRequired")
      : "because clear reminder scheduling required an explicit operator reason"
  }

  if (metadata.errorCode === "reason_too_long") {
    return t
      ? t("delivery.investigationContext.failedRepair.reasonTooLong")
      : "because the clear reason exceeded the allowed length"
  }

  if (metadata.errorCode === "disallowed_wording") {
    return t
      ? t("delivery.investigationContext.failedRepair.disallowedWording")
      : "because the submitted wording was not allowed"
  }

  return t
    ? t("delivery.investigationContext.failedRepair.unchanged")
    : "and left the follow-up state unchanged"
}

function findLatestFailedReminderRepairActivity<
  TActivity extends InvestigationActivityRecord
>(activityEntries: TActivity[]) {
  for (const activityEntry of activityEntries) {
    if (!isDeliveryReminderRepairActivityMetadata(activityEntry.metadata)) {
      continue
    }

    if (activityEntry.metadata.repairOutcome !== "error") {
      continue
    }

    return activityEntry.metadata
  }

  return null
}

function buildFailedRepairSummary(input: {
  failedRepairActivity: DeliveryReminderRepairActivityMetadata
  t?: Translate
  workspaceTitle: string
}): DeliveryInvestigationContextSummary {
  const actionLabel = input.t
    ? input.t(
        input.failedRepairActivity.repairAction === "reschedule_tomorrow"
          ? "delivery.repairOutcome.action.rescheduleTomorrow"
          : "delivery.repairOutcome.action.clearReminderScheduling"
      )
    : getDeliveryReminderRepairActionLabel(input.failedRepairActivity.repairAction)

  return {
    badges: [
      input.t
        ? input.t("delivery.investigationContext.failedRepair.badge")
        : "Failed reminder repair",
      getReminderBucketLabel(input.failedRepairActivity.reminderBucket, input.t),
      actionLabel
    ],
    description: input.t
      ? input.t("delivery.investigationContext.failedRepair.description", {
          action: actionLabel.toLowerCase(),
          bucket: getReminderBucketDescription(
            input.failedRepairActivity.reminderBucket,
            input.t
          ),
          reason: getFailedRepairReasonText(input.failedRepairActivity, input.t),
          status: getFollowUpStateLabel({
            dueOn: input.failedRepairActivity.previousFollowUpDueOn,
            status: input.failedRepairActivity.previousFollowUpStatus,
            t: input.t
          }),
          workspace: input.workspaceTitle
        })
      : `The latest support repair for ${input.workspaceTitle} tried to ${actionLabel.toLowerCase()} from ${getReminderBucketDescription(
          input.failedRepairActivity.reminderBucket
        )} reminder context ${getFailedRepairReasonText(
          input.failedRepairActivity
        )}. Current follow-up state is ${getFollowUpStateLabel({
          dueOn: input.failedRepairActivity.previousFollowUpDueOn,
          status: input.failedRepairActivity.previousFollowUpStatus
        })}.`,
    title: input.t
      ? input.t("delivery.investigationContext.failedRepair.title", {
          workspace: input.workspaceTitle
        })
      : `Why this view matters: ${input.workspaceTitle} has a failed reminder repair`,
    tone: "rose"
  }
}

function buildResolvedMismatchSummary(input: {
  reminderSupportRecord: DeliveryReminderSupportRecord
  t?: Translate
  workspaceTitle: string
}): DeliveryInvestigationContextSummary {
  return {
    badges: [
      input.t
        ? input.t("delivery.investigationContext.resolved.badge")
        : "Resolved mismatch",
      getReminderBucketLabel(input.reminderSupportRecord.reminderBucket, input.t),
      input.t
        ? input.t("delivery.investigationContext.notificationBadge", {
            id: input.reminderSupportRecord.notificationId
          })
        : `Notification ${input.reminderSupportRecord.notificationId}`
    ],
    description: input.t
      ? input.t("delivery.investigationContext.resolved.description", {
          status: getFollowUpStateLabel({
            dueOn: input.reminderSupportRecord.workspaceFollowUpDueOn ?? null,
            status: input.reminderSupportRecord.workspaceFollowUpStatus ?? null,
            t: input.t
          }),
          workspace: input.workspaceTitle
        })
      : `The focused reminder notification for ${input.workspaceTitle} was marked as resolved from the workspace view. Current follow-up state is ${getFollowUpStateLabel({
          dueOn: input.reminderSupportRecord.workspaceFollowUpDueOn ?? null,
          status: input.reminderSupportRecord.workspaceFollowUpStatus ?? null
        })}.`,
    title: input.t
      ? input.t("delivery.investigationContext.resolved.title", {
          workspace: input.workspaceTitle
        })
      : `Why this view matters: ${input.workspaceTitle} has a resolved reminder mismatch`,
    tone: "emerald"
  }
}

function buildUnresolvedMismatchSummary(input: {
  reminderSupportRecord: DeliveryReminderSupportRecord
  t?: Translate
  workspaceTitle: string
}): DeliveryInvestigationContextSummary {
  return {
    badges: [
      input.t
        ? input.t("delivery.investigationContext.unresolved.badge")
        : "Unresolved mismatch",
      getReminderBucketLabel(input.reminderSupportRecord.reminderBucket, input.t),
      input.t
        ? input.t("delivery.investigationContext.notificationBadge", {
            id: input.reminderSupportRecord.notificationId
          })
        : `Notification ${input.reminderSupportRecord.notificationId}`
    ],
    description: input.t
      ? input.t("delivery.investigationContext.unresolved.description", {
          bucket: getReminderBucketDescription(
            input.reminderSupportRecord.reminderBucket,
            input.t
          ),
          checkpoint: getCheckpointLabel({
            bucket:
              input.reminderSupportRecord.workspaceLastNotificationBucket ?? null,
            date: input.reminderSupportRecord.workspaceLastNotificationDate ?? null,
            t: input.t
          }),
          status: getFollowUpStateLabel({
            dueOn: input.reminderSupportRecord.workspaceFollowUpDueOn ?? null,
            status: input.reminderSupportRecord.workspaceFollowUpStatus ?? null,
            t: input.t
          }),
          workspace: input.workspaceTitle
        })
      : `The focused reminder notification for ${input.workspaceTitle} is still out of sync with the current workspace checkpoint. The reminder was sent for ${getReminderBucketDescription(
          input.reminderSupportRecord.reminderBucket
        )} context, but the workspace currently shows ${getCheckpointLabel({
          bucket:
            input.reminderSupportRecord.workspaceLastNotificationBucket ?? null,
          date: input.reminderSupportRecord.workspaceLastNotificationDate ?? null
        })}. Current follow-up state is ${getFollowUpStateLabel({
          dueOn: input.reminderSupportRecord.workspaceFollowUpDueOn ?? null,
          status: input.reminderSupportRecord.workspaceFollowUpStatus ?? null
        })}.`,
    title: input.t
      ? input.t("delivery.investigationContext.unresolved.title", {
          workspace: input.workspaceTitle
        })
      : `Why this view matters: ${input.workspaceTitle} still has an unresolved reminder mismatch`,
    tone: "amber"
  }
}

export function buildDeliveryInvestigationContextSummary<
  TActivity extends InvestigationActivityRecord,
  TWorkspace extends InvestigationWorkspaceRecord,
  TRecord extends DeliveryInvestigationWorkspaceOverviewRecord<TActivity, TWorkspace>
>(input: {
  focusedReminderSupportRecord: DeliveryReminderSupportRecord | null
  focusWorkspaceId: string | null
  overviewRecords: TRecord[]
  t?: Translate
}): DeliveryInvestigationContextSummary | null {
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

  if (
    input.focusedReminderSupportRecord &&
    input.focusedReminderSupportRecord.workspaceId === input.focusWorkspaceId &&
    input.focusedReminderSupportRecord.checkpointState === "resolved"
  ) {
    return buildResolvedMismatchSummary({
      reminderSupportRecord: input.focusedReminderSupportRecord,
      t: input.t,
      workspaceTitle: focusedOverviewRecord.workspace.title
    })
  }

  if (
    input.focusedReminderSupportRecord &&
    input.focusedReminderSupportRecord.workspaceId === input.focusWorkspaceId &&
    input.focusedReminderSupportRecord.checkpointState === "resolved"
  ) {
    return buildResolvedMismatchSummary({
      reminderSupportRecord: input.focusedReminderSupportRecord,
      t: input.t,
      workspaceTitle: focusedOverviewRecord.workspace.title
    })
  }

  const failedRepairActivity = findLatestFailedReminderRepairActivity(
    getActivityEntries(focusedOverviewRecord)
  )

  if (failedRepairActivity) {
    return buildFailedRepairSummary({
      failedRepairActivity,
      t: input.t,
      workspaceTitle: focusedOverviewRecord.workspace.title
    })
  }

  if (
    input.focusedReminderSupportRecord &&
    input.focusedReminderSupportRecord.workspaceId === input.focusWorkspaceId &&
    input.focusedReminderSupportRecord.checkpointState === "checkpoint_mismatch"
  ) {
    return buildUnresolvedMismatchSummary({
      reminderSupportRecord: input.focusedReminderSupportRecord,
      t: input.t,
      workspaceTitle: focusedOverviewRecord.workspace.title
    })
  }

  return null
}
