"use server"

import { revalidatePath } from "next/cache"
import { redirectToLoginWithFormError, redirectWithFormError } from "@/lib/server-action-redirect"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  getConceptByIdForOwner,
  updateConceptStatusForOwner
} from "@/server/concepts/concept-repository"
import { selectProjectConcept } from "@/server/projects/project-repository"

function projectPath(projectId: string) {
  return `/dashboard/projects/${projectId}`
}

export async function selectConceptAction(
  projectId: string,
  conceptId: string
) {
  const path = projectPath(projectId)
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  const concept = await getConceptByIdForOwner(conceptId, user.id)

  if (!concept) {
    redirectWithFormError(path, "concept_not_found")
  }

  try {
    await selectProjectConcept({
      conceptId,
      ownerId: user.id,
      projectId
    })

    await updateConceptStatusForOwner({
      conceptId,
      ownerId: user.id,
      status: "selected"
    })
  } catch {
    redirectWithFormError(path, "server_error")
  }

  revalidatePath(path)
  revalidatePath("/dashboard")
}
