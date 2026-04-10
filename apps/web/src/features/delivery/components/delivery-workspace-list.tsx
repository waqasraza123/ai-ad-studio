import Link from "next/link"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { getPublicEnvironment } from "@/lib/env"
import { getServerI18n } from "@/lib/i18n/server"
import { updateDeliveryWorkspaceFollowUpAction } from "@/features/delivery/actions/manage-delivery-workspace-follow-up"
import {
  getDeliveryWorkspaceFollowUpClasses,
  getDeliveryWorkspaceFollowUpLabelKey,
  getDeliveryWorkspaceReminderBucketClasses,
  getDeliveryWorkspaceReminderBucketLabelKey,
  resolveDeliveryWorkspaceReminderBucket
} from "@/features/delivery/lib/delivery-workspace-follow-up"
import type {
  DeliveryWorkspaceOverviewRecord,
  DeliveryWorkspaceQuickFilter,
  DeliveryWorkspaceSortKey,
  DeliveryWorkspaceStatusFilter
} from "@/features/delivery/lib/delivery-workspace-overview"
import type {
  DeliveryFollowUpStatus,
  ProjectRecord
} from "@/server/database/types"

import { DeliveryReminderFollowUpContextCallout } from "@/features/delivery/components/delivery-reminder-follow-up-context-callout"
import type { DeliveryReminderSupportRecord } from "@/features/delivery/lib/delivery-reminder-support"
import type { DeliveryReminderSupportFilter } from "@/features/delivery/lib/delivery-reminder-support-filter"
import type { DeliverySupportActivityFilter } from "@/features/delivery/lib/delivery-support-activity-filter"
import type { DeliveryReminderRepairOutcome } from "@/features/delivery/lib/delivery-reminder-repair-outcome"
import {
  buildDeliveryWorkspaceFocusAnchorId,
  buildDeliveryWorkspaceFollowUpAnchorId
} from "@/features/delivery/lib/delivery-reminder-support-links"
import {
  DEFAULT_DELIVERY_WORKSPACE_VISIBLE_COUNT,
  getNextDeliveryWorkspaceVisibleCount
} from "@/features/delivery/lib/delivery-workspace-list-window"
import type { Translator } from "@/lib/i18n/translator"

type DeliveryWorkspaceListProps = {
  activeReminderSupportFilter?: DeliveryReminderSupportFilter
  activeSupportActivityFilter?: DeliverySupportActivityFilter
  currentDashboardSearchParams: {
    activity?: string | null
    focusFollowUpForm?: boolean
    focusReminderNotificationId?: string | null
    focusWorkspaceId?: string | null
    reminderMismatchLifecycleFilter?: string | null
    reminderSupportFilter?: DeliveryReminderSupportFilter
    sort?: string | null
    status?: string | null
    supportActivityFilter?: DeliverySupportActivityFilter
    workspaceLimit?: number | null
  }
  focusFollowUpFormWorkspaceId?: string | null
  repairOutcome?: DeliveryReminderRepairOutcome | null
  focusWorkspaceId?: string | null
  focusedReminderSupportRecord?: DeliveryReminderSupportRecord | null
  projectsById: Map<string, ProjectRecord>
  selectedActivityFilter: DeliveryWorkspaceQuickFilter
  selectedSortKey: DeliveryWorkspaceSortKey
  selectedStatusFilter: DeliveryWorkspaceStatusFilter
  todayDateKey: string
  totalWorkspaceCount: number
  workspaceOverviews: DeliveryWorkspaceOverviewRecord[]
}

const followUpStatuses: DeliveryFollowUpStatus[] = [
  "none",
  "needs_follow_up",
  "reminder_scheduled",
  "waiting_on_client",
  "resolved"
]

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

function formatTimestamp(
  value: string | null,
  formatDateTimeValue: Translator["formatDateTime"],
  notSetLabel: string
) {
  if (!value) {
    return notSetLabel
  }

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
  if (!value) {
    return notSetLabel
  }

  return formatDateValue(`${value}T00:00:00Z`, {
    dateStyle: "medium"
  })
}

