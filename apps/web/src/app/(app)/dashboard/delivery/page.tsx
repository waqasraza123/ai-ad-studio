import { DeliveryWorkspaceList } from "@/features/delivery/components/delivery-workspace-list"
import {
  buildDeliveryWorkspaceOverviewRecords,
  filterAndSortDeliveryWorkspaceOverviewRecords,
  normalizeDeliveryWorkspaceSortKey,
  normalizeDeliveryWorkspaceStatusFilter
} from "@/features/delivery/lib/delivery-workspace-overview"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  listDeliveryWorkspaceEventsByWorkspaceIdsForOwner,
  listDeliveryWorkspacesByOwner
} from "@/server/delivery-workspaces/delivery-workspace-repository"
import { listProjectsByOwner } from "@/server/projects/project-repository"

type DeliveryPageProps = {
  searchParams: Promise<{
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
  const selectedStatusFilter = normalizeDeliveryWorkspaceStatusFilter(
    resolvedSearchParams.status
  )
  const selectedSortKey = normalizeDeliveryWorkspaceSortKey(
    resolvedSearchParams.sort
  )

  const [workspaces, projects] = await Promise.all([
    listDeliveryWorkspacesByOwner(user.id),
    listProjectsByOwner(user.id)
  ])

  const workspaceEvents = await listDeliveryWorkspaceEventsByWorkspaceIdsForOwner(
    workspaces.map((workspace) => workspace.id),
    user.id
  )

  const workspaceOverviews = filterAndSortDeliveryWorkspaceOverviewRecords({
    overviewRecords: buildDeliveryWorkspaceOverviewRecords({
      events: workspaceEvents,
      workspaces
    }),
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

      <DeliveryWorkspaceList
        projectsById={projectsById}
        selectedSortKey={selectedSortKey}
        selectedStatusFilter={selectedStatusFilter}
        workspaceOverviews={workspaceOverviews}
      />
    </div>
  )
}
