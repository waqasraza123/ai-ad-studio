"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { updateProjectTemplate } from "@/server/projects/project-repository"
import { getTemplateByIdForOwner } from "@/server/templates/template-repository"

export async function selectProjectTemplateAction(projectId: string, formData: FormData) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const templateId = String(formData.get("templateId") ?? "").trim()

  if (!templateId) {
    throw new Error("Template is required")
  }

  const template = await getTemplateByIdForOwner(templateId, user.id)

  if (!template) {
    throw new Error("Template not found")
  }

  await updateProjectTemplate({
    ownerId: user.id,
    projectId,
    templateId: template.id
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath("/dashboard")
}
