import Link from "next/link"
import { getPublicEnvironment } from "@/lib/env"
import {
  getDeliveryWorkspaceReminderBucketClasses,
  getDeliveryWorkspaceReminderBucketLabelKey
} from "@/features/delivery/lib/delivery-workspace-follow-up"
import type { DeliveryFollowUpQueueRecord } from "@/features/delivery/lib/delivery-follow-up-queue"
import type { ProjectRecord } from "@/server/database/types"
import { getServerI18n } from "@/lib/i18n/server"

type DeliveryOverdueRemindersPanelProps = {
  projectsById: Map<string, ProjectRecord>
  queueRecords: DeliveryFollowUpQueueRecord[]
}

function formatTimestamp(
  value: string | null,
  formatDateTime: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string,
  notSetLabel: string
) {
  if (!value) {
    return notSetLabel
  }

  return formatDateTime(value, {
    dateStyle: "medium",
    timeStyle: "short"
  })
}

function formatDate(
  value: string | null,
  formatDateValue: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string,
  notSetLabel: string
) {
  if (!value) {
    return notSetLabel
  }

  return formatDateValue(`${value}T12:00:00Z`, {
    dateStyle: "medium"
  })
}

export async function DeliveryOverdueRemindersPanel({
  projectsById,
  queueRecords
}: DeliveryOverdueRemindersPanelProps) {
  const environment = getPublicEnvironment()
  const { formatDate: formatDateValue, formatDateTime, t } = await getServerI18n()
  const notSetLabel = t("common.words.notSet")

  return (
    <section className="rounded-[2rem] border border-rose-400/20 bg-rose-500/10 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-rose-100">
            {t("delivery.overdue.eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
            {t("delivery.overdue.title")}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-rose-100/85">
            {t("delivery.overdue.description")}
          </p>
        </div>

        <div className="rounded-full border border-rose-400/20 bg-rose-500/20 px-4 py-2 text-sm text-rose-100">
          {t("delivery.overdue.count", { count: queueRecords.length })}
        </div>
      </div>

      {queueRecords.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-rose-400/20 bg-white/[0.04] p-5 text-sm text-rose-100/80">
          {t("delivery.overdue.empty")}
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
                        {t(
                          getDeliveryWorkspaceReminderBucketLabelKey(
                            queueRecord.reminderBucket
                          )
                        )}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-rose-100/85">
                      {project?.name ?? t("common.words.unknownProject")}
                    </p>

                    <div className="mt-3 rounded-[1.25rem] border border-rose-400/20 bg-white/[0.04] p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-rose-100/80">
                        {t("delivery.overdue.nextOwnerContext")}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-white">
                        {queueRecord.primaryNote}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-rose-100/80">
                      <span>
                        {t("delivery.overdue.due", {
                          value: formatDate(
                            workspace.follow_up_due_on,
                            formatDateValue,
                            notSetLabel
                          )
                        })}
                      </span>
                      <span>
                        {t("delivery.overdue.latestActivity", {
                          value: formatTimestamp(
                            queueRecord.overviewRecord.latestActivityAt,
                            formatDateTime,
                            notSetLabel
                          )
                        })}
                      </span>
                      <span>
                        {t("delivery.overdue.followUpUpdated", {
                          value: formatTimestamp(
                            workspace.follow_up_updated_at,
                            formatDateTime,
                            notSetLabel
                          )
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/exports/${workspace.canonical_export_id}`}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] px-4 text-sm font-medium text-white transition hover:bg-white/[0.12]"
                    >
                      {t("delivery.overdue.openCanonical")}
                    </Link>
                    <a
                      href={publicUrl}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] px-4 text-sm font-medium text-white transition hover:bg-white/[0.12]"
                    >
                      {t("delivery.overdue.openDelivery")}
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
