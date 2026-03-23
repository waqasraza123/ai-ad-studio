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

type DeliveryPageProps = {
  searchParams: Promise<{
    activity?: string
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

  const visibleWorkspaceOverviews = filterAndSortDeliveryWorkspaceOverviewRecords({
    overviewRecords: allWorkspaceOverviews,
    quickFilter: selectedActivityFilter,
    sortKey: selectedSortKey,
    statusFilter: selectedStatusFilter
  })

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

      <DeliveryFollowUpQueue
        projectsById={projectsById}
        queueRecords={followUpQueueRecords}
        queueSummary={followUpQueueSummary}
      />

      <DeliveryWorkspaceList
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
