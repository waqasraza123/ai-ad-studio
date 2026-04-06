import { FeatureGrid } from "@/components/marketing/feature-grid"
import { WorkflowStrip } from "@/components/marketing/demo-strip"
import { HeroSection } from "@/components/marketing/hero-section"
import { LandingTopBar } from "@/components/marketing/landing-top-bar"
import { RuntimeSetupLauncher } from "@/components/runtime/runtime-setup-launcher"

export default function HomePage() {
  return (
    <main className="theme-page-shell min-h-screen text-[var(--foreground)]">
      <RuntimeSetupLauncher context="homepage" autoOpenOnFirstVisit showTrigger={false} />
      <LandingTopBar />
      <HeroSection />
      <WorkflowStrip />
      <FeatureGrid />
    </main>
  )
}
