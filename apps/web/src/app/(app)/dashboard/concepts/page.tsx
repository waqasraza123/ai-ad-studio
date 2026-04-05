import { notFound } from "next/navigation"
import { ConceptsDashboard } from "@/features/concepts/components/concepts-dashboard"
import {
  summarizeConceptsDashboard,
  toConceptsDashboardProjectViewModel,
} from "@/features/concepts/mappers/concepts-dashboard-view-model"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { listConceptsByProjectIdForOwner } from "@/server/concepts/concept-repository"
import { listJobsByProjectIdForOwner } from "@/server/jobs/job-repository"
import { listConceptPreviewAssetsByProjectIdForOwner } from "@/server/projects/asset-repository"
import { listProjectsByOwner } from "@/server/projects/project-repository"

export default async function DashboardConceptsPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    notFound()
  }

  const projects = await listProjectsByOwner(user.id)

  const projectCards = await Promise.all(
    projects.map(async (project) => {
      const [concepts, jobs, previewAssets] = await Promise.all([
        listConceptsByProjectIdForOwner(project.id, user.id),
        listJobsByProjectIdForOwner(project.id, user.id),
        listConceptPreviewAssetsByProjectIdForOwner(project.id, user.id),
      ])

      return toConceptsDashboardProjectViewModel({
        concepts,
        jobs,
        previewAssets,
        project,
      })
    })
  )

  const summary = summarizeConceptsDashboard(projectCards)

  return <ConceptsDashboard projects={projectCards} summary={summary} />
}
