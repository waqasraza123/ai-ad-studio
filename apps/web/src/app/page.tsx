import { FeatureGrid } from "@/components/marketing/feature-grid"
import { WorkflowStrip } from "@/components/marketing/demo-strip"
import { HeroSection } from "@/components/marketing/hero-section"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_24rem),linear-gradient(180deg,#050816_0%,#0f172a_100%)] text-slate-50">
      <HeroSection />
      <WorkflowStrip />
      <FeatureGrid />
    </main>
  )
}
