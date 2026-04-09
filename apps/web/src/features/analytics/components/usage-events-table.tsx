import { getServerI18n } from "@/lib/i18n/server"
import type { UsageEventRecord } from "@/server/database/types"

type UsageEventsTableProps = {
  usageEvents: UsageEventRecord[]
}

export async function UsageEventsTable({ usageEvents }: UsageEventsTableProps) {
  const { formatCurrency, formatDateTime, formatNumber, t } = await getServerI18n()

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("analytics.usageLedger")}
      </p>

      <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10">
        <table className="theme-text-start w-full text-sm">
          <thead className="bg-white/[0.04] text-slate-300">
            <tr>
              <th className="px-4 py-3 font-medium">{t("common.words.when")}</th>
              <th className="px-4 py-3 font-medium">{t("common.words.provider")}</th>
              <th className="px-4 py-3 font-medium">{t("common.words.event")}</th>
              <th className="px-4 py-3 font-medium">{t("common.words.units")}</th>
              <th className="theme-text-end px-4 py-3 font-medium">{t("common.words.estimatedCost")}</th>
            </tr>
          </thead>
          <tbody>
            {usageEvents.map((event) => (
              <tr key={event.id} className="border-t border-white/10 text-slate-200">
                <td className="px-4 py-3">
                  {formatDateTime(event.created_at, {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })}
                </td>
                <td className="px-4 py-3">{event.provider}</td>
                <td className="px-4 py-3">{event.event_type}</td>
                <td className="px-4 py-3">
                  {formatNumber(Number(event.units), {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  })}
                </td>
                <td className="theme-text-end px-4 py-3">
                  {formatCurrency(Number(event.estimated_cost_usd), "USD", {
                    maximumFractionDigits: 4,
                    minimumFractionDigits: 4
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
