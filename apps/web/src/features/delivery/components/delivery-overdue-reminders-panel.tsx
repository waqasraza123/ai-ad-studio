import Link from "next/link"
import { getPublicEnvironment } from "@/lib/env"
import { getDeliveryWorkspaceReminderBucketClasses } from "@/features/delivery/lib/delivery-workspace-follow-up"
import type { DeliveryFollowUpQueueRecord } from "@/features/delivery/lib/delivery-follow-up-queue"
import type { ProjectRecord } from "@/server/database/types"

type DeliveryOverdueRemindersPanelProps = {
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

function formatDate(value: string | null) {
  if (!value) {
    return "Not set"
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(new Date(`${value}T12:00:00Z`))
}

export function DeliveryOverdueRemindersPanel({
  projectsById,
  queueRecords
}: DeliveryOverdueRemindersPanelProps) {
  const environment = getPublicEnvironment()

  return (
    <section className="rounded-[2rem] border border-rose-400/20 bg-rose-500/10 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-rose-100">
            Overdue reminders
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
            Delivery follow-up requiring immediate attention
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-rose-100/85">
            Reminder-scheduled workspaces whose follow-up date has already passed.
          </p>
        </div>

        <div className="rounded-full border border-rose-400/20 bg-rose-500/20 px-4 py-2 text-sm text-rose-100">
          {queueRecords.length} overdue
        </div>
      </div>

      {queueRecords.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-rose-400/20 bg-white/[0.04] p-5 text-sm text-rose-100/80">
          No overdue delivery follow-up right now.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {queueRecords.map((queueRecord) => {
            const workspace = queueRecord.overviewRecord.workspace
            const project = projectsById.get(workspace.project_id) ?? null
            const publicUrl = `${environment.NEXT_PUBLIC_APP_URL}/delivery/${workspace.token}`

            return (
              <div
                key={workspace.id}
                className="rounded-[1.5rem] border border-rose-400/20 bg-white/[0.04] p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-white">{workspace.title}</p>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${getDeliveryWorkspaceReminderBucketClasses(queueRecord.reminderBucket)}`}
                      >
                        {queueRecord.reminderBucketLabel}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-rose-100/85">
                      {project?.name ?? "Unknown project"}
                    </p>

                    <div className="mt-3 rounded-[1.25rem] border border-rose-400/20 bg-white/[0.04] p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-rose-100/80">
                        Next owner context
                      </p>
                      <p className="mt-2 text-sm leading-7 text-white">
                        {queueRecord.primaryNote}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-rose-100/80">
                      <span>due {formatDate(workspace.follow_up_due_on)}</span>
                      <span>
                        latest activity {formatTimestamp(queueRecord.overviewRecord.latestActivityAt)}
                      </span>
                      <span>
                        follow-up updated {formatTimestamp(workspace.follow_up_updated_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/exports/${workspace.canonical_export_id}`}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] px-4 text-sm font-medium text-white transition hover:bg-white/[0.12]"
                    >
                      Open canonical export
                    </Link>
                    <a
                      href={publicUrl}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] px-4 text-sm font-medium text-white transition hover:bg-white/[0.12]"
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
