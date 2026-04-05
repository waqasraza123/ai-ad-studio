import { PlusSquare } from "lucide-react"
import Link from "next/link"
import { RunwayBrandPanel } from "@/components/branding/runway-brand-panel"
import { ProjectList } from "@/features/projects/components/project-list"
import { toProjectCardViewModel } from "@/features/projects/mappers/project-view-model"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { listProjectsByOwner } from "@/server/projects/project-repository"

export default async function DashboardPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return null
  }

  let projectsLoadFailed = false
  let viewModels: ReturnType<typeof toProjectCardViewModel>[] = []

  try {
    const projects = await listProjectsByOwner(user.id)
    viewModels = projects.map(toProjectCardViewModel)
  } catch (error) {
    projectsLoadFailed = true

    console.error("DashboardPage failed to load projects", {
      error,
      ownerId: user.id
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px] xl:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
              Dashboard
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
              Project workspace is now active
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Create projects, save the creative brief, and register source
              assets before sending preview and motion jobs through the current
              Runway-backed provider pipeline.
            </p>

            <div className="mt-5">
              <Link
                href="/dashboard/projects/new"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-5 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
              >
                <PlusSquare className="h-4 w-4" />
                <span>New project</span>
              </Link>
            </div>
          </div>

          <RunwayBrandPanel
            eyebrow="Provider status"
            title="Runway is part of the production path"
            description="The current repo expects a paid Runway API subscription for concept previews and scene-video generation. Review plans or billing at runwayml.com."
          />
        </div>
      </section>

      <ProjectList
        projects={viewModels}
        projectsLoadFailed={projectsLoadFailed}
      />
    </div>
  )
}
