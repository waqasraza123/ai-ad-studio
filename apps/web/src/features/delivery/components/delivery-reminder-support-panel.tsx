import Link from "next/link"
import {
  getDeliveryWorkspaceFollowUpClasses,
  getDeliveryWorkspaceFollowUpLabelKey,
  getDeliveryWorkspaceReminderBucketClasses,
  getDeliveryWorkspaceReminderBucketLabelKey
} from "@/features/delivery/lib/delivery-workspace-follow-up"
import type {
  DeliveryReminderSupportRecord,
  DeliveryReminderSupportSummary
} from "@/features/delivery/lib/delivery-reminder-support"
import type { DeliveryReminderMismatchLifecycleFilter } from "@/features/delivery/lib/delivery-reminder-mismatch-lifecycle-filter"
import {
  getDeliveryReminderSupportFilterLabelKey,
  type DeliveryReminderSupportFilter
} from "@/features/delivery/lib/delivery-reminder-support-filter"
import type { DeliverySupportActivityFilter } from "@/features/delivery/lib/delivery-support-activity-filter"
import {
  buildDeliveryReminderDashboardHref,
  buildDeliveryReminderFollowUpFormHref,
  buildDeliveryReminderSupportFilterHref
} from "@/features/delivery/lib/delivery-reminder-support-links"
import { getServerI18n } from "@/lib/i18n/server"
import type { Translator } from "@/lib/i18n/translator"

type DeliveryReminderSupportPanelProps = {
  activeFilter: DeliveryReminderSupportFilter
  currentDashboardSearchParams: {
    activity?: string | null
    focusFollowUpForm?: boolean | null
    focusReminderNotificationId?: string | null
    focusWorkspaceId?: string | null
    reminderMismatchLifecycleFilter?: DeliveryReminderMismatchLifecycleFilter | null
    sort?: string | null
    status?: string | null
    supportActivityFilter?: DeliverySupportActivityFilter | null
  }
  overallSummary: DeliveryReminderSupportSummary
  records: DeliveryReminderSupportRecord[]
  summary: DeliveryReminderSupportSummary
}

function formatDateTime(
  value: string,
  formatDateTimeValue: Translator["formatDateTime"]
) {
  return formatDateTimeValue(value, {
    dateStyle: "medium",
    timeStyle: "short"
  })
}

function formatDate(
  value: string | null,
  formatDateValue: Translator["formatDate"],
  notSetLabel: string
) {
  return value ? formatDateValue(`${value}T00:00:00Z`) : notSetLabel
}

function getCheckpointStateClasses(
  checkpointState: DeliveryReminderSupportRecord["checkpointState"]
) {
  if (checkpointState === "in_sync") {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
  }

  if (checkpointState === "resolved") {
    return "border-cyan-400/30 bg-cyan-500/10 text-cyan-200"
  }

  if (checkpointState === "checkpoint_mismatch") {
    return "border-amber-400/30 bg-amber-500/10 text-amber-200"
  }

  return "border-rose-400/30 bg-rose-500/10 text-rose-200"
}

function getCheckpointStateLabel(
  checkpointState: DeliveryReminderSupportRecord["checkpointState"]
) {
  if (checkpointState === "in_sync") {
    return "Checkpoint in sync"
  }

  if (checkpointState === "resolved") {
    return "Mismatch resolved"
  }

  if (checkpointState === "checkpoint_mismatch") {
    return "Checkpoint mismatch"
  }

  return "Workspace missing"
}

function getCheckpointStateLabelKey(
  checkpointState: DeliveryReminderSupportRecord["checkpointState"]
) {
  if (checkpointState === "in_sync") {
    return "delivery.support.checkpointState.inSync" as const
  }

  if (checkpointState === "resolved") {
    return "delivery.support.checkpointState.resolved" as const
  }

  if (checkpointState === "checkpoint_mismatch") {
    return "delivery.support.checkpointState.mismatch" as const
  }

  return "delivery.support.checkpointState.workspaceMissing" as const
}

