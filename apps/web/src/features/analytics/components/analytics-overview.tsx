import type { UsageEventRecord } from "@/server/database/types"

type AnalyticsOverviewProps = {
  usageEvents: UsageEventRecord[]
}

function formatUsd(value: number) {
  return `$${value.toFixed(4)}`
}

function sumEstimatedCost(events: UsageEventRecord[]) {
  return events.reduce((total, event) => total + Number(event.estimated_cost_usd ?? 0), 0)
}

function sumUnits(events: UsageEventRecord[]) {
  return events.reduce((total, event) => total + Number(event.units ?? 0), 0)
}

function uniqueProjects(events: UsageEventRecord[]) {
  return new Set(events.map((event) => event.project_id)).size
}

export function AnalyticsOverview({ usageEvents }: AnalyticsOverviewProps) {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm text-slate-400">Usage events</p>
        <p className="mt-2 text-2xl font-semibold text-white">{usageEvents.length}</p>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm text-slate-400">Estimated total cost</p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {formatUsd(sumEstimatedCost(usageEvents))}
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm text-slate-400">Tracked units</p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {sumUnits(usageEvents).toFixed(2)}
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm text-slate-400">Projects with usage</p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {uniqueProjects(usageEvents)}
        </p>
      </div>
    </section>
  )
}
