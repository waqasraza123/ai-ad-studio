import type { Metadata } from "next"
import { FaqCtaSection } from "@/components/marketing/faq-cta-section"
import { FeatureGrid } from "@/components/marketing/feature-grid"
import { FeaturedShowcaseSection } from "@/components/marketing/featured-showcase-section"
import { HeroSection } from "@/components/marketing/hero-section"
import { mapHomepageFeaturedShowcaseItems } from "@/components/marketing/homepage-data"
import { LandingTopBar } from "@/components/marketing/landing-top-bar"
import { StarterStackSection } from "@/components/marketing/starter-stack-section"
import { WorkflowStrip } from "@/components/marketing/demo-strip"
import { listPublishedShowcaseItems } from "@/server/showcase/showcase-repository"
import { getServerI18n } from "@/lib/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n()

  return {
    description: t("marketing.meta.description"),
    title: t("marketing.meta.title")
  }
}

export default async function HomePage() {
  const showcaseItems = await listPublishedShowcaseItems()
  const featuredShowcaseItems = mapHomepageFeaturedShowcaseItems(showcaseItems)

  return (
    <main className="theme-page-shell min-h-screen text-[var(--foreground)]">
      <LandingTopBar />
      <HeroSection featuredSampleCount={featuredShowcaseItems.length} />
      <FeatureGrid />
      <WorkflowStrip />
      <FeaturedShowcaseSection items={featuredShowcaseItems} />
      <StarterStackSection />
      <FaqCtaSection />
    </main>
  )
}
