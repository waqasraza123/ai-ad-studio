import Link from "next/link"
import { Settings2 } from "lucide-react"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getServerI18n } from "@/lib/i18n/server"
import { getBillingPlanNameKey } from "@/lib/billing-plan-labels"
import type {
  BrandKitRecord,
  EffectiveOwnerLimits,
  OwnerGuardrailsRecord
} from "@/server/database/types"

type WorkspaceAdministrationPanelProps = {
  brandKit: BrandKitRecord | null
  guardrails: OwnerGuardrailsRecord | null
  limits: EffectiveOwnerLimits | null
  unavailable?: boolean
}

function formatMonthlyPrice(value: number) {
  return value === 0 ? "$0/mo" : `$${value.toFixed(2)}/mo`
}

export async function WorkspaceAdministrationPanel({
  brandKit,
  guardrails,
  limits,
  unavailable = false
}: WorkspaceAdministrationPanelProps) {
  const { formatCurrency, t } = await getServerI18n()

  return (
    <SurfaceCard className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            {t("dashboard.admin.eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
            {t("dashboard.admin.title")}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            {t("dashboard.admin.description")}
          </p>
        </div>

        <Link
          href="/dashboard/settings"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-5 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
        >
          <Settings2 className="h-4 w-4" />
          <span>{t("dashboard.admin.openSettings")}</span>
        </Link>
      </div>

      {unavailable || !limits || !guardrails ? (
        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
          {t("dashboard.admin.unavailable")}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-slate-400">{t("dashboard.admin.planLabel")}</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {t(getBillingPlanNameKey(limits.plan.code))}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {formatMonthlyPrice(limits.plan.monthly_price_usd)}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-slate-400">
              {t("dashboard.admin.guardrailsLabel")}
            </p>
            <p className="mt-2 text-xl font-semibold text-white">
              {formatCurrency(guardrails.monthly_total_budget_usd)}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {t("dashboard.admin.guardrailsSummary", {
                preview: guardrails.max_concurrent_preview_jobs,
                render: guardrails.max_concurrent_render_jobs
              })}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-slate-400">{t("dashboard.admin.brandLabel")}</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {brandKit?.name ?? t("settings.brand.unavailable")}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {brandKit
                ? t("dashboard.admin.brandSummary", {
                    heading: brandKit.typography.heading_family,
                    body: brandKit.typography.body_family
                  })
                : t("dashboard.admin.brandUnavailable")}
            </p>
          </div>
        </div>
      )}
    </SurfaceCard>
  )
}
