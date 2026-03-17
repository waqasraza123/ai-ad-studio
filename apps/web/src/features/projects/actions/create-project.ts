"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createProjectSchema } from "@/features/projects/schemas/project-schema"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { createProject } from "@/server/projects/project-repository"

export async function createProjectAction(formData: FormData) {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/login")
  }

  const parsed = createProjectSchema.safeParse({
    name: formData.get("name")
  })

  if (!parsed.success) {
    redirect("/dashboard/projects/new?error=Please%20enter%20a%20valid%20project%20name.")
  }

  const project = await createProject({
    name: parsed.data.name,
    ownerId: user.id
  })

  revalidatePath("/dashboard")
  redirect(`/dashboard/projects/${project.id}`)
}
