import { getFormErrorMessage } from "@/lib/form-error-messages"
import { summarizeDeliveryReminderMismatchLifecycle } from "@/features/delivery/lib/delivery-reminder-mismatch-lifecycle-summary"
import {
  filterDeliveryReminderMismatchLifecycleScope,
  normalizeDeliveryReminderMismatchLifecycleFilter
} from "@/features/delivery/lib/delivery-reminder-mismatch-lifecycle-filter"
import { DeliveryReminderMismatchLifecycleSummaryPanel } from "@/features/delivery/components/delivery-reminder-mismatch-lifecycle-summary-panel"
import { DeliveryReminderRepairOutcomeBanner } from "@/features/delivery/components/delivery-reminder-repair-outcome-banner"
import { DeliveryReminderSupportPanel } from "@/features/delivery/components/delivery-reminder-support-panel"
import { DeliverySupportActivityFilterBar } from "@/features/delivery/components/delivery-support-activity-filter-bar"
import { DeliverySupportOpsSummaryPanel } from "@/features/delivery/components/delivery-support-ops-summary-panel"
import { DeliveryInvestigationViewPanel } from "@/features/delivery/components/delivery-investigation-view-panel"
import { DeliveryInvestigationContextHeader } from "@/features/delivery/components/delivery-investigation-context-header"
import { DeliveryInvestigationStaleContextWarning } from "@/features/delivery/components/delivery-investigation-stale-context-warning"
import { DeliveryFocusedWorkspaceStatusRow } from "@/features/delivery/components/delivery-focused-workspace-status-row"
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
import {
  filterDeliveryWorkspaceOverviewsBySupportActivityFilter,
  normalizeDeliverySupportActivityFilter,
  summarizeDeliverySupportActivityFilter
} from "@/features/delivery/lib/delivery-support-activity-filter"
import { summarizeDeliverySupportOps } from "@/features/delivery/lib/delivery-support-ops-summary"
import type { DeliveryInvestigationViewState } from "@/features/delivery/lib/delivery-investigation-view"
import { buildDeliveryInvestigationContextSummary } from "@/features/delivery/lib/delivery-investigation-context-summary"
import { buildDeliveryInvestigationStaleContextSummary } from "@/features/delivery/lib/delivery-investigation-stale-context"
import { buildDeliveryFocusedWorkspaceStatusSummary } from "@/features/delivery/lib/delivery-focused-workspace-status"
import { normalizeDeliveryReminderRepairOutcome } from "@/features/delivery/lib/delivery-reminder-repair-outcome"
import { resolveDeliveryWorkspaceVisibleCount } from "@/features/delivery/lib/delivery-workspace-list-window"

