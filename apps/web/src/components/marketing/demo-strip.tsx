import { Clapperboard, ImageIcon, LayoutTemplate, Sparkles } from "lucide-react"
import { SurfaceCard } from "@/components/primitives/surface-card"

const workflowSteps = [
  {
    icon: ImageIcon,
    title: "Upload product inputs",
    description:
      "Bring 3 to 8 product images, a logo, offer, CTA, and style direction."
  },
  {
    icon: Sparkles,
    title: "Generate 3 concepts",
    description:
      "Create constrained ad angles with hooks, scripts, and visual directions."
  },
  {
    icon: LayoutTemplate,
    title: "Review premium previews",
    description:
      "See one hero frame per concept before committing budget to the final render."
  },
  {
    icon: Clapperboard,
    title: "Render the final export",
    description:
      "Produce a polished 10-second 9:16 ad with captions and CTA treatment."
  }
]

export function WorkflowStrip() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-4 lg:grid-cols-4">
          {workflowSteps.map((step) => {
            const Icon = step.icon

            return (
              <SurfaceCard key={step.title} className="p-5">
                <div className="theme-icon-chip flex h-11 w-11 items-center justify-center rounded-2xl border">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-medium text-[var(--foreground)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                  {step.description}
                </p>
              </SurfaceCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
