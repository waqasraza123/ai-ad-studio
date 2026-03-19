import Link from "next/link"
import type {
  DeliveryWorkspaceRecord,
  ProjectRecord
} from "@/server/database/types"
import { getPublicEnvironment } from "@/lib/env"

type DeliveryWorkspaceListProps = {
  projectsById: Map<string, ProjectRecord>
  workspaces: DeliveryWorkspaceRecord[]
}

function statusClasses(status: DeliveryWorkspaceRecord["status"]) {
  if (status === "active") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
  }

  return "border-white/10 bg-white/[0.05] text-slate-300"
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

export function DeliveryWorkspaceList({
  projectsById,
  workspaces
}: DeliveryWorkspaceListProps) {
  const environment = getPublicEnvironment()

  if (workspaces.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
        No delivery workspaces yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {workspaces.map((workspace) => {
        const project = projectsById.get(workspace.project_id) ?? null
        const publicUrl = `${environment.NEXT_PUBLIC_APP_URL}/delivery/${workspace.token}`

        return (
          <div
            key={workspace.id}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-white">{workspace.title}</p>
                  <span className={`rounded-full border px-3 py-1 text-xs ${statusClasses(workspace.status)}`}>
                    {workspace.status}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-300">
                  {project?.name ?? "Unknown project"}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{workspace.summary}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {formatTimestamp(workspace.created_at)}
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
      })}
    </div>
  )
}
