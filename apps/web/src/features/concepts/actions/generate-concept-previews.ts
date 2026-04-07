"use server"

import { revalidatePath } from "next/cache"
import { redirectToLoginWithFormError, redirectWithFormError } from "@/lib/server-action-redirect"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getBillingGateDecision } from "@/server/billing/billing-service"
import {
  listConceptsByProjectIdForOwner,
  updateConceptStatusForProject
} from "@/server/concepts/concept-repository"
import { createJob, listJobsByProjectIdForOwner } from "@/server/jobs/job-repository"
import { getProjectByIdForOwner } from "@/server/projects/project-repository"

function projectPath(projectId: string) {
  return `/dashboard/projects/${projectId}`
}

export async function generateConceptPreviewsAction(projectId: string) {
  const path = projectPath(projectId)
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  const [project, concepts, jobs] = await Promise.all([
    getProjectByIdForOwner(projectId, user.id),
    listConceptsByProjectIdForOwner(projectId, user.id),
    listJobsByProjectIdForOwner(projectId, user.id)
  ])

  if (!project) {
    redirectWithFormError(path, "project_not_found")
  }

  if (concepts.length === 0) {
    redirectWithFormError(path, "concepts_first")
  }

  const activePreviewJob = jobs.find(
    (job) =>
      job.type === "generate_concept_preview" &&
      (job.status === "queued" || job.status === "running")
  )

  if (activePreviewJob) {
    revalidatePath(path)
    return
  }

  try {
    const billingDecision = await getBillingGateDecision(user.id, "generate_previews", {
      previewGenerations: concepts.length
    })

    if (!billingDecision.allowed) {
      redirectWithFormError(path, billingDecision.code ?? "job_failed")
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
  } catch {
    redirectWithFormError(path, "job_failed")
  }

  revalidatePath(path)
}
