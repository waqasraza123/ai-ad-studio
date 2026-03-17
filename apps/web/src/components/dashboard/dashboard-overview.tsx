import { ArrowUpRight, Clock3, Film, Sparkles } from "lucide-react"
import { SurfaceCard } from "@/components/primitives/surface-card"

const projectStats = [
  {
    label: "Active projects",
    value: "04",
    delta: "+2 this week"
  },
  {
    label: "Concepts generated",
    value: "12",
    delta: "Across all projects"
  },
  {
    label: "Ready exports",
    value: "03",
    delta: "Final MP4 outputs"
  }
]

const recentProjects = [
  {
    name: "Luxe bottle launch",
    status: "Concepts ready",
    detail: "3 concepts, 1 selected"
  },
  {
    name: "Skincare promo drop",
    status: "Rendering",
    detail: "Final export in progress"
  },
  {
    name: "Fitness app creative",
    status: "Draft",
    detail: "Waiting for brand inputs"
  }
]

const timeline = [
  {
    label: "Brief normalized",
    icon: Sparkles
  },
  {
    label: "Concept previews ready",
    icon: Clock3
  },
  {
    label: "Final export pipeline",
    icon: Film
  }
]

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <SurfaceCard className="overflow-hidden p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                Studio overview
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
                Premium ad generation workflow
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                This shell is designed to become the main workspace for project
                setup, concept review, rendering, and export management.
              </p>
            </div>

            <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 md:flex md:items-center md:gap-2">
              <ArrowUpRight className="h-4 w-4 text-indigo-200" />
              Portfolio-ready UI
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {projectStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4"
              >
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-indigo-200">{stat.delta}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Pipeline pulse
          </p>
          <div className="mt-5 space-y-4">
            {timeline.map((item, index) => {
              const Icon = item.icon

              return (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-400/10">
                    <Icon className="h-4 w-4 text-indigo-200" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-sm text-slate-400">Stage {index + 1}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <SurfaceCard className="p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Recent projects
          </p>
          <div className="mt-5 space-y-3">
            {recentProjects.map((project) => (
              <div
                key={project.name}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{project.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{project.detail}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Showcase panel
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.18),transparent_16rem),linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,0.94))] p-4">
              <div className="aspect-[16/10] rounded-[1.25rem] border border-white/10 bg-white/[0.04]" />
              <div className="mt-4">
                <p className="text-sm font-medium text-white">
                  Final export area
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  This block will later hold the video player, metadata, and download actions.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-medium text-white">Concept review</p>
                <p className="mt-2 text-sm text-slate-400">
                  Shared-element transitions and immersive concept detail are next.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-medium text-white">Render theater</p>
                <p className="mt-2 text-sm text-slate-400">
                  Progress states will become a premium waiting experience instead of a spinner.
                </p>
              </div>
            </div>
          </div>
        </SurfaceCard>
      </section>
    </div>
  )
}
