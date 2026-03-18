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
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
                  <Icon className="h-5 w-5 text-amber-200" />
                </div>
                <h3 className="mt-5 text-lg font-medium text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">
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