function getFilterClasses(isActive: boolean) {
  return isActive
    ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-200"
    : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.05]"
}

const reminderSupportFilters: {
  countKey:
    | "totalCount"
    | "checkpointMismatchCount"
    | "workspaceMissingCount"
    | "overdueCount"
  value: DeliveryReminderSupportFilter
}[] = [
  { countKey: "totalCount", value: "all" },
  { countKey: "checkpointMismatchCount", value: "checkpoint_mismatch" },
  { countKey: "workspaceMissingCount", value: "workspace_missing" },
  { countKey: "overdueCount", value: "overdue" }
]

export async function DeliveryReminderSupportPanel({
  activeFilter,
  currentDashboardSearchParams,
  overallSummary,
  records,
  summary
}: DeliveryReminderSupportPanelProps) {
  const { formatDate: formatDateValue, formatDateTime: formatDateTimeValue, t } =
    await getServerI18n()
  const notSetLabel = t("common.words.notSet")

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            {t("delivery.support.eyebrow")}
          </p>
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {t("delivery.support.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {t("delivery.support.description")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-200">
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
            {t("delivery.support.shown", { count: summary.totalCount })}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
            {t("delivery.support.totalRecent", {
              count: overallSummary.totalCount
            })}
          </span>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-200">
            {t("delivery.support.inSync", { count: summary.inSyncCount })}
          </span>
          <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-cyan-200">
            {t("delivery.support.resolved", { count: summary.resolvedCount })}
          </span>
          <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-amber-200">
            {t("delivery.support.mismatch", {
              count: summary.checkpointMismatchCount
            })}
          </span>
          <span className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-rose-200">
            {t("delivery.support.missingWorkspace", {
              count: summary.workspaceMissingCount
            })}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {reminderSupportFilters.map((filterOption) => {
          const isActive = filterOption.value === activeFilter
          const count = overallSummary[filterOption.countKey]

          return (
            <Link
              key={filterOption.value}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${getFilterClasses(
                isActive
              )}`}
              href={buildDeliveryReminderSupportFilterHref({
                activity: currentDashboardSearchParams.activity ?? null,
                focusFollowUpForm:
                  currentDashboardSearchParams.focusFollowUpForm ?? null,
                focusReminderNotificationId:
                  currentDashboardSearchParams.focusReminderNotificationId ?? null,
                focusWorkspaceId:
                  currentDashboardSearchParams.focusWorkspaceId ?? null,
                reminderMismatchLifecycleFilter:
                  currentDashboardSearchParams.reminderMismatchLifecycleFilter ??
                  null,
                reminderSupportFilter: filterOption.value,
                sort: currentDashboardSearchParams.sort ?? null,
                status: currentDashboardSearchParams.status ?? null,
                supportActivityFilter:
                  currentDashboardSearchParams.supportActivityFilter ?? null
              })}
            >
              <span>{t(getDeliveryReminderSupportFilterLabelKey(filterOption.value))}</span>
              <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5">
                {count}
              </span>
            </Link>
          )
        })}
      </div>

      <div className="mt-4 text-sm text-slate-400">
        {activeFilter === "all"
          ? t("delivery.support.showingAll")
          : t("delivery.support.showingOnly", {
              value: t(
                getDeliveryReminderSupportFilterLabelKey(activeFilter)
              ).toLowerCase()
            })}
      </div>

      {records.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
          {activeFilter === "all"
            ? t("delivery.support.noRecent")
            : t("delivery.support.noMatch", {
                value: t(
                  getDeliveryReminderSupportFilterLabelKey(activeFilter)
                ).toLowerCase()
              })}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {records.map((record) => (
            <article
              key={record.notificationId}
              className="rounded-[1.5rem] border border-white/10 bg-black/10 p-4"
            >
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs ${getDeliveryWorkspaceReminderBucketClasses(
                    record.reminderBucket
                  )}`}
                >
                  {t(getDeliveryWorkspaceReminderBucketLabelKey(record.reminderBucket))}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs ${getCheckpointStateClasses(
                    record.checkpointState
                  )}`}
                >
                  {t(getCheckpointStateLabelKey(record.checkpointState))}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                  {formatDateTime(record.notificationCreatedAt, formatDateTimeValue)}
                </span>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    {t("delivery.support.notificationCard")}
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-white">
                    {record.notificationTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {record.notificationBody}
                  </p>

                  <dl className="mt-4 grid gap-3 text-sm text-slate-300">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-slate-500">{t("delivery.support.kind")}</dt>
                      <dd className="theme-text-end">{record.notificationKind}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-slate-500">
                        {t("delivery.support.reminderDueOn")}
                      </dt>
                      <dd className="theme-text-end">
                        {formatDate(
                          record.notificationFollowUpDueOn,
                          formatDateValue,
                          notSetLabel
                        )}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-slate-500">{t("delivery.support.workspaceId")}</dt>
                      <dd className="theme-text-end font-mono text-xs ltr-content">
                        {record.workspaceId ?? notSetLabel}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {record.workspaceId ? (
                      <Link
                        className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200 transition hover:border-cyan-300/40 hover:bg-cyan-500/15"
                        href={buildDeliveryReminderDashboardHref(record.workspaceId, {
                          reminderMismatchLifecycleFilter:
                            currentDashboardSearchParams.reminderMismatchLifecycleFilter ??
                            null,
                          reminderSupportFilter: activeFilter,
                          supportActivityFilter:
                            currentDashboardSearchParams.supportActivityFilter ?? null
                        })}
                      >
                        {t("delivery.support.openWorkspace")}
                      </Link>
                    ) : null}

                    {record.workspaceId && record.checkpointState === "checkpoint_mismatch" ? (
                      <Link
                        className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition hover:border-amber-300/40 hover:bg-amber-500/15"
                        href={buildDeliveryReminderFollowUpFormHref({
                          notificationId: record.notificationId,
                          reminderMismatchLifecycleFilter:
                            currentDashboardSearchParams.reminderMismatchLifecycleFilter ??
                            null,
                          reminderSupportFilter: activeFilter,
                          supportActivityFilter:
                            currentDashboardSearchParams.supportActivityFilter ?? null,
                          workspaceId: record.workspaceId
                        })}
                      >
                        {t("delivery.support.openFollowUp")}
                      </Link>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    {t("delivery.support.currentCheckpointCard")}
                  </p>

                  {record.workspaceTitle ? (
                    <>
                      <h3 className="mt-2 text-base font-semibold text-white">
                        {record.workspaceTitle}
                      </h3>

                      <div className="mt-3">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs ${getDeliveryWorkspaceFollowUpClasses(
                            record.workspaceFollowUpStatus ?? "none"
                          )}`}
                        >
                          {t(
                            getDeliveryWorkspaceFollowUpLabelKey(
                              record.workspaceFollowUpStatus ?? "none"
                            )
                          )}
                        </span>
                      </div>

                      <dl className="mt-4 grid gap-3 text-sm text-slate-300">
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-slate-500">
                            {t("delivery.support.followUpDueOn")}
                          </dt>
                          <dd className="theme-text-end">
                            {formatDate(
                              record.workspaceFollowUpDueOn,
                              formatDateValue,
                              notSetLabel
                            )}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-slate-500">
                            {t("delivery.support.lastNotificationBucket")}
                          </dt>
                          <dd className="theme-text-end">
                            {record.workspaceLastNotificationBucket
                              ? t(
                                  getDeliveryWorkspaceReminderBucketLabelKey(
                                    record.workspaceLastNotificationBucket
                                  )
                                )
                              : notSetLabel}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-slate-500">
                            {t("delivery.support.lastNotificationDate")}
                          </dt>
                          <dd className="theme-text-end">
                            {formatDate(
                              record.workspaceLastNotificationDate,
                              formatDateValue,
                              notSetLabel
                            )}
                          </dd>
                        </div>
                      </dl>
                    </>
                  ) : (
                    <div className="mt-3 rounded-[1rem] border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                      {t("delivery.support.workspaceNotFound")}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
