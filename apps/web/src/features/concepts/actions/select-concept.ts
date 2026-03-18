"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  getConceptByIdForOwner,
  updateConceptStatusForOwner
} from "@/server/concepts/concept-repository"
import { selectProjectConcept } from "@/server/projects/project-repository"

export async function selectConceptAction(
  projectId: string,
  conceptId: string
) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const concept = await getConceptByIdForOwner(conceptId, user.id)

  if (!concept) {
    throw new Error("Concept not found")
  }

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

  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath("/dashboard")
}
