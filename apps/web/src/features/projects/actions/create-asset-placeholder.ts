"use server"

import { revalidatePath } from "next/cache"
import { createAssetPlaceholderSchema } from "@/features/projects/schemas/project-schema"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { createAssetRecord } from "@/server/projects/asset-repository"
import { getProjectByIdForOwner } from "@/server/projects/project-repository"

export async function createAssetPlaceholderAction(
  projectId: string,
  formData: FormData
) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const project = await getProjectByIdForOwner(projectId, user.id)

  if (!project) {
    throw new Error("Project not found")
  }

  const file = formData.get("file")
  const kindValue = String(formData.get("kind") ?? "product_image")

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Select a file before registering an asset")
  }

  const parsed = createAssetPlaceholderSchema.safeParse({
    fileName: file.name,
    kind: kindValue,
    mimeType: file.type || "application/octet-stream",
    projectId,
    sizeBytes: file.size
  })

  if (!parsed.success) {
    throw new Error("Invalid asset input")
  }

  await createAssetRecord({
    ownerId: user.id,
    placeholder: parsed.data
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
}
