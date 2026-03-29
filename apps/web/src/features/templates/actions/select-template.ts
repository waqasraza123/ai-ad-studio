"use server"

import { revalidatePath } from "next/cache"
import { redirectToLoginWithFormError, redirectWithFormError } from "@/lib/server-action-redirect"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { updateProjectTemplate } from "@/server/projects/project-repository"
import { getTemplateByIdForOwner } from "@/server/templates/template-repository"

export async function selectProjectTemplateAction(projectId: string, formData: FormData) {
  const path = `/dashboard/projects/${projectId}`
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  const templateId = String(formData.get("templateId") ?? "").trim()

  if (!templateId) {
    redirectWithFormError(path, "template_required")
  }

  const template = await getTemplateByIdForOwner(templateId, user.id)

  if (!template) {
    redirectWithFormError(path, "template_not_found")
  }

  try {
    await updateProjectTemplate({
      ownerId: user.id,
      projectId,
      templateId: template.id
    })
  } catch {
    redirectWithFormError(path, "server_error")
  }

  revalidatePath(path)
  revalidatePath("/dashboard")
}
