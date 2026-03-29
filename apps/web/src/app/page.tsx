import { FeatureGrid } from "@/components/marketing/feature-grid"
import { WorkflowStrip } from "@/components/marketing/demo-strip"
import { HeroSection } from "@/components/marketing/hero-section"
import { LandingTopBar } from "@/components/marketing/landing-top-bar"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.12),transparent_28rem),linear-gradient(180deg,#050816_0%,#0b1224_100%)] text-slate-50">
      <LandingTopBar />
      <HeroSection />
      <WorkflowStrip />
      <FeatureGrid />
    </main>
  )
}
