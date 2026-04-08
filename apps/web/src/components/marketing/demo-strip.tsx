import {
  Clapperboard,
  LayoutTemplate,
  ScanSearch,
  WandSparkles
} from "lucide-react"
import { SurfaceCard } from "@/components/primitives/surface-card"

const workflowSteps = [
  {
    icon: ScanSearch,
    title: "Frame the campaign brief",
    description:
      "Bring product inputs, offer, CTA, and visual direction into one controlled ad brief."
  },
  {
    icon: WandSparkles,
    title: "Generate viable directions",
    description:
      "Produce constrained concepts with hooks, scripts, and visual direction instead of open-ended creative drift."
  },
  {
    icon: LayoutTemplate,
    title: "Review before you spend",
    description:
      "Screen polished previews first so teams can pick a winner before final rendering."
  },
  {
    icon: Clapperboard,
    title: "Publish and hand off",
    description:
      "Promote the winning export into campaign, showcase, and delivery surfaces with less manual cleanup."
  }
]

export function WorkflowStrip() {
  return (
    <section id="workflow" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:items-start">
          <div className="max-w-md">
            <p className="theme-marketing-eyebrow">Workflow</p>
            <h2 className="theme-marketing-title mt-4 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
              A professional path from brief to approved output
            </h2>
            <p className="theme-marketing-copy mt-4">
              The homepage should make the product shape obvious: this is a
              constrained ad-generation system for marketing teams, not a
              general-purpose editing canvas.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflowSteps.map((step) => {
              const Icon = step.icon

              return (
                <SurfaceCard
                  key={step.title}
                  className="theme-marketing-card-lift relative overflow-hidden p-6"
                >
                  <div className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(var(--primary-rgb)_/_0.35),transparent)]" />
                  <div className="theme-icon-chip flex h-12 w-12 items-center justify-center rounded-2xl border">
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
      </div>
    </section>
  )
}
