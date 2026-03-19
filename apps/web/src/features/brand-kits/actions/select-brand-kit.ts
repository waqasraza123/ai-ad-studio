"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getBrandKitByIdForOwner } from "@/server/brand-kits/brand-kit-repository"
import { updateProjectBrandKit } from "@/server/projects/project-repository"

export async function selectProjectBrandKitAction(projectId: string, formData: FormData) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const brandKitId = String(formData.get("brandKitId") ?? "").trim()

  if (!brandKitId) {
    throw new Error("Brand kit is required")
  }

  const brandKit = await getBrandKitByIdForOwner(brandKitId, user.id)

  if (!brandKit) {
    throw new Error("Brand kit not found")
  }

  await updateProjectBrandKit({
    brandKitId: brandKit.id,
    ownerId: user.id,
    projectId
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath("/dashboard")
}
