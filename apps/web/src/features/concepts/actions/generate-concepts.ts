"use server"

import { revalidatePath } from "next/cache"
import { redirectToLoginWithFormError, redirectWithFormError } from "@/lib/server-action-redirect"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { createJob, listJobsByProjectIdForOwner } from "@/server/jobs/job-repository"
import { getProjectInputByProjectIdForOwner } from "@/server/projects/project-input-repository"
import {
  getProjectByIdForOwner,
  updateProjectStatus
} from "@/server/projects/project-repository"

function projectPath(projectId: string) {
  return `/dashboard/projects/${projectId}`
}

export async function generateConceptsAction(projectId: string) {
  const path = projectPath(projectId)
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  const [project, projectInput, jobs] = await Promise.all([
    getProjectByIdForOwner(projectId, user.id),
    getProjectInputByProjectIdForOwner(projectId, user.id),
    listJobsByProjectIdForOwner(projectId, user.id)
  ])

  if (!project) {
    redirectWithFormError(path, "project_not_found")
  }

  if (!projectInput) {
    redirectWithFormError(path, "save_brief_first")
  }

  const activeJob = jobs.find(
    (job) =>
      job.type === "generate_concepts" &&
      (job.status === "queued" || job.status === "running")
  )

  if (activeJob) {
    revalidatePath(path)
    return
  }

  try {
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
  } catch {
    redirectWithFormError(path, "job_failed")
  }

  revalidatePath(path)
  revalidatePath("/dashboard")
}
