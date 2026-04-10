import type { DeliveryDashboardSummary } from "@/features/delivery/lib/delivery-workspace-overview"
import { getServerI18n } from "@/lib/i18n/server"

type DeliveryDashboardSummaryPanelProps = {
  summary: DeliveryDashboardSummary
}

export async function DeliveryDashboardSummaryPanel({
  summary
}: DeliveryDashboardSummaryPanelProps) {
  const { t } = await getServerI18n()

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            {t("delivery.dashboardSummary.eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
            {t("delivery.dashboardSummary.title")}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            {t("delivery.dashboardSummary.description", {
              count: summary.totalWorkspaces
            })}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-100">
            {t("delivery.dashboardSummary.activeWorkspaces")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {summary.activeWorkspaces}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-indigo-400/20 bg-indigo-500/10 p-4">
          <p className="text-sm text-indigo-100">
            {t("delivery.dashboardSummary.acknowledged")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {summary.acknowledgedWorkspaces}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-100">
            {t("delivery.dashboardSummary.needsFollowUp")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {summary.needsFollowUpWorkspaces}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">
            {t("delivery.dashboardSummary.totalDownloads")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {summary.totalDownloads}
          </p>
        </div>
      </div>
    </section>
  )
}
