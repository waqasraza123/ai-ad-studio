import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SurfaceCard } from "@/components/primitives/surface-card"
import type { HomepagePricingPlan } from "./homepage-data"

type PricingSnapshotSectionProps = {
  plans: HomepagePricingPlan[]
}

export function PricingSnapshotSection({ plans }: PricingSnapshotSectionProps) {
  return (
    <section id="plans" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="theme-marketing-eyebrow">Plans</p>
          <h2 className="theme-marketing-title mt-4 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
            A concise pricing snapshot built from live plan data
          </h2>
          <p className="theme-marketing-copy mt-4">
            The homepage should help teams understand value shape quickly
            without collapsing into a full billing settings experience.
          </p>
        </div>

        <div className="mt-10 grid gap-4 xl:grid-cols-4">
          {plans.map((plan) => (
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
                    Recommended
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
          ))}
        </div>

        <div className="theme-accent-panel mt-10 flex flex-col gap-4 rounded-[2rem] border p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              Start from the workflow
            </p>
            <p className="mt-3 text-lg font-medium text-[var(--foreground)]">
              Pricing should support the product story, not replace it.
            </p>
          </div>

          <Link href="/dashboard">
            <span className="theme-button-primary inline-flex h-12 items-center justify-center rounded-full border px-6 text-sm font-medium">
              Enter dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
