import { PageIntro } from "@/components/layout/page-frame"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { ExportsDashboard } from "@/features/exports/components/exports-dashboard"
import { getServerI18n } from "@/lib/i18n/server"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { listAllExportsByOwner } from "@/server/exports/export-repository"
import { listProjectsByOwner } from "@/server/projects/project-repository"

export default async function ExportsPage() {
  const { t } = await getServerI18n()
  const user = await getAuthenticatedUser()

  if (!user) {
    return null
  }

  const [exports, projects] = await Promise.all([
    listAllExportsByOwner(user.id),
    listProjectsByOwner(user.id)
  ])

  const projectsById = new Map(projects.map((project) => [project.id, project]))

  return (
    <div className="space-y-6">
      <SurfaceCard className="p-6">
        <PageIntro
          eyebrow={t("exports.dashboard.eyebrow")}
          title={t("exports.page.title")}
          description={t("exports.page.description")}
        />
      </SurfaceCard>

      <ExportsDashboard exports={exports} projectsById={projectsById} />
    </div>
  )
}
