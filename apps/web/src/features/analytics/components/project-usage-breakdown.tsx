import Link from "next/link"
import type {
  ProjectRecord,
  UsageEventRecord
} from "@/server/database/types"

type ProjectUsageBreakdownProps = {
  projectsById: Map<string, ProjectRecord>
  usageEvents: UsageEventRecord[]
}

function formatUsd(value: number) {
  return `$${value.toFixed(4)}`
}

export function ProjectUsageBreakdown({
  projectsById,
  usageEvents
}: ProjectUsageBreakdownProps) {
  const rows = Array.from(
    usageEvents.reduce((map, event) => {
      const current = map.get(event.project_id) ?? {
        cost: 0,
        events: 0
      }

      current.cost += Number(event.estimated_cost_usd ?? 0)
      current.events += 1

      map.set(event.project_id, current)
      return map
    }, new Map<string, { cost: number; events: number }>())
  ).sort((left, right) => right[1].cost - left[1].cost)

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Project usage
      </p>

      <div className="mt-5 space-y-3">
        {rows.map(([projectId, row]) => {
          const project = projectsById.get(projectId)

          return (
            <Link
              key={projectId}
              href={`/dashboard/projects/${projectId}`}
              className="block rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    {project?.name ?? "Unknown project"}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {row.events} usage event{row.events === 1 ? "" : "s"}
                  </p>
                </div>

                <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">
                  {formatUsd(row.cost)}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
