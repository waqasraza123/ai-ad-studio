"use server"

import { revalidatePath } from "next/cache"
import { createProjectSchema } from "@/features/projects/schemas/project-schema"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { createProjectForOwner } from "@/server/projects/project-repository"

export async function createProjectAction(formData: FormData) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const parsed = createProjectSchema.safeParse({
    name: formData.get("name")
  })

  if (!parsed.success) {
    throw new Error("A valid project name is required")
  }

  const project = await createProjectForOwner({
    name: parsed.data.name,
    ownerId: user.id
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/projects")

  return {
    projectId: project.id
  }
}
