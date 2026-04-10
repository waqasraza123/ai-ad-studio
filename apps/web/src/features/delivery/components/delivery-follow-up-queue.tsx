import Link from "next/link"
import { getPublicEnvironment } from "@/lib/env"
import {
  getDeliveryWorkspaceFollowUpClasses,
  getDeliveryWorkspaceFollowUpLabelKey,
  getDeliveryWorkspaceReminderBucketClasses,
  getDeliveryWorkspaceReminderBucketLabelKey
} from "@/features/delivery/lib/delivery-workspace-follow-up"
import type {
  DeliveryFollowUpQueueRecord,
  DeliveryFollowUpQueueSummary
} from "@/features/delivery/lib/delivery-follow-up-queue"
import type { ProjectRecord } from "@/server/database/types"
import type { Translator } from "@/lib/i18n/translator"
import { getServerI18n } from "@/lib/i18n/server"

type DeliveryFollowUpQueueProps = {
  projectsById: Map<string, ProjectRecord>
  queueRecords: DeliveryFollowUpQueueRecord[]
  queueSummary: DeliveryFollowUpQueueSummary
}

function formatTimestamp(
  value: string | null,
  formatDateTime: Translator["formatDateTime"],
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
  formatDateValue: Translator["formatDate"],
  notSetLabel: string
) {
  if (!value) {
    return notSetLabel
  }

  return formatDateValue(`${value}T00:00:00Z`, {
    dateStyle: "medium"
  })
}

function getActivityExcerpt(record: DeliveryFollowUpQueueRecord, t: Translator["t"]) {
  const ownerNote = record.overviewRecord.workspace.follow_up_note?.trim()

  if (ownerNote) {
    return ownerNote
  }

  const activitySummary = record.overviewRecord.activitySummary

  if (activitySummary.acknowledgedAt) {
    return activitySummary.acknowledgedBy
      ? t("delivery.workspaceList.activityExcerpt.acknowledgedBy", {
          value: activitySummary.acknowledgedBy
        })
      : t("delivery.workspaceList.activityExcerpt.acknowledged")
  }

  if (activitySummary.downloadCount > 0) {
    return activitySummary.downloadCount === 1
      ? t("delivery.workspaceList.activityExcerpt.downloadedOnce")
      : t("delivery.workspaceList.activityExcerpt.downloadedMany", {
          count: activitySummary.downloadCount
        })
  }

  if (activitySummary.lastViewedAt) {
    return t("delivery.workspaceList.activityExcerpt.viewed")
  }

  if (activitySummary.deliveredAt) {
    return t("delivery.workspaceList.activityExcerpt.delivered")
  }

  return t("delivery.workspaceList.activityExcerpt.none")
}

export async function DeliveryFollowUpQueue({
  projectsById,
  queueRecords,
  queueSummary
}: DeliveryFollowUpQueueProps) {
  const environment = getPublicEnvironment()
  const { formatDate: formatDateValue, formatDateTime, t } = await getServerI18n()
  const notSetLabel = t("common.words.notSet")

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            {t("delivery.queue.eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
            {t("delivery.queue.title")}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            {t("delivery.queue.description")}
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-300">
          {t("delivery.queue.count", { count: queueSummary.totalCount })}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <span className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs text-rose-100">
          {t("delivery.queue.overdue", { count: queueSummary.overdueCount })}
        </span>
        <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-100">
          {t("delivery.queue.dueToday", { count: queueSummary.dueTodayCount })}
        </span>
        <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs text-sky-100">
          {t("delivery.queue.upcoming", { count: queueSummary.upcomingCount })}
        </span>
      </div>

      {queueRecords.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
          {t("delivery.queue.empty")}
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
                        {t(
                          getDeliveryWorkspaceFollowUpLabelKey(
                            queueRecord.effectiveFollowUpStatus
                          )
                        )}
                      </span>
                      {queueRecord.reminderBucketLabel ? (
                        <span
                          className={`rounded-full border px-3 py-1 text-xs ${getDeliveryWorkspaceReminderBucketClasses(queueRecord.reminderBucket)}`}
                        >
                          {t(
                            getDeliveryWorkspaceReminderBucketLabelKey(
                              queueRecord.reminderBucket
                            )
                          )}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2 text-sm text-slate-300">
                      {project?.name ?? t("common.words.unknownProject")}
                    </p>

                    <div className="mt-3 rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        {t("delivery.queue.nextOwnerContext")}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-white">
                        {getActivityExcerpt(queueRecord, t)}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                      <span>
                        {t("delivery.queue.latestActivity", {
                          value: formatTimestamp(
                            queueRecord.overviewRecord.latestActivityAt,
                            formatDateTime,
                            notSetLabel
                          )
                        })}
                      </span>
                      <span>
                        {t("delivery.queue.viewed", {
                          value: formatTimestamp(
                            activitySummary.lastViewedAt,
                            formatDateTime,
                            notSetLabel
                          )
                        })}
                      </span>
                      <span>
                        {t("delivery.queue.downloads", {
                          count: activitySummary.downloadCount
                        })}
                      </span>
                      <span>
                        {t("delivery.queue.followUpUpdated", {
                          value: formatTimestamp(
                            workspace.follow_up_updated_at,
                            formatDateTime,
                            notSetLabel
                          )
                        })}
                      </span>
                      <span>
                        {t("delivery.queue.reminderDue", {
                          value: formatDate(
                            workspace.follow_up_due_on,
                            formatDateValue,
                            notSetLabel
                          )
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/exports/${workspace.canonical_export_id}`}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                    >
                      {t("delivery.queue.openCanonical")}
                    </Link>
                    <a
                      href={publicUrl}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                    >
                      {t("delivery.queue.openDelivery")}
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