function getStatusLabelKey(
  status: DeliveryWorkspaceOverviewRecord["workspace"]["status"]
) {
  return status === "active"
    ? ("delivery.workspaceList.status.active" as const)
    : ("delivery.workspaceList.status.archived" as const)
}

function getActivityFilterLabelKey(filter: DeliveryWorkspaceQuickFilter) {
  if (filter === "needs_follow_up") {
    return "delivery.workspaceList.activity.needsFollowUp" as const
  }

  if (filter === "acknowledged") {
    return "delivery.workspaceList.activity.acknowledged" as const
  }

  if (filter === "viewed_only") {
    return "delivery.workspaceList.activity.viewedOnly" as const
  }

  if (filter === "downloaded") {
    return "delivery.workspaceList.activity.downloaded" as const
  }

  return "delivery.workspaceList.activity.all" as const
}

function getSortLabelKey(sort: DeliveryWorkspaceSortKey) {
  return sort === "newest"
    ? ("delivery.workspaceList.sort.newest" as const)
    : ("delivery.workspaceList.sort.latestActivity" as const)
}

function getActivityExcerpt(
  overviewRecord: DeliveryWorkspaceOverviewRecord,
  t: Translator["t"]
) {
  const activitySummary = overviewRecord.activitySummary

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

function buildDeliveryDashboardHref(input: {
  activity: DeliveryWorkspaceQuickFilter
  sort: DeliveryWorkspaceSortKey
  status: DeliveryWorkspaceStatusFilter
  workspaceLimit?: number | null
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

  if (
    typeof input.workspaceLimit === "number" &&
    input.workspaceLimit > DEFAULT_DELIVERY_WORKSPACE_VISIBLE_COUNT
  ) {
    searchParams.set("workspace_limit", String(input.workspaceLimit))
  }

  const queryString = searchParams.toString()

  return queryString.length > 0
    ? `/dashboard/delivery?${queryString}`
    : "/dashboard/delivery"
}

function buildDeliveryWorkspaceListHref(input: {
  activity?: string | null
  focusFollowUpForm?: boolean
  focusReminderNotificationId?: string | null
  focusWorkspaceId?: string | null
  reminderMismatchLifecycleFilter?: string | null
  reminderSupportFilter?: DeliveryReminderSupportFilter
  sort?: string | null
  status?: string | null
  supportActivityFilter?: DeliverySupportActivityFilter
  workspaceLimit?: number | null
}) {
  const searchParams = new URLSearchParams()

  if (input.activity) {
    searchParams.set("activity", input.activity)
  }

  if (input.focusFollowUpForm) {
    searchParams.set("focus_follow_up_form", "1")
  }

  if (input.focusReminderNotificationId) {
    searchParams.set(
      "focus_reminder_notification_id",
      input.focusReminderNotificationId
    )
  }

  if (input.focusWorkspaceId) {
    searchParams.set("focus_workspace_id", input.focusWorkspaceId)
  }

  if (
    input.reminderMismatchLifecycleFilter &&
    input.reminderMismatchLifecycleFilter !== "all"
  ) {
    searchParams.set(
      "reminder_mismatch_lifecycle_filter",
      input.reminderMismatchLifecycleFilter
    )
  }

  if (input.reminderSupportFilter && input.reminderSupportFilter !== "all") {
    searchParams.set("reminder_support_filter", input.reminderSupportFilter)
  }

  if (input.sort) {
    searchParams.set("sort", input.sort)
  }

  if (input.status) {
    searchParams.set("status", input.status)
  }

  if (input.supportActivityFilter && input.supportActivityFilter !== "all") {
    searchParams.set("support_activity_filter", input.supportActivityFilter)
  }

  if (
    typeof input.workspaceLimit === "number" &&
    input.workspaceLimit > DEFAULT_DELIVERY_WORKSPACE_VISIBLE_COUNT
  ) {
    searchParams.set("workspace_limit", String(input.workspaceLimit))
  }

  const queryString = searchParams.toString()

  return queryString.length > 0
    ? `/dashboard/delivery?${queryString}`
    : "/dashboard/delivery"
}

export async function DeliveryWorkspaceList({
  activeReminderSupportFilter = "all",
  activeSupportActivityFilter = "all",
  currentDashboardSearchParams,
  focusFollowUpFormWorkspaceId = null,
  focusWorkspaceId = null,
  focusedReminderSupportRecord = null,
  repairOutcome = null,
  projectsById,
  selectedActivityFilter,
  selectedSortKey,
  selectedStatusFilter,
  todayDateKey,
  totalWorkspaceCount,
  workspaceOverviews
}: DeliveryWorkspaceListProps) {
  const environment = getPublicEnvironment()
  const { formatDate: formatDateValue, formatDateTime: formatDateTimeValue, t } =
    await getServerI18n()
  const notSetLabel = t("common.words.notSet")
  const showingAllWorkspaces = workspaceOverviews.length >= totalWorkspaceCount
  const nextVisibleCount = getNextDeliveryWorkspaceVisibleCount({
    currentCount: workspaceOverviews.length,
    totalCount: totalWorkspaceCount
  })

  return (
    <div className="space-y-4" data-testid="delivery-workspace-list">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
              {t("delivery.workspaceList.controlsEyebrow")}
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              {t("delivery.workspaceList.controlsDescription")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildDeliveryDashboardHref({
                  activity: selectedActivityFilter,
                  sort: selectedSortKey,
                  status: "all",
                  workspaceLimit: currentDashboardSearchParams.workspaceLimit
                })}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-white/[0.08] ${filterClasses(selectedStatusFilter === "all")}`}
              >
                {t("delivery.workspaceList.status.all")}
              </Link>
              <Link
                href={buildDeliveryDashboardHref({
                  activity: selectedActivityFilter,
                  sort: selectedSortKey,
                  status: "active",
                  workspaceLimit: currentDashboardSearchParams.workspaceLimit
                })}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-white/[0.08] ${filterClasses(selectedStatusFilter === "active")}`}
              >
                {t("delivery.workspaceList.status.active")}
              </Link>
              <Link
                href={buildDeliveryDashboardHref({
                  activity: selectedActivityFilter,
                  sort: selectedSortKey,
                  status: "archived",
                  workspaceLimit: currentDashboardSearchParams.workspaceLimit
                })}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-white/[0.08] ${filterClasses(selectedStatusFilter === "archived")}`}
              >
                {t("delivery.workspaceList.status.archived")}
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={buildDeliveryDashboardHref({
                  activity: "all",
                  sort: selectedSortKey,
                  status: selectedStatusFilter,
                  workspaceLimit: currentDashboardSearchParams.workspaceLimit
                })}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-white/[0.08] ${filterClasses(selectedActivityFilter === "all")}`}
              >
                {t("delivery.workspaceList.activity.all")}
              </Link>
              <Link
                href={buildDeliveryDashboardHref({
                  activity: "needs_follow_up",
                  sort: selectedSortKey,
                  status: selectedStatusFilter,
                  workspaceLimit: currentDashboardSearchParams.workspaceLimit
                })}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-white/[0.08] ${filterClasses(selectedActivityFilter === "needs_follow_up")}`}
              >
                {t("delivery.workspaceList.activity.needsFollowUp")}
              </Link>
              <Link
                href={buildDeliveryDashboardHref({
                  activity: "acknowledged",
                  sort: selectedSortKey,
                  status: selectedStatusFilter,
                  workspaceLimit: currentDashboardSearchParams.workspaceLimit
                })}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-white/[0.08] ${filterClasses(selectedActivityFilter === "acknowledged")}`}
              >
                {t("delivery.workspaceList.activity.acknowledged")}
              </Link>
              <Link
                href={buildDeliveryDashboardHref({
                  activity: "viewed_only",
                  sort: selectedSortKey,
                  status: selectedStatusFilter,
                  workspaceLimit: currentDashboardSearchParams.workspaceLimit
                })}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-white/[0.08] ${filterClasses(selectedActivityFilter === "viewed_only")}`}
              >
                {t("delivery.workspaceList.activity.viewedOnly")}
              </Link>
              <Link
                href={buildDeliveryDashboardHref({
                  activity: "downloaded",
                  sort: selectedSortKey,
                  status: selectedStatusFilter,
                  workspaceLimit: currentDashboardSearchParams.workspaceLimit
                })}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-white/[0.08] ${filterClasses(selectedActivityFilter === "downloaded")}`}
              >
                {t("delivery.workspaceList.activity.downloaded")}
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={buildDeliveryDashboardHref({
                  activity: selectedActivityFilter,
                  sort: "latest_activity",
                  status: selectedStatusFilter,
                  workspaceLimit: currentDashboardSearchParams.workspaceLimit
                })}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-white/[0.08] ${filterClasses(selectedSortKey === "latest_activity")}`}
              >
                {t("delivery.workspaceList.sort.latestActivity")}
              </Link>
              <Link
                href={buildDeliveryDashboardHref({
                  activity: selectedActivityFilter,
                  sort: "newest",
                  status: selectedStatusFilter,
                  workspaceLimit: currentDashboardSearchParams.workspaceLimit
                })}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition hover:bg-white/[0.08] ${filterClasses(selectedSortKey === "newest")}`}
              >
                {t("delivery.workspaceList.sort.newest")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {totalWorkspaceCount > 0 ? (
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-300">
              {t("delivery.workspaceList.showingSummary", {
                shown: workspaceOverviews.length,
                total: totalWorkspaceCount
              })}
            </p>

            {!showingAllWorkspaces ? (
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildDeliveryWorkspaceListHref({
                    ...currentDashboardSearchParams,
                    workspaceLimit: nextVisibleCount
                  })}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                >
                  {t("delivery.workspaceList.showMore", {
                    count: nextVisibleCount - workspaceOverviews.length
                  })}
                </Link>
                <Link
                  href={buildDeliveryWorkspaceListHref({
                    ...currentDashboardSearchParams,
                    workspaceLimit: totalWorkspaceCount
                  })}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                >
                  {t("delivery.workspaceList.showAll")}
                </Link>
              </div>
            ) : currentDashboardSearchParams.workspaceLimit &&
              currentDashboardSearchParams.workspaceLimit >
                DEFAULT_DELIVERY_WORKSPACE_VISIBLE_COUNT ? (
              <Link
                href={buildDeliveryWorkspaceListHref({
                  ...currentDashboardSearchParams,
                  workspaceLimit: null
                })}
                className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
              >
                {t("delivery.workspaceList.collapse")}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {workspaceOverviews.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
          {t("delivery.workspaceList.empty")}
        </div>
      ) : (
        workspaceOverviews.map((overviewRecord) => {
          const { activityExcerpt, activitySummary, latestActivityAt, workspace } =
            overviewRecord
          const project = projectsById.get(workspace.project_id) ?? null
          const publicUrl = `${environment.NEXT_PUBLIC_APP_URL}/delivery/${workspace.token}`
          const followUpAction = updateDeliveryWorkspaceFollowUpAction.bind(
            null,
            workspace.id
          )
          const hasRecipientActivity =
            Boolean(activitySummary.lastViewedAt) || activitySummary.downloadCount > 0
          const showFollowUpHint =
            hasRecipientActivity &&
            !activitySummary.acknowledgedAt &&
            workspace.follow_up_status === "none"

          const reminderBucket = resolveDeliveryWorkspaceReminderBucket({
            followUpDueOn: workspace.follow_up_due_on,
            followUpStatus: workspace.follow_up_status,
            todayDateKey
          })
          const isFocused = workspace.id === focusWorkspaceId
          const isFollowUpFormFocused =
            workspace.id === focusFollowUpFormWorkspaceId
          const focusAnchorId = buildDeliveryWorkspaceFocusAnchorId(workspace.id)
          const followUpAnchorId = buildDeliveryWorkspaceFollowUpAnchorId(workspace.id)
          const focusedReminderContext =
            isFollowUpFormFocused &&
            focusedReminderSupportRecord?.workspaceId === workspace.id
              ? focusedReminderSupportRecord
              : null

          return (
            <div
              id={focusAnchorId}
              key={workspace.id}
              data-testid="delivery-workspace-card"
              className={`scroll-mt-24 rounded-[2rem] border p-5 transition ${
                isFocused
                  ? "border-cyan-400/40 bg-cyan-500/[0.08] ring-1 ring-cyan-300/30"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-white">{workspace.title}</p>
                    {workspace.id === focusWorkspaceId ? (
                      <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
                        {t("delivery.workspaceList.focusedFromSupport")}
                      </span>
                    ) : null}
                    <span className={`rounded-full border px-3 py-1 text-xs ${statusClasses(workspace.status)}`}>
                      {t(getStatusLabelKey(workspace.status))}
                    </span>
                    {workspace.follow_up_status !== "none" ? (
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${getDeliveryWorkspaceFollowUpClasses(workspace.follow_up_status)}`}
                      >
                        {t(getDeliveryWorkspaceFollowUpLabelKey(workspace.follow_up_status))}
                      </span>
                    ) : null}
                    {reminderBucket !== "none" ? (
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${getDeliveryWorkspaceReminderBucketClasses(reminderBucket)}`}
                      >
                        {t(getDeliveryWorkspaceReminderBucketLabelKey(reminderBucket))}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-sm text-slate-300">
                    {project?.name ?? t("common.words.unknownProject")}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {workspace.summary}
                  </p>

                  <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {t("delivery.workspaceList.activityExcerptLabel")}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-white">
                      {getActivityExcerpt(overviewRecord, t)}
                    </p>
                    {activitySummary.acknowledgementNote ? (
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {activitySummary.acknowledgementNote}
                      </p>
                    ) : null}
                  </div>

                  {showFollowUpHint ? (
                    <div className="mt-4 rounded-[1.25rem] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                      {t("delivery.workspaceList.recipientHint")}
                    </div>
                  ) : null}

                  <section
                    id={followUpAnchorId}
                    className={`mt-4 rounded-[1.25rem] border p-4 ${
                      isFollowUpFormFocused
                        ? "border-amber-400/30 bg-amber-500/[0.08] ring-1 ring-amber-300/30"
                        : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    {focusedReminderContext ? (
                      <div className="mb-4">
                        <DeliveryReminderFollowUpContextCallout
                          activeReminderSupportFilter={activeReminderSupportFilter}
                          activeSupportActivityFilter={activeSupportActivityFilter}
                          currentFollowUpNote={workspace.follow_up_note ?? null}
                          record={focusedReminderContext}
                          repairOutcome={repairOutcome}
                        />
                      </div>
                    ) : null}

                    {isFollowUpFormFocused ? (
                      <div className="mb-4">
                        <span className="inline-flex rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
                          {t("delivery.workspaceList.followUpFocused")}
                        </span>
                      </div>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        {t("delivery.workspaceList.ownerFollowUp")}
                      </p>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${getDeliveryWorkspaceFollowUpClasses(workspace.follow_up_status)}`}
                      >
                        {t(getDeliveryWorkspaceFollowUpLabelKey(workspace.follow_up_status))}
                      </span>
                      {reminderBucket !== "none" ? (
                        <span
                          className={`rounded-full border px-3 py-1 text-xs ${getDeliveryWorkspaceReminderBucketClasses(reminderBucket)}`}
                        >
                          {t(getDeliveryWorkspaceReminderBucketLabelKey(reminderBucket))}
                        </span>
                      ) : null}
                    </div>

                    <form action={followUpAction} className="mt-4 space-y-4">
                      <label className="grid gap-2">
                        <span className="text-sm text-slate-300">
                          {t("delivery.workspaceList.followUpState")}
                        </span>
                        <select
                          className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-indigo-300/40"
                          defaultValue={workspace.follow_up_status}
                          name="follow_up_status"
                        >
                          {followUpStatuses.map((status) => (
                            <option key={status} value={status}>
                              {t(getDeliveryWorkspaceFollowUpLabelKey(status))}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="grid gap-2">
                        <span className="text-sm text-slate-300">
                          {t("delivery.workspaceList.reminderDate")}
                        </span>
                        <input
                          className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-indigo-300/40"
                          defaultValue={workspace.follow_up_due_on ?? ""}
                          name="follow_up_due_on"
                          type="date"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-sm text-slate-300">
                          {t("delivery.workspaceList.ownerNote")}
                        </span>
                        <textarea
                          className="min-h-24 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
                          defaultValue={workspace.follow_up_note ?? ""}
                          name="follow_up_note"
                          placeholder={t("delivery.workspaceList.ownerNotePlaceholder")}
                        />
                      </label>

                      <div className="flex flex-wrap items-center gap-3">
                        <FormSubmitButton pendingLabel={t("delivery.workspaceList.saving")}>
                          {t("delivery.workspaceList.saveFollowUp")}
                        </FormSubmitButton>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          {t("delivery.workspaceList.updated", {
                            value: formatTimestamp(
                              workspace.follow_up_updated_at,
                              formatDateTimeValue,
                              notSetLabel
                            )
                          })}
                        </p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          {t("delivery.workspaceList.due", {
                            value: formatDate(
                              workspace.follow_up_due_on,
                              formatDateValue,
                              notSetLabel
                            )
                          })}
                        </p>
                      </div>
                    </form>
                  </section>

                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <div className="rounded-[1.25rem] border border-emerald-400/20 bg-emerald-500/10 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">
                        {t("delivery.workspaceList.delivered")}
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {formatTimestamp(
                          activitySummary.deliveredAt,
                          formatDateTimeValue,
                          notSetLabel
                        )}
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        {t("delivery.workspaceList.viewed")}
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {formatTimestamp(
                          activitySummary.lastViewedAt,
                          formatDateTimeValue,
                          notSetLabel
                        )}
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        {t("delivery.workspaceList.downloaded")}
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {activitySummary.downloadCount}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                        {t("delivery.workspaceList.last", {
                          value: formatTimestamp(
                            activitySummary.lastDownloadedAt,
                            formatDateTimeValue,
                            notSetLabel
                          )
                        })}
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] border border-indigo-400/20 bg-indigo-500/10 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">
                        {t("delivery.workspaceList.acknowledged")}
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {formatTimestamp(
                          activitySummary.acknowledgedAt,
                          formatDateTimeValue,
                          notSetLabel
                        )}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                        {activitySummary.acknowledgedBy ??
                          t("delivery.workspaceList.noRecipientLabel")}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">
                    {t("delivery.workspaceList.created", {
                      created: formatTimestamp(
                        workspace.created_at,
                        formatDateTimeValue,
                        notSetLabel
                      ),
                      latest: formatTimestamp(
                        latestActivityAt,
                        formatDateTimeValue,
                        notSetLabel
                      )
                    })}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/exports/${workspace.canonical_export_id}`}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                  >
                    {t("delivery.workspaceList.openCanonical")}
                  </Link>
                  {workspace.status === "active" ? (
                    <a
                      href={publicUrl}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                    >
                      {t("delivery.workspaceList.openDelivery")}
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
