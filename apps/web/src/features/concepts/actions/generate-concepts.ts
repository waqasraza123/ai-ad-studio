"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { createJob, listJobsByProjectIdForOwner } from "@/server/jobs/job-repository"
import { getProjectInputByProjectIdForOwner } from "@/server/projects/project-input-repository"
import {
  getProjectByIdForOwner,
  updateProjectStatus
} from "@/server/projects/project-repository"

export async function generateConceptsAction(projectId: string) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const [project, projectInput, jobs] = await Promise.all([
    getProjectByIdForOwner(projectId, user.id),
    getProjectInputByProjectIdForOwner(projectId, user.id),
    listJobsByProjectIdForOwner(projectId, user.id)
  ])

  if (!project) {
    throw new Error("Project not found")
  }

  if (!projectInput) {
    throw new Error("Save the project brief before generating concepts")
  }

  const activeJob = jobs.find(
    (job) =>
      job.type === "generate_concepts" &&
      (job.status === "queued" || job.status === "running")
  )

  if (activeJob) {
    revalidatePath(`/dashboard/projects/${projectId}`)
    return
  }

  await createJob({
    ownerId: user.id,
    payload: {
      initiatedBy: "web",
      stage: "concept_generation"
    },
    projectId,
    type: "generate_concepts"
  })

  await updateProjectStatus({
    ownerId: user.id,
    projectId,
    status: "generating_concepts"
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath("/dashboard")
}
