import { JobDebugList } from "@/features/debug/components/job-debug-list"
import { getServerI18n } from "@/lib/i18n/server"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { listAllJobsByOwner } from "@/server/debug/job-debug-repository"
import { listProjectsByOwner } from "@/server/projects/project-repository"

export default async function DebugJobsPage() {
  const { t } = await getServerI18n()
  const user = await getAuthenticatedUser()

  if (!user) {
    return null
  }

  const [jobs, projects] = await Promise.all([
    listAllJobsByOwner(user.id),
    listProjectsByOwner(user.id)
  ])

  const projectsById = new Map(projects.map((project) => [project.id, project]))

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          {t("debug.jobs.eyebrow")}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
          {t("debug.jobs.title")}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          {t("debug.jobs.description")}
        </p>
      </section>

      <JobDebugList jobs={jobs} projectsById={projectsById} />
    </div>
  )
}
