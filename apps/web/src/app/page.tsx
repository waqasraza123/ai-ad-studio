import { FaqCtaSection } from "@/components/marketing/faq-cta-section"
import { FeatureGrid } from "@/components/marketing/feature-grid"
import { FeaturedShowcaseSection } from "@/components/marketing/featured-showcase-section"
import { HeroSection } from "@/components/marketing/hero-section"
import {
  mapHomepageFeaturedShowcaseItems,
  mapHomepagePricingPlans
} from "@/components/marketing/homepage-data"
import { LandingTopBar } from "@/components/marketing/landing-top-bar"
import { PricingSnapshotSection } from "@/components/marketing/pricing-snapshot-section"
import { WorkflowStrip } from "@/components/marketing/demo-strip"
import { isBillingPlanCatalogError } from "@/server/billing/billing-plan-catalog"
import { listBillingPlans } from "@/server/billing/billing-service"
import { listPublishedShowcaseItems } from "@/server/showcase/showcase-repository"
import { getServerI18n } from "@/lib/i18n/server"

function isNextDynamicServerUsageError(error: unknown) {
  return (
    Boolean(
      error &&
        typeof error === "object" &&
        "digest" in error &&
        error.digest === "DYNAMIC_SERVER_USAGE"
    ) ||
    (error instanceof Error && error.message.includes("Dynamic server usage:"))
  )
}

export default async function HomePage() {
  const [billingPlans, showcaseItems] = await Promise.all([
    listBillingPlans().catch((error) => {
      if (isNextDynamicServerUsageError(error)) {
        throw error
      }

      if (isBillingPlanCatalogError(error)) {
        console.error("Homepage billing plan catalog unavailable", {
          code: error.code,
          message: error.message,
          postgresCode: error.postgresCode
        })
      } else {
        console.error("Homepage billing plan catalog unavailable", error)
      }

      return []
    }),
    listPublishedShowcaseItems()
  ])
  const { formatCurrency, t } = await getServerI18n()
  const featuredShowcaseItems = mapHomepageFeaturedShowcaseItems(showcaseItems)
  const homepagePricingPlans = mapHomepagePricingPlans(billingPlans, {
    formatCurrency,
    t
  })

  return (
    <main className="theme-page-shell min-h-screen text-[var(--foreground)]">
      <LandingTopBar />
      <HeroSection featuredSampleCount={featuredShowcaseItems.length} />
      <FeaturedShowcaseSection items={featuredShowcaseItems} />
      <WorkflowStrip />
      <FeatureGrid />
      <PricingSnapshotSection plans={homepagePricingPlans} />
      <FaqCtaSection />
    </main>
  )
}
