import { PlusSquare } from "lucide-react"
import Link from "next/link"
import { ProjectList } from "@/features/projects/components/project-list"
import { toProjectCardViewModel } from "@/features/projects/mappers/project-view-model"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { listProjectsByOwner } from "@/server/projects/project-repository"

export default async function DashboardPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return null
  }

  const projects = await listProjectsByOwner(user.id)
  const viewModels = projects.map(toProjectCardViewModel)

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
              Dashboard
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
              Real project workspace is now active
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Create projects, save the creative brief, and register source assets
              before concept generation is connected in the next phase.
            </p>
          </div>

          <Link
            href="/dashboard/projects/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-5 text-sm font-medium text-indigo-100 transition hover:bg-indigo-500/20"
          >
            <PlusSquare className="h-4 w-4" />
            <span>New project</span>
          </Link>
        </div>
      </section>

      <ProjectList projects={viewModels} />
    </div>
  )
}
