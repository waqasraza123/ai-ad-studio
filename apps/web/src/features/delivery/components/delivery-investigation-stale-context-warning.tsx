import Link from "next/link"
import type { DeliveryInvestigationStaleContextSummary } from "@/features/delivery/lib/delivery-investigation-stale-context"
import {
  buildDeliveryInvestigationBaseHref,
  buildDeliveryInvestigationFocuslessHref,
  type DeliveryInvestigationViewState
} from "@/features/delivery/lib/delivery-investigation-view"
import { getServerI18n } from "@/lib/i18n/server"

type DeliveryInvestigationStaleContextWarningProps = {
  state: DeliveryInvestigationViewState
  summary: DeliveryInvestigationStaleContextSummary
}

export async function DeliveryInvestigationStaleContextWarning({
  state,
  summary
}: DeliveryInvestigationStaleContextWarningProps) {
  const { t } = await getServerI18n()

  return (
    <section className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/[0.08] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-amber-200">
            {t("delivery.investigationStale.eyebrow")}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {summary.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-amber-50/90">
            {summary.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200 transition hover:border-cyan-300/40 hover:bg-cyan-500/15"
            href={buildDeliveryInvestigationFocuslessHref(state)}
          >
            {t("delivery.investigationStale.keepFilters")}
          </Link>

          <Link
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06]"
            href={buildDeliveryInvestigationBaseHref(state)}
          >
            {t("delivery.investigationStale.reset")}
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {summary.badges.map((badge) => (
          <span
            key={badge}
            className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200"
          >
            {badge}
          </span>
        ))}
      </div>
    </section>
  )
}
