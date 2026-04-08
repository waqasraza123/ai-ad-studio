import {
  BadgeCheck,
  PackageCheck,
  Presentation,
  Sparkles,
  UploadCloud
} from "lucide-react"
import { SurfaceCard } from "@/components/primitives/surface-card"

const features = [
  {
    icon: Sparkles,
    title: "Constrained ad workflow",
    description:
      "The product is opinionated on purpose. Teams move through brief, concepts, previews, render, and promotion instead of editing from scratch."
  },
  {
    icon: Presentation,
    title: "Review before final render spend",
    description:
      "The system exposes preview checkpoints first so stakeholders can compare viable directions before committing time and budget."
  },
  {
    icon: BadgeCheck,
    title: "Winner promotion to public surfaces",
    description:
      "Approved exports can graduate into public showcase and campaign surfaces without rebuilding presentation context somewhere else."
  },
  {
    icon: PackageCheck,
    title: "Delivery and handoff readiness",
    description:
      "Finalized outputs support delivery workflows, client handoff, and shareable proof layers after the winner is locked."
  },
  {
    icon: UploadCloud,
    title: "Built for product marketing inputs",
    description:
      "The workflow assumes real product assets, offers, CTAs, and template-driven styling rather than unrestricted creative exploration."
  },
  {
    icon: Sparkles,
    title: "Designed for professional teams",
    description:
      "The public site, dashboard, and publish surfaces all reinforce one product story: consistent ad output with cleaner operational control."
  }
]

export function FeatureGrid() {
  return (
    <section className="px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="theme-marketing-eyebrow">Why it works</p>
          <h2 className="theme-marketing-title mt-4 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
            Structured output, clearer reviews, better publish readiness
          </h2>
          <p className="theme-marketing-copy mt-4">
            Every section of the product is aligned around campaign teams that
            need fast output without collapsing into a loose creative sandbox.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <SurfaceCard
                key={feature.title}
                className="theme-marketing-card-lift h-full p-6"
              >
                <div className="theme-icon-chip flex h-12 w-12 items-center justify-center rounded-2xl border">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-medium text-[var(--foreground)]">
                  {feature.title}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
                  {feature.description}
                </p>
              </SurfaceCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
