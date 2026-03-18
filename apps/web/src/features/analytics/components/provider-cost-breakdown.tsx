import type { UsageEventRecord } from "@/server/database/types"

type ProviderCostBreakdownProps = {
  usageEvents: UsageEventRecord[]
}

function formatUsd(value: number) {
  return `$${value.toFixed(4)}`
}

export function ProviderCostBreakdown({
  usageEvents
}: ProviderCostBreakdownProps) {
  const rows = Array.from(
    usageEvents.reduce((map, event) => {
      const provider = event.provider
      const current = map.get(provider) ?? {
        cost: 0,
        events: 0,
        units: 0
      }

      current.cost += Number(event.estimated_cost_usd ?? 0)
      current.events += 1
      current.units += Number(event.units ?? 0)

      map.set(provider, current)
      return map
    }, new Map<string, { cost: number; events: number; units: number }>())
  ).sort((left, right) => right[1].cost - left[1].cost)

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Provider cost breakdown
      </p>

      <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-slate-300">
            <tr>
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">Events</th>
              <th className="px-4 py-3 font-medium">Units</th>
              <th className="px-4 py-3 font-medium">Estimated cost</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([provider, row]) => (
              <tr key={provider} className="border-t border-white/10 text-slate-200">
                <td className="px-4 py-3">{provider}</td>
                <td className="px-4 py-3">{row.events}</td>
                <td className="px-4 py-3">{row.units.toFixed(2)}</td>
                <td className="px-4 py-3">{formatUsd(row.cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
