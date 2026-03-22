import Link from "next/link"
import type { ProjectRecord } from "@/server/database/types"
import { getPublicEnvironment } from "@/lib/env"
import type {
  DeliveryWorkspaceOverviewRecord,
  DeliveryWorkspaceQuickFilter,
  DeliveryWorkspaceSortKey,
  DeliveryWorkspaceStatusFilter
} from "@/features/delivery/lib/delivery-workspace-overview"

type DeliveryWorkspaceListProps = {
  projectsById: Map<string, ProjectRecord>
  selectedActivityFilter: DeliveryWorkspaceQuickFilter
  selectedSortKey: DeliveryWorkspaceSortKey
  selectedStatusFilter: DeliveryWorkspaceStatusFilter
  workspaceOverviews: DeliveryWorkspaceOverviewRecord[]
}

function statusClasses(status: DeliveryWorkspaceOverviewRecord["workspace"]["status"]) {
  if (status === "active") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
  }

  return "border-white/10 bg-white/[0.05] text-slate-300"
}

function filterClasses(isSelected: boolean) {
  if (isSelected) {
    return "border-indigo-400/20 bg-indigo-500/10 text-indigo-100"
  }

  return "border-white/10 bg-white/[0.05] text-slate-300"
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Not yet"
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

function buildDeliveryDashboardHref(input: {
  activity: DeliveryWorkspaceQuickFilter
  sort: DeliveryWorkspaceSortKey
  status: DeliveryWorkspaceStatusFilter
}) {
  const searchParams = new URLSearchParams()

  if (input.activity !== "all") {
    searchParams.set("activity", input.activity)
  }

  if (input.status !== "all") {
    searchParams.set("status", input.status)
  }

  if (input.sort !== "latest_activity") {
    searchParams.set("sort", input.sort)
  }

  const queryString = searchParams.toString()

  return queryString.length > 0
    ? `/dashboard/delivery?${queryString}`
    : "/dashboard/delivery"
}

export function DeliveryWorkspaceList({
  projectsById,
  selectedActivityFilter,
  selectedSortKey,
  selectedStatusFilter,
  workspaceOverviews
}: DeliveryWorkspaceListProps) {
  const environment = getPublicEnvironment()

  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
              Overview controls
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Review delivery workspaces by current status, receipt activity, or
              latest activity recency.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildDeliveryDashboardHref({
                  activity: selectedActivityFilter,
                  sort: selectedSortKey,
                  status: "all"
                })}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-white/[0.08] ${filterClasses(selectedStatusFilter === "all")}`}
              >
                All
              </Link>
              <Link
                href={buildDeliveryDashboardHref({
                  activity: selectedActivityFilter,
                  sort: selectedSortKey,
                  status: "active"
                })}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-white/[0.08] ${filterClasses(selectedStatusFilter === "active")}`}
              >
                Active
              </Link>
              <Link
                href={buildDeliveryDashboardHref({
                  activity: selectedActivityFilter,
                  sort: selectedSortKey,
                  status: "archived"
                })}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-white/[0.08] ${filterClasses(selectedStatusFilter === "archived")}`}
              >
                Archived
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={buildDeliveryDashboardHref({
                  activity: "all",
                  sort: selectedSortKey,
                  status: selectedStatusFilter
                })}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-white/[0.08] ${filterClasses(selectedActivityFilter === "all")}`}
              >
                All activity
              </Link>
              <Link
                href={buildDeliveryDashboardHref({
                  activity: "acknowledged",
                  sort: selectedSortKey,
                  status: selectedStatusFilter
                })}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-white/[0.08] ${filterClasses(selectedActivityFilter === "acknowledged")}`}
              >
                Acknowledged
              </Link>
              <Link
                href={buildDeliveryDashboardHref({
                  activity: "viewed_only",
                  sort: selectedSortKey,
                  status: selectedStatusFilter
                })}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-white/[0.08] ${filterClasses(selectedActivityFilter === "viewed_only")}`}
              >
                Viewed only
              </Link>
              <Link
                href={buildDeliveryDashboardHref({
                  activity: "downloaded",
                  sort: selectedSortKey,
                  status: selectedStatusFilter
                })}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-white/[0.08] ${filterClasses(selectedActivityFilter === "downloaded")}`}
              >
                Downloaded
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={buildDeliveryDashboardHref({
                  activity: selectedActivityFilter,
                  sort: "latest_activity",
                  status: selectedStatusFilter
                })}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-white/[0.08] ${filterClasses(selectedSortKey === "latest_activity")}`}
              >
                Latest activity
              </Link>
              <Link
                href={buildDeliveryDashboardHref({
                  activity: selectedActivityFilter,
                  sort: "newest",
                  status: selectedStatusFilter
                })}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-white/[0.08] ${filterClasses(selectedSortKey === "newest")}`}
              >
                Newest
              </Link>
            </div>
          </div>
        </div>
      </div>

      {workspaceOverviews.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
          No delivery workspaces match the current filters.
        </div>
      ) : (
        workspaceOverviews.map((overviewRecord) => {
          const { activityExcerpt, activitySummary, latestActivityAt, workspace } =
            overviewRecord
          const project = projectsById.get(workspace.project_id) ?? null
          const publicUrl = `${environment.NEXT_PUBLIC_APP_URL}/delivery/${workspace.token}`

          return (
            <div
              key={workspace.id}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-white">{workspace.title}</p>
                    <span className={`rounded-full border px-3 py-1 text-xs ${statusClasses(workspace.status)}`}>
                      {workspace.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-300">
                    {project?.name ?? "Unknown project"}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {workspace.summary}
                  </p>

                  <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Activity excerpt
                    </p>
                    <p className="mt-2 text-sm leading-7 text-white">
                      {activityExcerpt}
                    </p>
                    {activitySummary.acknowledgementNote ? (
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {activitySummary.acknowledgementNote}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <div className="rounded-[1.25rem] border border-emerald-400/20 bg-emerald-500/10 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">
                        Delivered
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {formatTimestamp(activitySummary.deliveredAt)}
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Viewed
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {formatTimestamp(activitySummary.lastViewedAt)}
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Downloaded
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {activitySummary.downloadCount}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                        last {formatTimestamp(activitySummary.lastDownloadedAt)}
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] border border-indigo-400/20 bg-indigo-500/10 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">
                        Acknowledged
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {formatTimestamp(activitySummary.acknowledgedAt)}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                        {activitySummary.acknowledgedBy ?? "No recipient label"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">
                    created {formatTimestamp(workspace.created_at)} · latest activity{" "}
                    {formatTimestamp(latestActivityAt)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/exports/${workspace.canonical_export_id}`}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                  >
                    Open canonical export
                  </Link>
                  {workspace.status === "active" ? (
                    <a
                      href={publicUrl}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                    >
                      Open delivery page
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
