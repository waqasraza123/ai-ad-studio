import type { DeliveryReminderSupportRecord } from "@/features/delivery/lib/delivery-reminder-support"
import type { AppMessageKey } from "@/lib/i18n/messages/en"

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

type Translate = (
  key: AppMessageKey,
  values?: Record<string, string | number | null | undefined>
) => string

function buildFocusedFollowUpStaleSummary(input: {
  focusWorkspaceId: string | null
  t?: Translate
}) {
  return {
    badges: [
      input.t
        ? input.t("delivery.investigationStale.followUp.badge")
        : "Stale follow-up context",
      input.focusWorkspaceId
        ? input.t
          ? input.t("delivery.investigationStale.workspaceBadge", {
              value: input.focusWorkspaceId
            })
          : `Workspace ${input.focusWorkspaceId}`
        : input.t
          ? input.t("delivery.investigationStale.missingWorkspaceBadge")
          : "Missing workspace focus"
    ],
    description: input.t
      ? input.t("delivery.investigationStale.followUp.description")
      : "The investigation view is still pinned to a focused follow-up form, but that workspace is no longer visible in the current support scope. Keep the current filters and clear the stale focus, or reset to the base delivery scope.",
    title: input.t
      ? input.t("delivery.investigationStale.followUp.title")
      : "Focused follow-up context is outside the current visible support scope",
    tone: "amber" as const
  }
}

function buildFocusedReminderStaleSummary(input: {
  focusReminderNotificationId: string
  t?: Translate
}) {
  return {
    badges: [
      input.t
        ? input.t("delivery.investigationStale.reminder.badge")
        : "Stale reminder context",
      input.t
        ? input.t("delivery.investigationStale.reminderIdBadge", {
            value: input.focusReminderNotificationId
          })
        : `Reminder ${input.focusReminderNotificationId}`
    ],
    description: input.t
      ? input.t("delivery.investigationStale.reminder.description")
      : "The investigation view is still pinned to a reminder notification, but that reminder no longer appears inside the current visible reminder support scope. This usually happens after reminder support filters or support activity filters change.",
    title: input.t
      ? input.t("delivery.investigationStale.reminder.title")
      : "Focused reminder is outside the current visible reminder support scope",
    tone: "amber" as const
  }
}

function buildFocusedWorkspaceStaleSummary(input: {
  focusWorkspaceId: string
  t?: Translate
}) {
  return {
    badges: [
      input.t
        ? input.t("delivery.investigationStale.workspace.badge")
        : "Stale workspace focus",
      input.t
        ? input.t("delivery.investigationStale.workspaceBadge", {
            value: input.focusWorkspaceId
          })
        : `Workspace ${input.focusWorkspaceId}`
    ],
    description: input.t
      ? input.t("delivery.investigationStale.workspace.description")
      : "The investigation view is still pinned to a workspace that is no longer visible under the current support activity scope. Keep the current filters and clear the stale focus, or reset to the base delivery scope.",
    title: input.t
      ? input.t("delivery.investigationStale.workspace.title")
      : "Focused workspace is outside the current visible support activity scope",
    tone: "amber" as const
  }
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
  t?: Translate
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
      focusWorkspaceId: input.focusWorkspaceId,
      t: input.t
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
        focusReminderNotificationId: input.focusReminderNotificationId,
        t: input.t
      })
    }

    if (
      visibleReminderSupportRecord.workspaceId &&
      !visibleWorkspaceIds.has(visibleReminderSupportRecord.workspaceId)
    ) {
      return buildFocusedWorkspaceStaleSummary({
        focusWorkspaceId: visibleReminderSupportRecord.workspaceId,
        t: input.t
      })
    }
  }

  if (
    input.focusWorkspaceId &&
    !visibleWorkspaceIds.has(input.focusWorkspaceId)
  ) {
    return buildFocusedWorkspaceStaleSummary({
      focusWorkspaceId: input.focusWorkspaceId,
      t: input.t
    })
  }

  return null
}
