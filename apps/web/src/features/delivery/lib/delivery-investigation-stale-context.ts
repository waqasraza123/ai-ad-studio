import type { DeliveryReminderSupportRecord } from "@/features/delivery/lib/delivery-reminder-support"

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

export type DeliveryInvestigationStaleContextSummary = {
  badges: string[]
  description: string
  title: string
  tone: "amber"
}

function buildFocusedFollowUpStaleSummary(input: {
  focusWorkspaceId: string | null
}) {
  return {
    badges: [
      "Stale follow-up context",
      input.focusWorkspaceId
        ? `Workspace ${input.focusWorkspaceId}`
        : "Missing workspace focus"
    ],
    description:
      "The investigation view is still pinned to a focused follow-up form, but that workspace is no longer visible in the current support scope. Keep the current filters and clear the stale focus, or reset to the base delivery scope.",
    title:
      "Focused follow-up context is outside the current visible support scope",
    tone: "amber" as const
  }
}

function buildFocusedReminderStaleSummary(input: {
  focusReminderNotificationId: string
}) {
  return {
    badges: [
      "Stale reminder context",
      `Reminder ${input.focusReminderNotificationId}`
    ],
    description:
      "The investigation view is still pinned to a reminder notification, but that reminder no longer appears inside the current visible reminder support scope. This usually happens after reminder support filters or support activity filters change.",
    title:
      "Focused reminder is outside the current visible reminder support scope",
    tone: "amber" as const
  }
}

function buildFocusedWorkspaceStaleSummary(input: {
  focusWorkspaceId: string
}) {
  return {
    badges: [
      "Stale workspace focus",
      `Workspace ${input.focusWorkspaceId}`
    ],
    description:
      "The investigation view is still pinned to a workspace that is no longer visible under the current support activity scope. Keep the current filters and clear the stale focus, or reset to the base delivery scope.",
    title:
      "Focused workspace is outside the current visible support activity scope",
    tone: "amber" as const
  }
}

function getActivityEntries<
  TActivity extends InvestigationActivityRecord,
  TWorkspace extends InvestigationWorkspaceRecord,
  TRecord extends DeliveryInvestigationWorkspaceOverviewRecord<TActivity, TWorkspace>
>(record: TRecord) {
  if (Array.isArray(record.activityEntries)) {
    return record.activityEntries
  }

  if (Array.isArray(record.activityTimeline)) {
    return record.activityTimeline
  }

  return []
}

export function buildDeliveryInvestigationStaleContextSummary<
  TActivity extends InvestigationActivityRecord,
  TWorkspace extends InvestigationWorkspaceRecord,
  TRecord extends DeliveryInvestigationWorkspaceOverviewRecord<TActivity, TWorkspace>
>(input: {
  focusFollowUpForm: boolean
  focusReminderNotificationId: string | null
  focusWorkspaceId: string | null
  reminderSupportRecords: DeliveryReminderSupportRecord[]
  overviewRecords: TRecord[]
}): DeliveryInvestigationStaleContextSummary | null {
  const visibleWorkspaceIds = new Set(
    input.overviewRecords.map((overviewRecord) => overviewRecord.workspace.id)
  )

  if (
    input.focusFollowUpForm &&
    (!input.focusWorkspaceId ||
      !visibleWorkspaceIds.has(input.focusWorkspaceId))
  ) {
    return buildFocusedFollowUpStaleSummary({
      focusWorkspaceId: input.focusWorkspaceId
    })
  }

  if (input.focusReminderNotificationId) {
    const visibleReminderSupportRecord =
      input.reminderSupportRecords.find(
        (record) =>
          record.notificationId === input.focusReminderNotificationId
      ) ?? null

    if (!visibleReminderSupportRecord) {
      return buildFocusedReminderStaleSummary({
        focusReminderNotificationId: input.focusReminderNotificationId
      })
    }

    if (
      visibleReminderSupportRecord.workspaceId &&
      !visibleWorkspaceIds.has(visibleReminderSupportRecord.workspaceId)
    ) {
      return buildFocusedWorkspaceStaleSummary({
        focusWorkspaceId: visibleReminderSupportRecord.workspaceId
      })
    }
  }

  if (
    input.focusWorkspaceId &&
    !visibleWorkspaceIds.has(input.focusWorkspaceId)
  ) {
    return buildFocusedWorkspaceStaleSummary({
      focusWorkspaceId: input.focusWorkspaceId
    })
  }

  return null
}
