import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getServerI18n } from "@/lib/i18n/server"
import { formatStorage } from "@/server/billing/billing-service"
import type { BillingPurchaseAvailability } from "@/server/billing/purchase-availability"
import type {
  BrandKitRecord,
  EffectiveOwnerLimits,
  OwnerGuardrailsRecord
} from "@/server/database/types"

type SettingsOverviewGridProps = {
  brandKit: BrandKitRecord | null
  guardrails: OwnerGuardrailsRecord
  limits: EffectiveOwnerLimits
  purchaseAvailability: BillingPurchaseAvailability
}

function formatMonthlyPrice(value: number) {
  return value === 0 ? "$0/mo" : `$${value.toFixed(2)}/mo`
}

export async function SettingsOverviewGrid({
  brandKit,
  guardrails,
  limits,
  purchaseAvailability
}: SettingsOverviewGridProps) {
  const { formatCurrency, formatDate, t } = await getServerI18n()
  const billingActionsReady = limits.subscription.stripe_subscription_id
    ? purchaseAvailability.planChangeAvailable &&
      purchaseAvailability.portalAvailable
    : purchaseAvailability.checkoutAvailable

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <SurfaceCard className="flex h-full flex-col p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          {t("settings.nav.billing")}
        </p>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
              {limits.plan.display_name}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              {t("settings.overview.billing.description")}
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
            {billingActionsReady
              ? t("settings.overview.billing.statusReady")
              : t("settings.overview.billing.statusLimited")}
          </span>
        </div>

        <div className="mt-6 space-y-3 text-sm text-slate-300">
          <p>
            {t("settings.overview.billing.monthlyPrice")}:{" "}
            <span className="font-medium text-white">
              {formatMonthlyPrice(limits.plan.monthly_price_usd)}
            </span>
          </p>
          <p>
            {t("settings.overview.billing.currentPeriodEnd", {
              value: formatDate(limits.subscription.current_period_end)
            })}
          </p>
          <p>
            {t("settings.overview.billing.storageCap", {
              value: formatStorage(limits.hardCaps.storageBytes)
            })}
          </p>
        </div>

        <Link
          href="/dashboard/settings/billing"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-amber-200 transition hover:text-amber-100"
        >
          <span>{t("settings.overview.billing.openAction")}</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </SurfaceCard>

      <SurfaceCard className="flex h-full flex-col p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          {t("settings.nav.guardrails")}
        </p>
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">
          {t("settings.overview.guardrails.title")}
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-400">
          {t("settings.overview.guardrails.description")}
        </p>

        <div className="mt-6 space-y-3 text-sm text-slate-300">
          <p>
            {t("settings.overview.guardrails.totalBudget")}:{" "}
            <span className="font-medium text-white">
              {formatCurrency(guardrails.monthly_total_budget_usd)}
            </span>
          </p>
          <p>
            {t("settings.overview.guardrails.providerBudgets", {
              openai: formatCurrency(guardrails.monthly_openai_budget_usd),
              runway: formatCurrency(guardrails.monthly_runway_budget_usd)
            })}
          </p>
          <p>
            {t("settings.overview.guardrails.concurrency", {
              preview: guardrails.max_concurrent_preview_jobs,
              render: guardrails.max_concurrent_render_jobs
            })}
          </p>
        </div>

        <Link
          href="/dashboard/settings/guardrails"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-amber-200 transition hover:text-amber-100"
        >
          <span>{t("settings.overview.guardrails.openAction")}</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </SurfaceCard>

      <SurfaceCard className="flex h-full flex-col p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          {t("settings.nav.brand")}
        </p>
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">
          {brandKit?.name ?? t("settings.overview.brand.unavailable")}
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-400">
          {t("settings.overview.brand.description")}
        </p>

        {brandKit ? (
          <>
            <div className="mt-6 flex items-center gap-3">
              {[brandKit.palette.primary, brandKit.palette.secondary, brandKit.palette.accent].map((color) => (
                <span
                  key={color}
                  className="h-10 w-10 rounded-2xl border border-white/10"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>
                {t("settings.overview.brand.palette", {
                  value: `${brandKit.palette.primary} · ${brandKit.palette.secondary} · ${brandKit.palette.accent}`
                })}
              </p>
              <p>
                {t("settings.overview.brand.typography", {
                  heading: brandKit.typography.heading_family,
                  body: brandKit.typography.body_family
                })}
              </p>
            </div>
          </>
        ) : (
          <p className="mt-6 text-sm text-slate-400">
            {t("settings.brand.unavailable")}
          </p>
        )}

        <Link
          href="/dashboard/settings/brand"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-amber-200 transition hover:text-amber-100"
        >
          <span>{t("settings.overview.brand.openAction")}</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </SurfaceCard>
    </div>
  )
}
