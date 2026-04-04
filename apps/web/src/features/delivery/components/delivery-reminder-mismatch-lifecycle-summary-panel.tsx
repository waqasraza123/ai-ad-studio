import type { DeliveryReminderMismatchLifecycleSummary } from "@/features/delivery/lib/delivery-reminder-mismatch-lifecycle-summary"
import {
  getDeliverySupportActivityFilterLabel,
  type DeliverySupportActivityFilter
} from "@/features/delivery/lib/delivery-support-activity-filter"

type DeliveryReminderMismatchLifecycleSummaryPanelProps = {
  activeSupportActivityFilter: DeliverySupportActivityFilter
  summary: DeliveryReminderMismatchLifecycleSummary
}

function SummaryCard(input: {
  accentClassName: string
  description: string
  title: string
  value: number
}) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
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
    </div>
  )
}

export function DeliveryReminderMismatchLifecycleSummaryPanel({
  activeSupportActivityFilter,
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
          accentClassName="border-amber-400/30 bg-amber-500/10 text-amber-200"
          description="Visible reminder support records still treated as unresolved mismatches."
          title="Unresolved mismatches"
          value={summary.unresolvedMismatchCount}
        />

        <SummaryCard
          accentClassName="border-cyan-400/30 bg-cyan-500/10 text-cyan-200"
          description="Visible reminder support records already marked as resolved."
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
          accentClassName="border-rose-400/30 bg-rose-500/10 text-rose-200"
          description="Visible mismatch-reopen lifecycle activity entries that failed."
          title="Failed reopen attempts"
          value={summary.failedReopenAttemptsCount}
        />
      </div>
    </section>
  )
}
