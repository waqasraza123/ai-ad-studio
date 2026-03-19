"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { updateBrandKit } from "@/server/brand-kits/brand-kit-repository"

function readString(formData: FormData, key: string, fallback: string) {
  const value = String(formData.get(key) ?? "").trim()
  return value || fallback
}

export async function updateBrandKitAction(brandKitId: string, formData: FormData) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  await updateBrandKit({
    ownerId: user.id,
    brandKitId,
    name: readString(formData, "name", "Brand Kit"),
    logoAssetId: null,
    palette: {
      accent: readString(formData, "accent", "#22D3EE"),
      background: readString(formData, "background", "#0F172A"),
      foreground: readString(formData, "foreground", "#F8FAFC"),
      primary: readString(formData, "primary", "#6366F1"),
      secondary: readString(formData, "secondary", "#A5B4FC")
    },
    typography: {
      body_family: readString(formData, "body_family", "Inter"),
      body_weight: readString(formData, "body_weight", "400"),
      heading_family: readString(formData, "heading_family", "Inter"),
      headline_weight: readString(formData, "headline_weight", "700"),
      letter_spacing: readString(formData, "letter_spacing", "0.02em")
    }
  })

  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard")
}
