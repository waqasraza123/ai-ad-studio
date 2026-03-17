"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getConceptByIdForOwner } from "@/server/concepts/concept-repository"
import { createJob, listJobsByProjectIdForOwner } from "@/server/jobs/job-repository"
import {
  getProjectByIdForOwner,
  updateProjectStatus
} from "@/server/projects/project-repository"

export async function renderProjectAction(projectId: string) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const [project, jobs] = await Promise.all([
    getProjectByIdForOwner(projectId, user.id),
    listJobsByProjectIdForOwner(projectId, user.id)
  ])

  if (!project) {
    throw new Error("Project not found")
  }

  if (!project.selected_concept_id) {
    throw new Error("Select a concept before rendering")
  }

  const selectedConcept = await getConceptByIdForOwner(project.selected_concept_id, user.id)

  if (!selectedConcept) {
    throw new Error("Selected concept not found")
  }

  const activeRenderJob = jobs.find(
    (job) =>
      job.type === "render_final_ad" &&
      (job.status === "queued" || job.status === "running")
  )

  if (activeRenderJob) {
    revalidatePath(`/dashboard/projects/${projectId}`)
    return
  }

  await createJob({
    ownerId: user.id,
    payload: {
      conceptId: selectedConcept.id,
      initiatedBy: "web",
      stage: "final_render"
    },
    projectId,
    type: "render_final_ad"
  })

  await updateProjectStatus({
    ownerId: user.id,
    projectId,
    status: "rendering"
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath("/dashboard")
}
