import { DeliveryReminderRepairOutcomeBanner } from "@/features/delivery/components/delivery-reminder-repair-outcome-banner"
import { DeliveryReminderSupportPanel } from "@/features/delivery/components/delivery-reminder-support-panel"
import {
  buildDeliveryReminderSupportRecords,
  summarizeDeliveryReminderSupportRecords
} from "@/features/delivery/lib/delivery-reminder-support"
import { listRecentDeliveryReminderNotificationsByOwner } from "@/server/notifications/delivery-reminder-notification-repository"

import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  listDeliveryWorkspaceEventsByWorkspaceIdsForOwner,
  listDeliveryWorkspacesByOwner
} from "@/server/delivery-workspaces/delivery-workspace-repository"
import { listProjectsByOwner } from "@/server/projects/project-repository"
import { DeliveryDashboardSummaryPanel } from "@/features/delivery/components/delivery-dashboard-summary-panel"
import { DeliveryFollowUpQueue } from "@/features/delivery/components/delivery-follow-up-queue"
import { DeliveryOverdueRemindersPanel } from "@/features/delivery/components/delivery-overdue-reminders-panel"
import { DeliveryWorkspaceList } from "@/features/delivery/components/delivery-workspace-list"
import {
  buildDeliveryFollowUpQueueRecords,
  listOverdueDeliveryFollowUpQueueRecords,
  summarizeDeliveryFollowUpQueue
} from "@/features/delivery/lib/delivery-follow-up-queue"
import {
  buildDeliveryWorkspaceOverviewRecords,
  filterAndSortDeliveryWorkspaceOverviewRecords,
  normalizeDeliveryWorkspaceQuickFilter,
  normalizeDeliveryWorkspaceSortKey,
  normalizeDeliveryWorkspaceStatusFilter,
  summarizeDeliveryDashboardOverview
} from "@/features/delivery/lib/delivery-workspace-overview"

import {
  findFocusedDeliveryReminderSupportRecord,
  resolveFocusedFollowUpFormWorkspaceId
} from "@/features/delivery/lib/delivery-reminder-follow-up-focus"
import {
  normalizeFocusedReminderNotificationId,
  normalizeFocusedWorkspaceId,
  normalizeFollowUpFormFocus
} from "@/features/delivery/lib/delivery-reminder-support-links"
import {
  filterDeliveryReminderSupportRecords,
  normalizeDeliveryReminderSupportFilter
} from "@/features/delivery/lib/delivery-reminder-support-filter"
import { normalizeDeliveryReminderRepairOutcome } from "@/features/delivery/lib/delivery-reminder-repair-outcome"

type DeliveryPageProps = {
  searchParams: Promise<{
    activity?: string
    focus_follow_up_form?: string
    focus_reminder_notification_id?: string
    focus_workspace_id?: string
    reminder_repair_action?: string
    reminder_repair_error_code?: string
    reminder_repair_notification_id?: string
    reminder_repair_status?: string
    reminder_repair_workspace_id?: string
    reminder_support_filter?: string
    sort?: string
    status?: string
  }>
}

