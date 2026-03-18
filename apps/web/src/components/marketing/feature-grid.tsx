import { Layers3, ShieldCheck, TimerReset, Wand2 } from "lucide-react"
import { SurfaceCard } from "@/components/primitives/surface-card"

const features = [
  {
    icon: Wand2,
    title: "Constrained creative system",
    description:
      "This is not a generic text-to-video toy. It is a structured workflow built for product ads."
  },
  {
    icon: Layers3,
    title: "Premium frontend experience",
    description:
      "High-end layout, cinematic previews, clear hierarchy, and motion that explains state instead of distracting."
  },
  {
    icon: TimerReset,
    title: "Async-ready product shape",
    description:
      "The frontend is designed around long-running generation states so the UX still feels intentional when jobs take time."
  },
  {
    icon: ShieldCheck,
    title: "Production-minded foundation",
    description:
      "Repo tooling, typed boundaries, and scalable architecture are already in place before auth, DB, or providers land."
  }
]

export function FeatureGrid() {
  return (
    <section className="px-4 pb-24 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Why this product shape works
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
            Designed for structured ad generation
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <SurfaceCard key={feature.title} className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                  <Icon className="h-5 w-5 text-amber-200" />
                </div>
                <h3 className="mt-5 text-xl font-medium text-white">{feature.title}</h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
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
