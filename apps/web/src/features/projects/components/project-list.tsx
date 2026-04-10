import Link from "next/link"
import { ArrowRight, FolderOpen, TriangleAlert } from "lucide-react"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getServerI18n } from "@/lib/i18n/server"

type ProjectCardViewModel = {
  createdAtLabel: string
  href: string
  id: string
  name: string
  status: string
}

type ProjectListProps = {
  projects: ProjectCardViewModel[]
  projectsLoadFailed?: boolean
}

export async function ProjectList({
  projects,
  projectsLoadFailed = false
}: ProjectListProps) {
  const { t } = await getServerI18n()

  if (projectsLoadFailed) {
    return (
      <SurfaceCard className="p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10">
          <TriangleAlert className="h-6 w-6 text-amber-200" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-white">
          {t("projects.list.unavailableTitle")}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
          {t("projects.list.unavailableDescription")}
        </p>
        <div className="mt-8">
          <Link
            href="/dashboard/projects/new"
            className="inline-flex h-11 items-center justify-center rounded-full border border-amber-400/20 bg-amber-500/10 px-5 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
          >
            {t("projects.list.createNew")}
          </Link>
        </div>
      </SurfaceCard>
    )
  }

  if (projects.length === 0) {
    return (
      <SurfaceCard className="p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/[0.05]">
          <FolderOpen className="h-6 w-6 text-amber-200" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-white">
          {t("projects.list.emptyTitle")}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
          {t("projects.list.emptyDescription")}
        </p>
        <div className="mt-8">
          <Link
            href="/dashboard/projects/new"
            className="inline-flex h-11 items-center justify-center rounded-full border border-amber-400/20 bg-amber-500/10 px-5 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
          >
            {t("projects.list.createFirst")}
          </Link>
        </div>
      </SurfaceCard>
    )
  }

  return (
    <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-4">
      {projects.map((project) => (
        <Link key={project.id} href={project.href}>
          <SurfaceCard className="h-full p-6 transition hover:border-white/20 hover:bg-white/[0.06]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">{project.name}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {t("common.words.created", { value: project.createdAtLabel })}
                </p>
              </div>

              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                {project.status}
              </span>
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm text-amber-200">
              <span>{t("projects.list.openProject")}</span>
              <ArrowRight className="theme-directional-icon h-4 w-4" />
            </div>
          </SurfaceCard>
        </Link>
      ))}
    </div>
  )
}
