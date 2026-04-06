"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createProjectSchema } from "@/features/projects/schemas/project-schema"
import { hasDisallowedWordingIssue, MODEST_WORDING_FORM_ERROR_CODE } from "@/lib/modest-wording"
import { redirectToLoginWithFormError, redirectWithFormError } from "@/lib/server-action-redirect"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { createProjectForOwner } from "@/server/projects/project-repository"

const NEW_PROJECT_PATH = "/dashboard/projects/new"

export async function createProjectAction(formData: FormData): Promise<void> {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  const parsed = createProjectSchema.safeParse({
    name: formData.get("name")
  })

  if (!parsed.success) {
    redirectWithFormError(
      NEW_PROJECT_PATH,
      hasDisallowedWordingIssue(parsed.error)
        ? MODEST_WORDING_FORM_ERROR_CODE
        : "name_invalid"
    )
  }

  const { name } = parsed.data

  try {
    const project = await createProjectForOwner({
      name,
      ownerId: user.id
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/projects")

    redirect(`/dashboard/projects/${project.id}`)
  } catch {
    redirectWithFormError(NEW_PROJECT_PATH, "server_error")
  }
}
