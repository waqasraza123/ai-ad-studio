"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { MODEST_WORDING_FORM_ERROR_CODE, validateRecordTextFields } from "@/lib/modest-wording/index"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { updateBrandKit } from "@/server/brand-kits/brand-kit-repository"

function readString(formData: FormData, key: string, fallback: string) {
  const value = String(formData.get(key) ?? "").trim()
  return value || fallback
}

export async function updateBrandKitAction(brandKitId: string, formData: FormData) {
  const user = await getAuthenticatedUser()
  const path = "/dashboard/settings/brand"

  if (!user) {
    throw new Error("Authentication is required")
  }

  const values = {
    accent: readString(formData, "accent", "#22D3EE"),
    background: readString(formData, "background", "#0F172A"),
    bodyFamily: readString(formData, "body_family", "Inter"),
    bodyWeight: readString(formData, "body_weight", "400"),
    foreground: readString(formData, "foreground", "#F8FAFC"),
    headingFamily: readString(formData, "heading_family", "Inter"),
    headlineWeight: readString(formData, "headline_weight", "700"),
    letterSpacing: readString(formData, "letter_spacing", "0.02em"),
    name: readString(formData, "name", "Brand Kit"),
    primary: readString(formData, "primary", "#6366F1"),
    secondary: readString(formData, "secondary", "#A5B4FC")
  }

  if (validateRecordTextFields(values)) {
    redirect(`${path}?error=${encodeURIComponent(MODEST_WORDING_FORM_ERROR_CODE)}`)
  }

  await updateBrandKit({
    ownerId: user.id,
    brandKitId,
    name: values.name,
    logoAssetId: null,
    palette: {
      accent: values.accent,
      background: values.background,
      foreground: values.foreground,
      primary: values.primary,
      secondary: values.secondary
    },
    typography: {
      body_family: values.bodyFamily,
      body_weight: values.bodyWeight,
      heading_family: values.headingFamily,
      headline_weight: values.headlineWeight,
      letter_spacing: values.letterSpacing
    }
  })

  revalidatePath(path)
  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard")
}
