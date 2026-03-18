import type { UsageEventRecord } from "@/server/database/types"

type UsageEventsTableProps = {
  usageEvents: UsageEventRecord[]
}

function formatUsd(value: number) {
  return `$${value.toFixed(4)}`
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

export function UsageEventsTable({ usageEvents }: UsageEventsTableProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Usage ledger
      </p>

      <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-slate-300">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Units</th>
              <th className="px-4 py-3 font-medium">Estimated cost</th>
            </tr>
          </thead>
          <tbody>
            {usageEvents.map((event) => (
              <tr key={event.id} className="border-t border-white/10 text-slate-200">
                <td className="px-4 py-3">{formatTimestamp(event.created_at)}</td>
                <td className="px-4 py-3">{event.provider}</td>
                <td className="px-4 py-3">{event.event_type}</td>
                <td className="px-4 py-3">{Number(event.units).toFixed(2)}</td>
                <td className="px-4 py-3">{formatUsd(Number(event.estimated_cost_usd))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
