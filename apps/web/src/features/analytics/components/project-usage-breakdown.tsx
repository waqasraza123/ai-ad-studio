import Link from "next/link"
import { getServerI18n } from "@/lib/i18n/server"
import type {
  ProjectRecord,
  UsageEventRecord
} from "@/server/database/types"

type ProjectUsageBreakdownProps = {
  projectsById: Map<string, ProjectRecord>
  usageEvents: UsageEventRecord[]
}

export async function ProjectUsageBreakdown({
  projectsById,
  usageEvents
}: ProjectUsageBreakdownProps) {
  const { formatCurrency, formatNumber, t } = await getServerI18n()
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
        {t("analytics.projectBreakdown.eyebrow")}
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
                    {project?.name ?? t("common.words.unknownProject")}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {t("analytics.projectBreakdown.events", {
                      count: row.events,
                      value: formatNumber(row.events)
                    })}
                  </p>
                </div>

                <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-100">
                  {formatCurrency(row.cost, "USD", {
                    maximumFractionDigits: 4,
                    minimumFractionDigits: 4
                  })}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
