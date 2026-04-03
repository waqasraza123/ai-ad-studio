import type { DeliveryReminderSupportRecord } from "@/features/delivery/lib/delivery-reminder-support"
import {
  getDeliveryReminderRepairActionLabel,
  isDeliveryReminderRepairActivityMetadata,
  type DeliveryReminderRepairActivityMetadata
} from "@/features/delivery/lib/delivery-reminder-repair-activity"

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
  tone: "amber" | "rose"
}

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

function getReminderBucketLabel(value: "due_today" | "overdue" | null) {
  if (value === "due_today") {
    return "Due today"
  }

  if (value === "overdue") {
    return "Overdue"
  }

  return "Unspecified bucket"
}

function getReminderBucketDescription(value: "due_today" | "overdue" | null) {
  if (value === "due_today") {
    return "due today"
  }

  if (value === "overdue") {
    return "overdue"
  }

  return "unspecified"
}

function getCheckpointLabel(input: {
  bucket: "due_today" | "overdue" | null
  date: string | null
}) {
  if (!input.bucket && !input.date) {
    return "no recorded reminder checkpoint"
  }

  if (input.bucket && input.date) {
    return `${getReminderBucketDescription(input.bucket)} on ${input.date}`
  }

  if (input.bucket) {
    return `${getReminderBucketDescription(input.bucket)} with no checkpoint date`
  }

  return `unknown bucket on ${input.date}`
}

function getFollowUpStateLabel(input: {
  dueOn: string | null
  status: string | null
}) {
  if (!input.status) {
    return "unknown"
  }

  if (!input.dueOn) {
    return input.status
  }

  return `${input.status} on ${input.dueOn}`
}

function getFailedRepairReasonText(
  metadata: DeliveryReminderRepairActivityMetadata
) {
  if (metadata.errorCode === "reason_required") {
    return "because clear reminder scheduling required an explicit operator reason"
  }

  if (metadata.errorCode === "reason_too_long") {
    return "because the clear reason exceeded the allowed length"
  }

  if (metadata.errorCode === "handoff_note_too_long") {
    return "because the support handoff note exceeded the allowed length"
  }

  return "and left the follow-up state unchanged"
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
  workspaceTitle: string
}): DeliveryInvestigationContextSummary {
  const actionLabel = getDeliveryReminderRepairActionLabel(
    input.failedRepairActivity.repairAction
  )

  return {
    badges: [
      "Failed reminder repair",
      getReminderBucketLabel(input.failedRepairActivity.reminderBucket),
      actionLabel
    ],
    description: `The latest support repair for ${input.workspaceTitle} tried to ${actionLabel.toLowerCase()} from ${getReminderBucketDescription(
      input.failedRepairActivity.reminderBucket
    )} reminder context ${getFailedRepairReasonText(
      input.failedRepairActivity
    )}. Current follow-up state is ${getFollowUpStateLabel({
      dueOn: input.failedRepairActivity.previousFollowUpDueOn,
      status: input.failedRepairActivity.previousFollowUpStatus
    })}.`,
    title: `Why this view matters: ${input.workspaceTitle} has a failed reminder repair`,
    tone: "rose"
  }
}

function buildUnresolvedMismatchSummary(input: {
  reminderSupportRecord: DeliveryReminderSupportRecord
  workspaceTitle: string
}): DeliveryInvestigationContextSummary {
  return {
    badges: [
      "Unresolved mismatch",
      getReminderBucketLabel(input.reminderSupportRecord.reminderBucket),
      `Notification ${input.reminderSupportRecord.notificationId}`
    ],
    description: `The focused reminder notification for ${input.workspaceTitle} is still out of sync with the current workspace checkpoint. The reminder was sent for ${getReminderBucketDescription(
      input.reminderSupportRecord.reminderBucket
    )} context, but the workspace currently shows ${getCheckpointLabel({
      bucket:
        input.reminderSupportRecord.workspaceLastNotificationBucket ?? null,
      date: input.reminderSupportRecord.workspaceLastNotificationDate ?? null
    })}. Current follow-up state is ${getFollowUpStateLabel({
      dueOn: input.reminderSupportRecord.workspaceFollowUpDueOn ?? null,
      status: input.reminderSupportRecord.workspaceFollowUpStatus ?? null
    })}.`,
    title: `Why this view matters: ${input.workspaceTitle} still has an unresolved reminder mismatch`,
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

  const failedRepairActivity = findLatestFailedReminderRepairActivity(
    getActivityEntries(focusedOverviewRecord)
  )

  if (failedRepairActivity) {
    return buildFailedRepairSummary({
      failedRepairActivity,
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
      workspaceTitle: focusedOverviewRecord.workspace.title
    })
  }

  return null
}
