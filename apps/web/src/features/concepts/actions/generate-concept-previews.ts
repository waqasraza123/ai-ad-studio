"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  listConceptsByProjectIdForOwner,
  updateConceptStatusForProject
} from "@/server/concepts/concept-repository"
import { createJob, listJobsByProjectIdForOwner } from "@/server/jobs/job-repository"
import { getProjectByIdForOwner } from "@/server/projects/project-repository"

export async function generateConceptPreviewsAction(projectId: string) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const [project, concepts, jobs] = await Promise.all([
    getProjectByIdForOwner(projectId, user.id),
    listConceptsByProjectIdForOwner(projectId, user.id),
    listJobsByProjectIdForOwner(projectId, user.id)
  ])

  if (!project) {
    throw new Error("Project not found")
  }

  if (concepts.length === 0) {
    throw new Error("Generate concepts before creating previews")
  }

  const activePreviewJob = jobs.find(
    (job) =>
      job.type === "generate_concept_preview" &&
      (job.status === "queued" || job.status === "running")
  )

  if (activePreviewJob) {
    revalidatePath(`/dashboard/projects/${projectId}`)
    return
  }

  await updateConceptStatusForProject({
    ownerId: user.id,
    projectId,
    status: "preview_generating"
  })

  await createJob({
    ownerId: user.id,
    payload: {
      initiatedBy: "web",
      stage: "concept_preview_generation"
    },
    projectId,
    type: "generate_concept_preview"
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
}
