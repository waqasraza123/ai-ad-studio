"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { projectBriefSchema } from "@/features/projects/schemas/project-schema"
import { hasDisallowedWordingIssue, MODEST_WORDING_FORM_ERROR_CODE } from "@/lib/modest-wording"
import { redirectToLoginWithFormError, redirectWithFormError } from "@/lib/server-action-redirect"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getProjectByIdForOwner } from "@/server/projects/project-repository"
import { upsertProjectInput } from "@/server/projects/project-input-repository"

export async function saveProjectBriefAction(projectId: string, formData: FormData) {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  const projectPath = `/dashboard/projects/${projectId}`

  const project = await getProjectByIdForOwner(projectId, user.id)

  if (!project) {
    redirectWithFormError(projectPath, "project_not_found")
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
    redirectWithFormError(
      projectPath,
      hasDisallowedWordingIssue(parsed.error)
        ? MODEST_WORDING_FORM_ERROR_CODE
        : "brief_invalid"
    )
  }

  const brief = parsed.data

  try {
    await upsertProjectInput({
      brief,
      ownerId: user.id,
      projectId
    })
  } catch {
    redirectWithFormError(projectPath, "server_error")
  }

  revalidatePath(projectPath)
  revalidatePath("/dashboard")
  redirect(`${projectPath}?flash=brief_saved`)
}
