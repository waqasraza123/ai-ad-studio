"use server"

import { revalidatePath } from "next/cache"
import { redirectToLoginWithFormError, redirectWithFormError } from "@/lib/server-action-redirect"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getBrandKitByIdForOwner } from "@/server/brand-kits/brand-kit-repository"
import { updateProjectBrandKit } from "@/server/projects/project-repository"

export async function selectProjectBrandKitAction(projectId: string, formData: FormData) {
  const path = `/dashboard/projects/${projectId}`
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  const brandKitId = String(formData.get("brandKitId") ?? "").trim()

  if (!brandKitId) {
    redirectWithFormError(path, "brand_kit_required")
  }

  const brandKit = await getBrandKitByIdForOwner(brandKitId, user.id)

  if (!brandKit) {
    redirectWithFormError(path, "brand_kit_not_found")
  }

  try {
    await updateProjectBrandKit({
      brandKitId: brandKit.id,
      ownerId: user.id,
      projectId
    })
  } catch {
    redirectWithFormError(path, "server_error")
  }

  revalidatePath(path)
  revalidatePath("/dashboard")
}
