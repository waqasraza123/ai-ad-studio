import Link from "next/link"
import { ArrowRight, Lightbulb, Sparkles, WandSparkles } from "lucide-react"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getServerI18n } from "@/lib/i18n/server"
import type {
  ConceptsDashboardProjectViewModel,
  ConceptsDashboardSummaryViewModel,
} from "@/features/concepts/mappers/concepts-dashboard-view-model"

type ConceptsDashboardProps = {
  projects: ConceptsDashboardProjectViewModel[]
  summary: ConceptsDashboardSummaryViewModel
}

async function EmptyProjectsState() {
  const { t } = await getServerI18n()

  return (
    <SurfaceCard className="p-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/[0.05]">
        <Sparkles className="h-6 w-6 text-amber-200" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-white">
        {t("concepts.dashboard.emptyTitle")}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
        {t("concepts.dashboard.emptyDescription")}
      </p>
      <div className="mt-6">
        <Link
          href="/dashboard/projects/new"
          className="inline-flex h-11 items-center justify-center rounded-full border border-amber-400/20 bg-amber-500/10 px-5 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
        >
          {t("dashboard.home.newProject")}
        </Link>
      </div>
    </SurfaceCard>
  )
}

export async function ConceptsDashboard({
  projects,
  summary,
}: ConceptsDashboardProps) {
  const { t } = await getServerI18n()
  const summaryCards: Array<{
    key: keyof ConceptsDashboardSummaryViewModel
    label: string
  }> = [
    {
      key: "totalProjects",
      label: t("concepts.dashboard.summary.projectsInScope"),
    },
    {
      key: "projectsWithConcepts",
      label: t("concepts.dashboard.summary.projectsWithConcepts"),
    },
    {
      key: "projectsWithPreviews",
      label: t("concepts.dashboard.summary.projectsWithPreviews"),
    },
    {
      key: "selectedConceptProjects",
      label: t("concepts.dashboard.summary.projectsWithSelection"),
    },
  ]

  if (projects.length === 0) {
    return <EmptyProjectsState />
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
              {t("concepts.dashboard.eyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
              {t("concepts.dashboard.title")}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              {t("concepts.dashboard.description")}
            </p>
          </div>

          <Link
            href="/dashboard/projects/new"
            className="inline-flex h-11 items-center justify-center rounded-full border border-amber-400/20 bg-amber-500/10 px-5 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
          >
            {t("dashboard.home.newProject")}
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
                    {t("common.words.project")}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                    {project.projectName}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {t("common.words.updated", { value: project.latestUpdatedAtLabel })}
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
                    <p className="text-sm text-slate-400">{t("concepts.dashboard.eyebrow")}</p>
                    <p className="mt-2 text-xl font-medium text-white">
                      {project.conceptCount}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      {project.conceptGenerationLabel}:{" "}
                      {project.conceptGenerationDescription}
                    </p>
                  </div>

                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm text-slate-400">{t("concepts.panel.previewsEyebrow")}</p>
                    <p className="mt-2 text-xl font-medium text-white">
                      {project.previewCount}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      {project.previewLabel}: {project.previewDescription}
                    </p>
                  </div>

                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4 sm:col-span-2">
                    <p className="text-sm text-slate-400">{t("concepts.dashboard.selectedConcept")}</p>
                    <p className="mt-2 text-base font-medium text-white">
                      {project.selectedConceptTitle ?? t("concepts.dashboard.noSelectedConcept")}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      {project.latestConceptTitle
                        ? t("concepts.dashboard.latestConcept", {
                            value: project.latestConceptTitle
                          })
                        : t("concepts.dashboard.noLatestConcept")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href={project.href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                >
                  <span>{t("concepts.dashboard.openWorkspace")}</span>
                  <ArrowRight className="theme-directional-icon h-4 w-4" />
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
                {t("concepts.dashboard.notGeneratedTitle")}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                {t("concepts.dashboard.notGeneratedDescription")}
              </p>
            </div>
          </div>
        </SurfaceCard>
      ) : null}
    </div>
  )
}
