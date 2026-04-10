import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { PublicSectionFrame } from "@/components/layout/page-frame"
import { getServerI18n } from "@/lib/i18n/server"
import type { HomepagePricingPlan } from "./homepage-data"

type PricingSnapshotSectionProps = {
  plans: HomepagePricingPlan[]
}

export async function PricingSnapshotSection({ plans }: PricingSnapshotSectionProps) {
  const { t } = await getServerI18n()

  return (
    <section id="plans" className="py-24">
      <PublicSectionFrame>
        <div className="max-w-2xl">
          <p className="theme-marketing-eyebrow">{t("marketing.pricing.eyebrow")}</p>
          <h2 className="theme-marketing-title mt-4 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
            {t("marketing.pricing.title")}
          </h2>
          <p className="theme-marketing-copy mt-4">
            {t("marketing.pricing.description")}
          </p>
        </div>

        <div className="mt-10 grid gap-4 xl:grid-cols-4">
          {plans.length > 0 ? (
            plans.map((plan) => (
              <SurfaceCard
                key={plan.code}
                className={`theme-marketing-card-lift h-full p-6 ${
                  plan.code === "growth"
                    ? "border-[rgb(var(--primary-rgb)_/_0.28)] bg-[linear-gradient(180deg,rgb(var(--primary-rgb)_/_0.1),transparent_40%),var(--background-elevated)]"
                    : "p-6"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                      {plan.name}
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
                      {plan.priceLabel}
                    </p>
                  </div>
                  {plan.code === "growth" ? (
                    <span className="theme-accent-pill rounded-full border px-3 py-1 text-xs">
                      {t("marketing.pricing.recommended")}
                    </span>
                  ) : null}
                </div>

                <div className="mt-6 space-y-3 text-sm text-[var(--soft-foreground)]">
                  <p>{plan.conceptsLabel}</p>
                  <p>{plan.previewsLabel}</p>
                  <p>{plan.rendersLabel}</p>
                  <p>{plan.exportsLabel}</p>
                  <p>{plan.publishingLabel}</p>
                </div>
              </SurfaceCard>
            ))
          ) : (
            <SurfaceCard className="theme-marketing-card-lift p-6 xl:col-span-4">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                {t("marketing.pricing.unavailableEyebrow")}
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                {t("marketing.pricing.unavailableTitle")}
              </h3>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--soft-foreground)]">
                {t("marketing.pricing.unavailableDescription")}
              </p>
            </SurfaceCard>
          )}
        </div>

        <div className="theme-accent-panel mt-10 flex flex-col gap-4 rounded-[2rem] border p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              {t("marketing.pricing.workflowEyebrow")}
            </p>
            <p className="mt-3 text-lg font-medium text-[var(--foreground)]">
              {t("marketing.pricing.workflowTitle")}
            </p>
          </div>

          <Link href="/dashboard">
            <span className="theme-button-primary inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-medium">
              {t("marketing.pricing.enterDashboard")}
              <ArrowRight className="theme-directional-icon h-4 w-4" />
            </span>
          </Link>
        </div>
      </PublicSectionFrame>
    </section>
  )
}
