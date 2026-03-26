import { buildDeliveryReminderDashboardHref } from "@/features/delivery/lib/delivery-reminder-support-links"
import Link from "next/link"
import {
  getDeliveryWorkspaceFollowUpClasses,
  getDeliveryWorkspaceFollowUpLabel,
  getDeliveryWorkspaceReminderBucketClasses,
  getDeliveryWorkspaceReminderBucketLabel
} from "@/features/delivery/lib/delivery-workspace-follow-up"
import type {
  DeliveryReminderSupportRecord,
  DeliveryReminderSupportSummary
} from "@/features/delivery/lib/delivery-reminder-support"

type DeliveryReminderSupportPanelProps = {
  records: DeliveryReminderSupportRecord[]
  summary: DeliveryReminderSupportSummary
}

function formatDateTime(value: string) {
  return value.replace("T", " ").replace(".000Z", "Z")
}

function formatDate(value: string | null) {
  return value ?? "—"
}

function getCheckpointStateClasses(
  checkpointState: DeliveryReminderSupportRecord["checkpointState"]
) {
  if (checkpointState === "in_sync") {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
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

  if (checkpointState === "checkpoint_mismatch") {
    return "Checkpoint mismatch"
  }

  return "Workspace missing"
}

export function DeliveryReminderSupportPanel({
  records,
  summary
}: DeliveryReminderSupportPanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Internal support view
          </p>
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Recent delivery reminder notifications
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Compare the last reminder notification with the current workspace
              checkpoint state.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-200">
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
            {summary.totalCount} recent
          </span>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-200">
            {summary.inSyncCount} in sync
          </span>
          <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-amber-200">
            {summary.checkpointMismatchCount} mismatch
          </span>
          <span className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-rose-200">
            {summary.workspaceMissingCount} missing workspace
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-300">
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
          {summary.dueTodayCount} due today
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
          {summary.overdueCount} overdue
        </span>
      </div>

      {records.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
          No recent delivery reminder notifications yet.
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
                  {getDeliveryWorkspaceReminderBucketLabel(record.reminderBucket)}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs ${getCheckpointStateClasses(
                    record.checkpointState
                  )}`}
                >
                  {getCheckpointStateLabel(record.checkpointState)}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                  {formatDateTime(record.notificationCreatedAt)}
                </span>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Reminder notification
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-white">
                    {record.notificationTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {record.notificationBody}
                  </p>

                  <dl className="mt-4 grid gap-3 text-sm text-slate-300">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-slate-500">Kind</dt>
                      <dd className="text-right">{record.notificationKind}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-slate-500">Reminder due on</dt>
                      <dd className="text-right">
                        {formatDate(record.notificationFollowUpDueOn)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-slate-500">Workspace id</dt>
                      <dd className="text-right font-mono text-xs">
                        {record.workspaceId ?? "—"}
                      </dd>
                    </div>
                  </dl>

                  {record.workspaceId ? (
                    <div className="mt-4">
                      <Link
                        className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200 transition hover:border-cyan-300/40 hover:bg-cyan-500/15"
                        href={buildDeliveryReminderDashboardHref(record.workspaceId)}
                      >
                        Open workspace in delivery dashboard
                      </Link>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Current workspace checkpoint
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
                          {getDeliveryWorkspaceFollowUpLabel(
                            record.workspaceFollowUpStatus ?? "none"
                          )}
                        </span>
                      </div>

                      <dl className="mt-4 grid gap-3 text-sm text-slate-300">
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-slate-500">Follow-up due on</dt>
                          <dd className="text-right">
                            {formatDate(record.workspaceFollowUpDueOn)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-slate-500">
                            Last notification bucket
                          </dt>
                          <dd className="text-right">
                            {record.workspaceLastNotificationBucket
                              ? getDeliveryWorkspaceReminderBucketLabel(
                                  record.workspaceLastNotificationBucket
                                )
                              : "—"}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-slate-500">Last notification date</dt>
                          <dd className="text-right">
                            {formatDate(record.workspaceLastNotificationDate)}
                          </dd>
                        </div>
                      </dl>
                    </>
                  ) : (
                    <div className="mt-3 rounded-[1rem] border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                      The workspace referenced by this notification could not be
                      resolved from the current delivery workspace list.
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
