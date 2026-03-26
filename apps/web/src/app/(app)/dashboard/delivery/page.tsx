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

import { normalizeFocusedWorkspaceId } from "@/features/delivery/lib/delivery-reminder-support-links"
type DeliveryPageProps = {
  searchParams: Promise<{
    activity?: string
    focus_workspace_id?: string
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
  const selectedActivityFilter = normalizeDeliveryWorkspaceQuickFilter(
    resolvedSearchParams.activity
  )
  const selectedStatusFilter = normalizeDeliveryWorkspaceStatusFilter(
    resolvedSearchParams.status
  )
  const selectedSortKey = normalizeDeliveryWorkspaceSortKey(
    resolvedSearchParams.sort
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
  workspaces: workspaces
})

const reminderSupportSummary =
  summarizeDeliveryReminderSupportRecords(reminderSupportRecords)

  const focusWorkspaceId = normalizeFocusedWorkspaceId(
  typeof resolvedSearchParams.focus_workspace_id === "string"
    ? resolvedSearchParams.focus_workspace_id
    : null
)

const visibleWorkspaceOverviews = filterAndSortDeliveryWorkspaceOverviewRecords({
    overviewRecords: allWorkspaceOverviews,
    quickFilter: selectedActivityFilter,
    sortKey: selectedSortKey,
    statusFilter: selectedStatusFilter
  })

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
        records={reminderSupportRecords}
        summary={reminderSupportSummary}
      />

      <DeliveryFollowUpQueue
        projectsById={projectsById}
        queueRecords={followUpQueueRecords}
        queueSummary={followUpQueueSummary}
      />

      {focusWorkspaceId ? (
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
        focusWorkspaceId={focusWorkspaceId}
        projectsById={projectsById}
        selectedActivityFilter={selectedActivityFilter}
        selectedSortKey={selectedSortKey}
        selectedStatusFilter={selectedStatusFilter}
        todayDateKey={todayDateKey}
        workspaceOverviews={visibleWorkspaceOverviews}
      />
    </div>
  )
}