type DeliveryPageProps = {
  searchParams: Promise<{
    activity?: string
    focus_follow_up_form?: string
    focus_reminder_notification_id?: string
    focus_workspace_id?: string
    reminder_repair_action?: string
    reminder_repair_error_code?: string
    reminder_repair_note_saved?: string
    reminder_repair_notification_id?: string
    reminder_repair_status?: string
    reminder_repair_workspace_id?: string
    reminder_mismatch_lifecycle_filter?: string
    support_activity_filter?: string
    reminder_support_filter?: string
    error?: string
    sort?: string
    status?: string
    workspace_limit?: string
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
  const formErrorMessage = getFormErrorMessage(resolvedSearchParams.error)
  const reminderRepairOutcome = normalizeDeliveryReminderRepairOutcome({
    action: resolvedSearchParams.reminder_repair_action,
    errorCode: resolvedSearchParams.reminder_repair_error_code,
    noteSaved: resolvedSearchParams.reminder_repair_note_saved,
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
  const activeReminderMismatchLifecycleFilter =
    normalizeDeliveryReminderMismatchLifecycleFilter(
      resolvedSearchParams.reminder_mismatch_lifecycle_filter
    )
  const activeSupportActivityFilter = normalizeDeliverySupportActivityFilter(
    resolvedSearchParams.support_activity_filter
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

  const visibleWorkspaceOverviews = filterAndSortDeliveryWorkspaceOverviewRecords({
    overviewRecords: allWorkspaceOverviews,
    quickFilter: selectedActivityFilter,
    sortKey: selectedSortKey,
    statusFilter: selectedStatusFilter
  })

  const supportActivityFilterSummary =
    summarizeDeliverySupportActivityFilter(visibleWorkspaceOverviews)

  const supportFilteredWorkspaceOverviews =
    filterDeliveryWorkspaceOverviewsBySupportActivityFilter(
      visibleWorkspaceOverviews,
      activeSupportActivityFilter
    )

  const supportFilteredWorkspaceOverviewsForDisplay =
    supportFilteredWorkspaceOverviews as typeof visibleWorkspaceOverviews

  const reminderMismatchLifecycleSummary =
    summarizeDeliveryReminderMismatchLifecycle({
      overviewRecords: supportFilteredWorkspaceOverviews,
      reminderSupportRecords: filteredReminderSupportRecords
    })

  const lifecycleScopedSupportScope = filterDeliveryReminderMismatchLifecycleScope({
    filter: activeReminderMismatchLifecycleFilter,
    overviewRecords: supportFilteredWorkspaceOverviewsForDisplay,
    reminderSupportRecords: filteredReminderSupportRecords
  })

  const lifecycleScopedReminderSupportSummary =
    summarizeDeliveryReminderSupportRecords(
      lifecycleScopedSupportScope.reminderSupportRecords
    )

  const supportOpsSummary = summarizeDeliverySupportOps({
    overviewRecords: lifecycleScopedSupportScope.overviewRecords,
    reminderSupportRecords: lifecycleScopedSupportScope.reminderSupportRecords
  })

  const focusFollowUpFormWorkspaceId = resolveFocusedFollowUpFormWorkspaceId({
    record: focusedReminderSupportRecord,
    shouldFocusFollowUpForm
  })
  const workspaceIdToKeepVisible = focusFollowUpFormWorkspaceId ?? focusWorkspaceId
  const focusedWorkspaceIndex = lifecycleScopedSupportScope.overviewRecords.findIndex(
    (record) => record.workspace.id === workspaceIdToKeepVisible
  )
  const visibleWorkspaceCount = resolveDeliveryWorkspaceVisibleCount({
    focusedWorkspaceIndex,
    requestedCount: resolvedSearchParams.workspace_limit
      ? Number(resolvedSearchParams.workspace_limit)
      : null,
    totalCount: lifecycleScopedSupportScope.overviewRecords.length
  })
  const visibleWorkspaceListRecords =
    lifecycleScopedSupportScope.overviewRecords.slice(0, visibleWorkspaceCount)

  const focusedInvestigationWorkspaceId =
    focusFollowUpFormWorkspaceId ?? focusWorkspaceId

  const investigationContextSummary = buildDeliveryInvestigationContextSummary({
    focusedReminderSupportRecord,
    focusWorkspaceId: focusedInvestigationWorkspaceId,
    overviewRecords: lifecycleScopedSupportScope.overviewRecords
  })

  const investigationStaleContextSummary =
    buildDeliveryInvestigationStaleContextSummary({
      focusFollowUpForm: shouldFocusFollowUpForm,
      focusReminderNotificationId: focusReminderNotificationId ?? null,
      focusWorkspaceId: focusedInvestigationWorkspaceId,
      reminderSupportRecords: lifecycleScopedSupportScope.reminderSupportRecords,
      overviewRecords: lifecycleScopedSupportScope.overviewRecords
    })

  const focusedWorkspaceStatusSummary =
    investigationStaleContextSummary
      ? null
      : buildDeliveryFocusedWorkspaceStatusSummary({
          focusWorkspaceId: focusedInvestigationWorkspaceId,
          overviewRecords: lifecycleScopedSupportScope.overviewRecords
        })

  const focusedFollowUpFormIsVisible = focusFollowUpFormWorkspaceId
    ? lifecycleScopedSupportScope.overviewRecords.some(
        (record) => record.workspace.id === focusFollowUpFormWorkspaceId
      )
    : false

  const focusedWorkspaceIsVisible = focusWorkspaceId
    ? lifecycleScopedSupportScope.overviewRecords.some(
        (record) => record.workspace.id === focusWorkspaceId
      )
    : false

  const projectsById = new Map(projects.map((project) => [project.id, project]))

  const deliveryInvestigationViewState: DeliveryInvestigationViewState = {
    activity: resolvedSearchParams.activity ?? null,
    focusFollowUpForm: shouldFocusFollowUpForm,
    focusReminderNotificationId: focusReminderNotificationId ?? null,
    focusWorkspaceId: focusWorkspaceId ?? null,
    reminderMismatchLifecycleFilter: activeReminderMismatchLifecycleFilter,
    reminderSupportFilter: activeReminderSupportFilter,
    sort: resolvedSearchParams.sort ?? null,
    status: resolvedSearchParams.status ?? null,
    supportActivityFilter: activeSupportActivityFilter
  }

  return (
    <div className="space-y-6">
      {formErrorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {formErrorMessage}
        </div>
      ) : null}
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
          focusFollowUpForm: shouldFocusFollowUpForm,
          focusReminderNotificationId: focusReminderNotificationId ?? null,
          focusWorkspaceId: focusWorkspaceId ?? null,
          reminderMismatchLifecycleFilter: activeReminderMismatchLifecycleFilter,
          sort: resolvedSearchParams.sort ?? null,
          status: resolvedSearchParams.status ?? null,
          supportActivityFilter: activeSupportActivityFilter
        }}
        overallSummary={overallReminderSupportSummary}
        records={lifecycleScopedSupportScope.reminderSupportRecords}
        summary={lifecycleScopedReminderSupportSummary}
      />

      {reminderRepairOutcome ? (
        <DeliveryReminderRepairOutcomeBanner outcome={reminderRepairOutcome} />
      ) : null}

      <DeliverySupportActivityFilterBar
        activeFilter={activeSupportActivityFilter}
        currentDashboardSearchParams={{
          activity: resolvedSearchParams.activity ?? null,
          focusFollowUpForm: shouldFocusFollowUpForm,
          focusReminderNotificationId: focusReminderNotificationId ?? null,
          focusWorkspaceId: focusWorkspaceId ?? null,
          reminderMismatchLifecycleFilter: activeReminderMismatchLifecycleFilter,
          reminderSupportFilter: activeReminderSupportFilter,
          sort: resolvedSearchParams.sort ?? null,
          status: resolvedSearchParams.status ?? null
        }}
        summary={supportActivityFilterSummary}
      />

      <DeliverySupportOpsSummaryPanel
        activeSupportActivityFilter={activeSupportActivityFilter}
        summary={supportOpsSummary}
      />

      <DeliveryReminderMismatchLifecycleSummaryPanel
        activeLifecycleFilter={activeReminderMismatchLifecycleFilter}
        activeSupportActivityFilter={activeSupportActivityFilter}
        currentDashboardSearchParams={{
          activity: resolvedSearchParams.activity ?? null,
          focusFollowUpForm: shouldFocusFollowUpForm,
          focusReminderNotificationId: focusReminderNotificationId ?? null,
          focusWorkspaceId: focusWorkspaceId ?? null,
          reminderMismatchLifecycleFilter: activeReminderMismatchLifecycleFilter,
          reminderSupportFilter: activeReminderSupportFilter,
          sort: resolvedSearchParams.sort ?? null,
          status: resolvedSearchParams.status ?? null,
          supportActivityFilter: activeSupportActivityFilter
        }}
        summary={reminderMismatchLifecycleSummary}
      />

      <DeliveryInvestigationViewPanel
        state={deliveryInvestigationViewState}
      />

      {investigationStaleContextSummary ? (
        <DeliveryInvestigationStaleContextWarning
          state={deliveryInvestigationViewState}
          summary={investigationStaleContextSummary}
        />
      ) : investigationContextSummary ? (
        <DeliveryInvestigationContextHeader
          summary={investigationContextSummary}
        />
      ) : null}

      {focusedWorkspaceStatusSummary ? (
        <DeliveryFocusedWorkspaceStatusRow
          summary={focusedWorkspaceStatusSummary}
        />
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

      {lifecycleScopedSupportScope.overviewRecords.length === 0 ? (
        <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-slate-400">
          {activeReminderMismatchLifecycleFilter !== "all"
            ? "No workspace activity matches the current reminder mismatch lifecycle filter under the current delivery support scope."
            : activeSupportActivityFilter === "all"
              ? "No support-originated workspace activity is visible under the current delivery filters."
              : "No workspace activity matches the current support activity filter under the current delivery filters."}
        </div>
      ) : null}

      <DeliveryWorkspaceList
        activeReminderSupportFilter={activeReminderSupportFilter}
        activeSupportActivityFilter={activeSupportActivityFilter}
        currentDashboardSearchParams={{
          activity: resolvedSearchParams.activity ?? null,
          focusFollowUpForm: shouldFocusFollowUpForm,
          focusReminderNotificationId: focusReminderNotificationId ?? null,
          focusWorkspaceId: focusWorkspaceId ?? null,
          reminderMismatchLifecycleFilter: activeReminderMismatchLifecycleFilter,
          reminderSupportFilter: activeReminderSupportFilter,
          sort: resolvedSearchParams.sort ?? null,
          status: resolvedSearchParams.status ?? null,
          supportActivityFilter: activeSupportActivityFilter,
          workspaceLimit: resolvedSearchParams.workspace_limit
            ? Number(resolvedSearchParams.workspace_limit)
            : null
        }}
        focusFollowUpFormWorkspaceId={focusFollowUpFormWorkspaceId}
        focusWorkspaceId={focusWorkspaceId}
        focusedReminderSupportRecord={focusedReminderSupportRecord}
        projectsById={projectsById}
        repairOutcome={reminderRepairOutcome}
        selectedActivityFilter={selectedActivityFilter}
        selectedSortKey={selectedSortKey}
        selectedStatusFilter={selectedStatusFilter}
        todayDateKey={todayDateKey}
        totalWorkspaceCount={lifecycleScopedSupportScope.overviewRecords.length}
        workspaceOverviews={visibleWorkspaceListRecords}
      />
    </div>
  )
}
