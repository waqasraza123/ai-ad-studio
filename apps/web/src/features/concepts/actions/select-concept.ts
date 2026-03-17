"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  getConceptByIdForOwner,
  listConceptsByProjectIdForOwner,
  updateConceptStatusForOwner
} from "@/server/concepts/concept-repository"
import { selectConceptForProject } from "@/server/projects/project-repository"

export async function selectConceptAction(projectId: string, conceptId: string) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const [concept, concepts] = await Promise.all([
    getConceptByIdForOwner(conceptId, user.id),
    listConceptsByProjectIdForOwner(projectId, user.id)
  ])

  if (!concept || concept.project_id !== projectId) {
    throw new Error("Concept not found")
  }

  await Promise.all(
    concepts.map((projectConcept) =>
      updateConceptStatusForOwner({
        conceptId: projectConcept.id,
        ownerId: user.id,
        status: projectConcept.id === conceptId ? "selected" : "preview_ready"
      })
    )
  )

  await selectConceptForProject({
    conceptId,
    ownerId: user.id,
    projectId
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath("/dashboard")
}
