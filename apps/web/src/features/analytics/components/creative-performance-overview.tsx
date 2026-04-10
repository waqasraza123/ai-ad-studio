import { getServerI18n } from "@/lib/i18n/server"
import type { CreativePerformanceSummary } from "@/features/analytics/lib/creative-performance-summary"

type CreativePerformanceOverviewProps = {
  summary: CreativePerformanceSummary
}

export async function CreativePerformanceOverview({
  summary
}: CreativePerformanceOverviewProps) {
  const { formatCurrency, formatNumber, t } = await getServerI18n()

  return (
    <section className="grid gap-4 md:grid-cols-5">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm text-slate-400">
          {t("analytics.creative.overview.impressions")}
        </p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {formatNumber(summary.totals.impressions)}
        </p>
      </div>
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm text-slate-400">{t("analytics.creative.overview.clicks")}</p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {formatNumber(summary.totals.clicks)}
        </p>
      </div>
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm text-slate-400">{t("analytics.creative.overview.spend")}</p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {formatCurrency(summary.totals.spendUsd, "USD")}
        </p>
      </div>
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm text-slate-400">
          {t("analytics.creative.overview.conversions")}
        </p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {formatNumber(summary.totals.conversions)}
        </p>
      </div>
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm text-slate-400">{t("analytics.creative.overview.roas")}</p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {formatNumber(summary.totals.roas, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          })}
        </p>
      </div>
    </section>
  )
}
