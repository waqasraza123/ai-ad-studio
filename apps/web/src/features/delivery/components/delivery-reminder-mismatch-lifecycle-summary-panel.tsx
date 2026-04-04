import Link from "next/link"
import type { DeliveryReminderMismatchLifecycleFilter } from "@/features/delivery/lib/delivery-reminder-mismatch-lifecycle-filter"
import {
  buildDeliveryReminderMismatchLifecycleFilterHref
} from "@/features/delivery/lib/delivery-reminder-support-links"
import type { DeliveryReminderMismatchLifecycleSummary } from "@/features/delivery/lib/delivery-reminder-mismatch-lifecycle-summary"
import {
  getDeliverySupportActivityFilterLabel,
  type DeliverySupportActivityFilter
} from "@/features/delivery/lib/delivery-support-activity-filter"
import type { DeliveryReminderSupportFilter } from "@/features/delivery/lib/delivery-reminder-support-filter"

type DeliveryReminderMismatchLifecycleSummaryPanelProps = {
  activeLifecycleFilter: DeliveryReminderMismatchLifecycleFilter
  activeSupportActivityFilter: DeliverySupportActivityFilter
  currentDashboardSearchParams: {
    activity?: string | null
    focusFollowUpForm?: boolean | null
    focusReminderNotificationId?: string | null
    focusWorkspaceId?: string | null
    reminderSupportFilter?: DeliveryReminderSupportFilter | null
    reminderMismatchLifecycleFilter?: DeliveryReminderMismatchLifecycleFilter | null
    sort?: string | null
    status?: string | null
    supportActivityFilter?: DeliverySupportActivityFilter | null
  }
  summary: DeliveryReminderMismatchLifecycleSummary
}

function SummaryCard(input: {
  active?: boolean
  accentClassName: string
  description: string
  href?: string
  title: string
  value: number
}) {
  const className = `rounded-[1.25rem] border bg-white/[0.03] p-4 transition ${
    input.active
      ? "border-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
      : "border-white/10"
  } ${input.href ? "hover:border-white/20 hover:bg-white/[0.05]" : ""}`

  const content = (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          {input.title}
        </p>
        <p className="mt-2 text-sm text-slate-400">{input.description}</p>
      </div>
      <div
        className={`rounded-full border px-3 py-1 text-sm font-semibold ${input.accentClassName}`}
      >
        {input.value}
      </div>
    </div>
  )

  if (input.href) {
    return (
      <Link className={className} href={input.href}>
        {content}
      </Link>
    )
  }

  return (
    <div className={className}>
      {content}
    </div>
  )
}

export function DeliveryReminderMismatchLifecycleSummaryPanel({
  activeLifecycleFilter,
  activeSupportActivityFilter,
  currentDashboardSearchParams,
  summary
}: DeliveryReminderMismatchLifecycleSummaryPanelProps) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-white">
            Reminder mismatch lifecycle
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Counts below reflect the current delivery scope and active support
            activity filter:
            <span className="ml-1 text-slate-200">
              {getDeliverySupportActivityFilterLabel(activeSupportActivityFilter)}
            </span>
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
          {summary.visibleWorkspaceCount} visible workspaces
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          active={activeLifecycleFilter === "unresolved"}
          accentClassName="border-amber-400/30 bg-amber-500/10 text-amber-200"
          description="Visible reminder support records still treated as unresolved mismatches."
          href={buildDeliveryReminderMismatchLifecycleFilterHref({
            activity: currentDashboardSearchParams.activity ?? null,
            focusFollowUpForm: currentDashboardSearchParams.focusFollowUpForm ?? null,
            focusReminderNotificationId:
              currentDashboardSearchParams.focusReminderNotificationId ?? null,
            focusWorkspaceId: currentDashboardSearchParams.focusWorkspaceId ?? null,
            reminderMismatchLifecycleFilter: "unresolved",
            reminderSupportFilter:
              currentDashboardSearchParams.reminderSupportFilter ?? null,
            sort: currentDashboardSearchParams.sort ?? null,
            status: currentDashboardSearchParams.status ?? null,
            supportActivityFilter:
              currentDashboardSearchParams.supportActivityFilter ?? null
          })}
          title="Unresolved mismatches"
          value={summary.unresolvedMismatchCount}
        />

        <SummaryCard
          active={activeLifecycleFilter === "resolved"}
          accentClassName="border-cyan-400/30 bg-cyan-500/10 text-cyan-200"
          description="Visible reminder support records already marked as resolved."
          href={buildDeliveryReminderMismatchLifecycleFilterHref({
            activity: currentDashboardSearchParams.activity ?? null,
            focusFollowUpForm: currentDashboardSearchParams.focusFollowUpForm ?? null,
            focusReminderNotificationId:
              currentDashboardSearchParams.focusReminderNotificationId ?? null,
            focusWorkspaceId: currentDashboardSearchParams.focusWorkspaceId ?? null,
            reminderMismatchLifecycleFilter: "resolved",
            reminderSupportFilter:
              currentDashboardSearchParams.reminderSupportFilter ?? null,
            sort: currentDashboardSearchParams.sort ?? null,
            status: currentDashboardSearchParams.status ?? null,
            supportActivityFilter:
              currentDashboardSearchParams.supportActivityFilter ?? null
          })}
          title="Resolved mismatches"
          value={summary.resolvedMismatchCount}
        />

        <SummaryCard
          accentClassName="border-amber-400/30 bg-amber-500/10 text-amber-200"
          description="Visible mismatch-reopen lifecycle activity entries that succeeded."
          title="Reopened mismatches"
          value={summary.reopenedMismatchCount}
        />

        <SummaryCard
          active={activeLifecycleFilter === "failed_reopen_attempts"}
          accentClassName="border-rose-400/30 bg-rose-500/10 text-rose-200"
          description="Visible mismatch-reopen lifecycle activity entries that failed."
          href={buildDeliveryReminderMismatchLifecycleFilterHref({
            activity: currentDashboardSearchParams.activity ?? null,
            focusFollowUpForm: currentDashboardSearchParams.focusFollowUpForm ?? null,
            focusReminderNotificationId:
              currentDashboardSearchParams.focusReminderNotificationId ?? null,
            focusWorkspaceId: currentDashboardSearchParams.focusWorkspaceId ?? null,
            reminderMismatchLifecycleFilter: "failed_reopen_attempts",
            reminderSupportFilter:
              currentDashboardSearchParams.reminderSupportFilter ?? null,
            sort: currentDashboardSearchParams.sort ?? null,
            status: currentDashboardSearchParams.status ?? null,
            supportActivityFilter:
              currentDashboardSearchParams.supportActivityFilter ?? null
          })}
          title="Failed reopen attempts"
          value={summary.failedReopenAttemptsCount}
        />
      </div>
    </section>
  )
}
