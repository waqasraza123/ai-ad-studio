import Link from "next/link"
import { ArrowRight, Lightbulb, Sparkles, WandSparkles } from "lucide-react"
import { SurfaceCard } from "@/components/primitives/surface-card"
import type {
  ConceptsDashboardProjectViewModel,
  ConceptsDashboardSummaryViewModel,
} from "@/features/concepts/mappers/concepts-dashboard-view-model"

type ConceptsDashboardProps = {
  projects: ConceptsDashboardProjectViewModel[]
  summary: ConceptsDashboardSummaryViewModel
}

const summaryCards: Array<{
  key: keyof ConceptsDashboardSummaryViewModel
  label: string
}> = [
  {
    key: "totalProjects",
    label: "Projects in scope",
  },
  {
    key: "projectsWithConcepts",
    label: "Projects with concepts",
  },
  {
    key: "projectsWithPreviews",
    label: "Projects with previews",
  },
  {
    key: "selectedConceptProjects",
    label: "Projects with selection",
  },
]

function EmptyProjectsState() {
  return (
    <SurfaceCard className="p-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/[0.05]">
        <Sparkles className="h-6 w-6 text-amber-200" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-white">
        No projects yet
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
        Create a project first. Concepts, previews, and selection status will appear
        here once the project workspace starts moving.
      </p>
      <div className="mt-6">
        <Link
          href="/dashboard/projects/new"
          className="inline-flex h-11 items-center justify-center rounded-full border border-amber-400/20 bg-amber-500/10 px-5 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
        >
          New project
        </Link>
      </div>
    </SurfaceCard>
  )
}

export function ConceptsDashboard({
  projects,
  summary,
}: ConceptsDashboardProps) {
  if (projects.length === 0) {
    return <EmptyProjectsState />
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
              Concepts
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
              Cross-project concept queue
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              Use this page to see which projects have drafted concepts, generated
              previews, and a selected direction. Open a project workspace to run
              concept jobs or change the selected concept.
            </p>
          </div>

          <Link
            href="/dashboard/projects/new"
            className="inline-flex h-11 items-center justify-center rounded-full border border-amber-400/20 bg-amber-500/10 px-5 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
          >
            New project
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.key}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4"
            >
              <p className="text-sm text-slate-400">{card.label}</p>
              <p className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">
                {summary[card.key]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {projects.map((project) => (
          <SurfaceCard key={project.projectId} className="overflow-hidden p-6">
            <div className="flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Project
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                    {project.projectName}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Updated {project.latestUpdatedAtLabel}
                  </p>
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                  {project.projectStatus}
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-[120px_minmax(0,1fr)]">
                <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.18),transparent_12rem),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.94))]">
                  {project.featuredPreviewDataUrl ? (
                    <img
                      src={project.featuredPreviewDataUrl}
                      alt={`${project.projectName} concept preview`}
                      className="h-full min-h-[120px] w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full min-h-[120px] items-center justify-center">
                      <Lightbulb className="h-8 w-8 text-amber-200" />
                    </div>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm text-slate-400">Concepts</p>
                    <p className="mt-2 text-xl font-medium text-white">
                      {project.conceptCount}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      {project.conceptGenerationLabel}:{" "}
                      {project.conceptGenerationDescription}
                    </p>
                  </div>

                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm text-slate-400">Previews</p>
                    <p className="mt-2 text-xl font-medium text-white">
                      {project.previewCount}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      {project.previewLabel}: {project.previewDescription}
                    </p>
                  </div>

                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4 sm:col-span-2">
                    <p className="text-sm text-slate-400">Selected concept</p>
                    <p className="mt-2 text-base font-medium text-white">
                      {project.selectedConceptTitle ?? "No concept selected yet"}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      Latest concept: {project.latestConceptTitle ?? "No concepts generated yet"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href={project.href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                >
                  <span>Open project workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </SurfaceCard>
        ))}
      </section>

      {summary.totalConcepts === 0 ? (
        <SurfaceCard className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
              <WandSparkles className="h-5 w-5 text-amber-200" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Concepts have not been generated yet
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                The current repo keeps concept generation in the project detail page.
                Open a workspace, save the brief, and trigger concept generation there.
              </p>
            </div>
          </div>
        </SurfaceCard>
      ) : null}
    </div>
  )
}
