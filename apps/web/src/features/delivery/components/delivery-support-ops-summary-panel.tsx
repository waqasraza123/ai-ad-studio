import {
  getDeliverySupportActivityFilterLabel,
  type DeliverySupportActivityFilter
} from "@/features/delivery/lib/delivery-support-activity-filter"
import type { DeliverySupportOpsSummary } from "@/features/delivery/lib/delivery-support-ops-summary"

type DeliverySupportOpsSummaryPanelProps = {
  activeSupportActivityFilter: DeliverySupportActivityFilter
  summary: DeliverySupportOpsSummary
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

export function DeliverySupportOpsSummaryPanel({
  activeSupportActivityFilter,
  summary
}: DeliverySupportOpsSummaryPanelProps) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-white">
            Support operations snapshot
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Counts below reflect the current delivery filters and the active
            support activity filter:
            <span className="ml-1 text-slate-200">
              {getDeliverySupportActivityFilterLabel(activeSupportActivityFilter)}
            </span>
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
          {summary.visibleSupportWorkspaceCount} visible workspaces
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-4">
        <SummaryCard
          accentClassName="border-white/10 bg-white/[0.04] text-slate-100"
          description="Workspaces currently visible under the active support activity scope."
          title="Visible support scope"
          value={summary.visibleSupportWorkspaceCount}
        />

        <SummaryCard
          accentClassName="border-rose-400/30 bg-rose-500/10 text-rose-200"
          description="Visible workspaces with at least one failed reminder repair event."
          title="Failed reminder repairs"
          value={summary.failedReminderRepairWorkspaceCount}
        />

        <SummaryCard
          accentClassName="border-violet-400/30 bg-violet-500/10 text-violet-200"
          description="Visible workspaces with at least one recent support handoff note."
          title="Support handoff notes"
          value={summary.supportHandoffWorkspaceCount}
        />

        <SummaryCard
          accentClassName="border-amber-400/30 bg-amber-500/10 text-amber-200"
          description="Visible workspaces that still have unresolved reminder checkpoint mismatches."
          title="Unresolved mismatches"
          value={summary.unresolvedReminderMismatchWorkspaceCount}
        />
      </div>
    </section>
  )
}
