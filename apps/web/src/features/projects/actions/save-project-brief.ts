"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { projectBriefSchema } from "@/features/projects/schemas/project-schema"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getProjectByIdForOwner } from "@/server/projects/project-repository"
import { upsertProjectInput } from "@/server/projects/project-input-repository"

export async function saveProjectBriefAction(projectId: string, formData: FormData) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const project = await getProjectByIdForOwner(projectId, user.id)

  if (!project) {
    throw new Error("Project not found")
  }

  const parsed = projectBriefSchema.safeParse({
    brandTone: formData.get("brandTone"),
    callToAction: formData.get("callToAction"),
    offerText: formData.get("offerText"),
    productDescription: formData.get("productDescription"),
    productName: formData.get("productName"),
    targetAudience: formData.get("targetAudience"),
    visualStyle: formData.get("visualStyle")
  })

  if (!parsed.success) {
    throw new Error("Invalid brief input")
  }

  await upsertProjectInput({
    brief: parsed.data,
    ownerId: user.id,
    projectId
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath("/dashboard")
  redirect(`/dashboard/projects/${projectId}?flash=brief_saved`)
}