export default async function DeliveryPage({
  searchParams
}: DeliveryPageProps) {
  const user = await getAuthenticatedUser()

  if (!user) {
    return null
  }

  const resolvedSearchParams = await searchParams
  const reminderRepairOutcome = normalizeDeliveryReminderRepairOutcome({
    action: resolvedSearchParams.reminder_repair_action,
    errorCode: resolvedSearchParams.reminder_repair_error_code,
    notificationId: resolvedSearchParams.reminder_repair_notification_id,
    status: resolvedSearchParams.reminder_repair_status,
    workspaceId: resolvedSearchParams.reminder_repair_workspace_id
  })
  const selectedActivityFilter = normalizeDeliveryWorkspaceQuickFilter(
    resolvedSearchParams.activity
  )
  const selectedStatusFilter = normalizeDeliveryWorkspaceStatusFilter(
    resolvedSearchParams.status
  )
  const selectedSortKey = normalizeDeliveryWorkspaceSortKey(
    resolvedSearchParams.sort
  )
  const focusWorkspaceId = normalizeFocusedWorkspaceId(
    resolvedSearchParams.focus_workspace_id
  )
  const focusReminderNotificationId = normalizeFocusedReminderNotificationId(
    resolvedSearchParams.focus_reminder_notification_id
  )
  const shouldFocusFollowUpForm = normalizeFollowUpFormFocus(
    resolvedSearchParams.focus_follow_up_form
  )
  const activeReminderSupportFilter = normalizeDeliveryReminderSupportFilter(
    resolvedSearchParams.reminder_support_filter
  )
  const todayDateKey = new Date().toISOString().slice(0, 10)

  const [workspaces, projects] = await Promise.all([
    listDeliveryWorkspacesByOwner(user.id),
    listProjectsByOwner(user.id)
  ])

  const workspaceEvents = await listDeliveryWorkspaceEventsByWorkspaceIdsForOwner(
    workspaces.map((workspace) => workspace.id),
    user.id
  )

  const allWorkspaceOverviews = buildDeliveryWorkspaceOverviewRecords({
    events: workspaceEvents,
    workspaces
  })

  const dashboardSummary = summarizeDeliveryDashboardOverview(allWorkspaceOverviews)
  const followUpQueueRecords = buildDeliveryFollowUpQueueRecords({
    overviewRecords: allWorkspaceOverviews,
    todayDateKey
  })
  const overdueFollowUpQueueRecords =
    listOverdueDeliveryFollowUpQueueRecords(followUpQueueRecords)
  const followUpQueueSummary = summarizeDeliveryFollowUpQueue(followUpQueueRecords)

  const recentReminderNotifications =
    await listRecentDeliveryReminderNotificationsByOwner(user.id, 8)

  const reminderSupportRecords = buildDeliveryReminderSupportRecords({
    notifications: recentReminderNotifications,
    workspaces
  })

  const focusedReminderSupportRecord = findFocusedDeliveryReminderSupportRecord(
    reminderSupportRecords,
    focusReminderNotificationId
  )

  const overallReminderSupportSummary =
    summarizeDeliveryReminderSupportRecords(reminderSupportRecords)

  const filteredReminderSupportRecords = filterDeliveryReminderSupportRecords(
    reminderSupportRecords,
    activeReminderSupportFilter
  )

  const filteredReminderSupportSummary =
    summarizeDeliveryReminderSupportRecords(filteredReminderSupportRecords)

  const visibleWorkspaceOverviews = filterAndSortDeliveryWorkspaceOverviewRecords({
    overviewRecords: allWorkspaceOverviews,
    quickFilter: selectedActivityFilter,
    sortKey: selectedSortKey,
    statusFilter: selectedStatusFilter
  })

  const focusFollowUpFormWorkspaceId = resolveFocusedFollowUpFormWorkspaceId({
    record: focusedReminderSupportRecord,
    shouldFocusFollowUpForm
  })

  const focusedFollowUpFormIsVisible = focusFollowUpFormWorkspaceId
    ? visibleWorkspaceOverviews.some(
        (record) => record.workspace.id === focusFollowUpFormWorkspaceId
      )
    : false

  const focusedWorkspaceIsVisible = focusWorkspaceId
    ? visibleWorkspaceOverviews.some(
        (record) => record.workspace.id === focusWorkspaceId
      )
    : false

  const projectsById = new Map(projects.map((project) => [project.id, project]))

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          Delivery
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
          Finalized client delivery workspaces
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Delivery pages are only available for finalized canonical exports.
        </p>
      </section>

      <DeliveryDashboardSummaryPanel summary={dashboardSummary} />

      <DeliveryOverdueRemindersPanel
        projectsById={projectsById}
        queueRecords={overdueFollowUpQueueRecords}
      />

      <DeliveryReminderSupportPanel
        activeFilter={activeReminderSupportFilter}
        currentDashboardSearchParams={{
          activity: resolvedSearchParams.activity ?? null,
          focusWorkspaceId: focusWorkspaceId ?? null,
          sort: resolvedSearchParams.sort ?? null,
          status: resolvedSearchParams.status ?? null
        }}
        overallSummary={overallReminderSupportSummary}
        records={filteredReminderSupportRecords}
        summary={filteredReminderSupportSummary}
      />

      {reminderRepairOutcome ? (
        <DeliveryReminderRepairOutcomeBanner outcome={reminderRepairOutcome} />
      ) : null}

      <DeliveryFollowUpQueue
        projectsById={projectsById}
        queueRecords={followUpQueueRecords}
        queueSummary={followUpQueueSummary}
      />

      {focusFollowUpFormWorkspaceId ? (
        <div
          className={`rounded-[1.25rem] border px-4 py-3 text-sm ${
            focusedFollowUpFormIsVisible
              ? "border-amber-400/30 bg-amber-500/10 text-amber-100"
              : "border-rose-400/30 bg-rose-500/10 text-rose-100"
          }`}
        >
          {focusedFollowUpFormIsVisible
            ? "Reminder mismatch context is highlighted inside the workspace follow-up form below."
            : "The reminder mismatch workspace is not visible under the current delivery filters."}
        </div>
      ) : focusWorkspaceId ? (
        <div
          className={`rounded-[1.25rem] border px-4 py-3 text-sm ${
            focusedWorkspaceIsVisible
              ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-100"
              : "border-amber-400/30 bg-amber-500/10 text-amber-100"
          }`}
        >
          {focusedWorkspaceIsVisible
            ? "The workspace opened from reminder support is highlighted in the delivery workspace list below."
            : "The workspace opened from reminder support is not visible under the current delivery filters."}
        </div>
      ) : null}

      <DeliveryWorkspaceList
        activeReminderSupportFilter={activeReminderSupportFilter}
        focusFollowUpFormWorkspaceId={focusFollowUpFormWorkspaceId}
        focusWorkspaceId={focusWorkspaceId}
        focusedReminderSupportRecord={focusedReminderSupportRecord}
        projectsById={projectsById}
        repairOutcome={reminderRepairOutcome}
        selectedActivityFilter={selectedActivityFilter}
        selectedSortKey={selectedSortKey}
        selectedStatusFilter={selectedStatusFilter}
        todayDateKey={todayDateKey}
        workspaceOverviews={visibleWorkspaceOverviews}
      />
    </div>
  )
}
