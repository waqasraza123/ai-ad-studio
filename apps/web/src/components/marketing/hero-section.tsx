import Link from "next/link"
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react"
import { Button } from "@/components/primitives/button"
import { HeroPreview } from "./hero-preview"

type HeroSectionProps = {
  featuredSampleCount: number
}

const outcomePills = [
  "Constrained ad workflow",
  "Review before final render",
  "Ready for publish and delivery"
]

export function HeroSection({ featuredSampleCount }: HeroSectionProps) {
  return (
    <section className="theme-marketing-subtle-grid relative overflow-hidden px-4 pb-24 pt-12 sm:px-6 lg:px-8 lg:pb-32 lg:pt-16">
      <div className="mx-auto max-w-7xl relative">
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="theme-accent-pill inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4" />
              <span>
                Public product workflow
                {featuredSampleCount > 0
                  ? ` • ${featuredSampleCount} live samples highlighted`
                  : ""}
              </span>
            </div>

            <h1 className="theme-marketing-title mt-8 text-5xl font-semibold text-[var(--foreground)] sm:text-6xl lg:text-[4.8rem]">
              Turn product inputs into campaign-ready ad outputs with a
              controlled studio workflow
            </h1>

            <p className="theme-marketing-copy mt-6 max-w-2xl text-[1.06rem]">
              AI Ad Studio helps marketing teams move from brief and product
              assets to concepts, previews, final exports, and public handoff
              surfaces without drifting into an open-ended editor.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              {outcomePills.map((item) => (
                <span
                  key={item}
                  className="theme-soft-panel theme-marketing-card-lift inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-[var(--soft-foreground)]"
                >
                  <CheckCircle2 className="h-4 w-4 text-[rgb(var(--accent-rgb))]" />
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard">
                <Button size="lg">
                  Enter dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link
                href="/showcase"
                className="theme-inline-secondary-button inline-flex h-12 items-center justify-center rounded-full border px-6 text-sm font-medium"
              >
                Browse showcase
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <div className="theme-soft-panel theme-marketing-card-lift rounded-[1.5rem] border p-5">
                <p className="theme-marketing-eyebrow">Briefs</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                  Structured
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  Inputs stay constrained to product marketing work.
                </p>
              </div>
              <div className="theme-soft-panel theme-marketing-card-lift rounded-[1.5rem] border p-5">
                <p className="theme-marketing-eyebrow">Reviews</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                  Before spend
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  Preview concepts first, then commit to final render output.
                </p>
              </div>
              <div className="theme-soft-panel theme-marketing-card-lift rounded-[1.5rem] border p-5">
                <p className="theme-marketing-eyebrow">Delivery</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                  Ready
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  Promote winners to showcase, campaigns, and delivery surfaces.
                </p>
              </div>
            </div>
          </div>

          <HeroPreview />
        </div>
      </div>
    </section>
  )
}
