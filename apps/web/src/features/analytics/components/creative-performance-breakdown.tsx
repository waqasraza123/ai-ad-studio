import { getServerI18n } from "@/lib/i18n/server"
import type { ProjectRecord } from "@/server/database/types"
import type {
  CreativePerformanceBreakdownRow,
  CreativePerformanceSummary,
  TopCreativePerformanceRow
} from "@/features/analytics/lib/creative-performance-summary"

type CreativePerformanceBreakdownProps = {
  projectsById: Map<string, ProjectRecord>
  summary: CreativePerformanceSummary
}

type BreakdownTableProps = {
  title: string
  rows: CreativePerformanceBreakdownRow[]
}

async function BreakdownTable({ title, rows }: BreakdownTableProps) {
  const { formatCurrency, formatNumber, t } = await getServerI18n()

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{title}</p>
      {rows.length === 0 ? (
        <div className="mt-4 rounded-[1rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
          {t("analytics.creative.empty")}
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-[1rem] border border-white/10">
          <table className="theme-text-start w-full text-sm">
            <thead className="bg-white/[0.04] text-slate-300">
              <tr>
                <th className="px-4 py-3 font-medium">{t("common.words.label")}</th>
                <th className="px-4 py-3 font-medium">{t("common.words.records")}</th>
                <th className="theme-text-end px-4 py-3 font-medium">
                  {t("common.words.impressions")}
                </th>
                <th className="theme-text-end px-4 py-3 font-medium">
                  {t("common.words.roas")}
                </th>
                <th className="theme-text-end px-4 py-3 font-medium">
                  {t("common.words.spend")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-white/10 text-slate-200">
                  <td className="px-4 py-3">{row.label}</td>
                  <td className="px-4 py-3">{formatNumber(row.recordCount)}</td>
                  <td className="theme-text-end px-4 py-3">
                    {formatNumber(row.impressions)}
                  </td>
                  <td className="theme-text-end px-4 py-3">
                    {formatNumber(row.roas, {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2
                    })}
                  </td>
                  <td className="theme-text-end px-4 py-3">
                    {formatCurrency(row.spendUsd, "USD")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

async function TopExportsTable(input: {
  projectsById: Map<string, ProjectRecord>
  rows: TopCreativePerformanceRow[]
}) {
  const { formatCurrency, formatNumber, t } = await getServerI18n()

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("analytics.creative.topExports")}
      </p>
      {input.rows.length === 0 ? (
        <div className="mt-4 rounded-[1rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
          {t("analytics.creative.empty")}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {input.rows.map((row) => (
            <div
              key={`${row.canonicalExportId ?? row.exportId ?? row.projectId}:${row.channel}`}
              className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">
                    {input.projectsById.get(row.projectId)?.name ?? t("common.words.unknownProject")}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">{row.label}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {row.aspectRatio ?? "n/a"} · {row.channel}
                  </p>
                </div>
                <div className="text-sm text-slate-300">
                  <p className="theme-text-end">
                    {formatCurrency(row.conversionValueUsd, "USD")}
                  </p>
                  <p className="theme-text-end text-xs text-slate-500">
                    {t("analytics.creative.recordCount", {
                      count: row.recordCount
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export async function CreativePerformanceBreakdown({
  projectsById,
  summary
}: CreativePerformanceBreakdownProps) {
  const { t } = await getServerI18n()

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <TopExportsTable projectsById={projectsById} rows={summary.topExports} />
      <BreakdownTable
        title={t("analytics.creative.byHook")}
        rows={summary.byHook}
      />
      <BreakdownTable
        title={t("analytics.creative.byCallToAction")}
        rows={summary.byCallToAction}
      />
      <BreakdownTable
        title={t("analytics.creative.byAspectRatio")}
        rows={summary.byAspectRatio}
      />
    </div>
  )
}
