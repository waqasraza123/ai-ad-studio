import { getServerI18n } from "@/lib/i18n/server"
import type { UsageEventRecord } from "@/server/database/types"

type AnalyticsOverviewProps = {
  usageEvents: UsageEventRecord[]
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

export async function AnalyticsOverview({ usageEvents }: AnalyticsOverviewProps) {
  const { formatCurrency, formatNumber, t } = await getServerI18n()

  return (
    <section className="grid gap-4 md:grid-cols-4">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm text-slate-400">{t("analytics.overview.usageEvents")}</p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {formatNumber(usageEvents.length)}
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm text-slate-400">{t("analytics.overview.estimatedTotalCost")}</p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {formatCurrency(sumEstimatedCost(usageEvents), "USD", {
            maximumFractionDigits: 4,
            minimumFractionDigits: 4
          })}
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm text-slate-400">{t("analytics.overview.trackedUnits")}</p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {formatNumber(sumUnits(usageEvents), {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          })}
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm text-slate-400">{t("analytics.overview.projectsWithUsage")}</p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {formatNumber(uniqueProjects(usageEvents))}
        </p>
      </div>
    </section>
  )
}
