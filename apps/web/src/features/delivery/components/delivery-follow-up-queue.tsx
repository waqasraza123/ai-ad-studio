import Link from "next/link"
import { getPublicEnvironment } from "@/lib/env"
import {
  getDeliveryWorkspaceFollowUpClasses
} from "@/features/delivery/lib/delivery-workspace-follow-up"
import type { DeliveryFollowUpQueueRecord } from "@/features/delivery/lib/delivery-follow-up-queue"
import type { ProjectRecord } from "@/server/database/types"

type DeliveryFollowUpQueueProps = {
  projectsById: Map<string, ProjectRecord>
  queueRecords: DeliveryFollowUpQueueRecord[]
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

export function DeliveryFollowUpQueue({
  projectsById,
  queueRecords
}: DeliveryFollowUpQueueProps) {
  const environment = getPublicEnvironment()

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Follow-up queue
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
            Unresolved delivery follow-up
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Active delivery workspaces that still need owner attention, sorted by
            latest client activity.
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-300">
          {queueRecords.length} in queue
        </div>
      </div>

      {queueRecords.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
          No unresolved delivery follow-up right now.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {queueRecords.map((queueRecord) => {
            const workspace = queueRecord.overviewRecord.workspace
            const activitySummary = queueRecord.overviewRecord.activitySummary
            const project = projectsById.get(workspace.project_id) ?? null
            const publicUrl = `${environment.NEXT_PUBLIC_APP_URL}/delivery/${workspace.token}`

            return (
              <div
                key={workspace.id}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-white">{workspace.title}</p>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${getDeliveryWorkspaceFollowUpClasses(queueRecord.effectiveFollowUpStatus)}`}
                      >
                        {queueRecord.effectiveFollowUpLabel}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-300">
                      {project?.name ?? "Unknown project"}
                    </p>

                    <div className="mt-3 rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Next owner context
                      </p>
                      <p className="mt-2 text-sm leading-7 text-white">
                        {queueRecord.primaryNote}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                      <span>
                        latest activity {formatTimestamp(queueRecord.overviewRecord.latestActivityAt)}
                      </span>
                      <span>
                        viewed {formatTimestamp(activitySummary.lastViewedAt)}
                      </span>
                      <span>
                        downloads {activitySummary.downloadCount}
                      </span>
                      <span>
                        follow-up updated {formatTimestamp(workspace.follow_up_updated_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/exports/${workspace.canonical_export_id}`}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                    >
                      Open canonical export
                    </Link>
                    <a
                      href={publicUrl}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                    >
                      Open delivery page
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
