import type { SupabaseClient } from "@supabase/supabase-js"

type BrandKitPalette = {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
}

type BrandKitTypography = {
  heading_family: string
  body_family: string
  headline_weight: string
  body_weight: string
  letter_spacing: string
}

type WorkerBrandKitRecord = {
  id: string
  owner_id: string
  name: string
  logo_asset_id: string | null
  palette: BrandKitPalette
  typography: BrandKitTypography
  is_default: boolean
}

const fallbackPalette: BrandKitPalette = {
  primary: "#6366F1",
  secondary: "#A5B4FC",
  accent: "#22D3EE",
  background: "#0F172A",
  foreground: "#F8FAFC"
}

const fallbackTypography: BrandKitTypography = {
  body_family: "Inter",
  body_weight: "400",
  heading_family: "Inter",
  headline_weight: "700",
  letter_spacing: "0.02em"
}

function normalizeBrandKit(record: {
  id: string
  owner_id: string
  name: string
  logo_asset_id: string | null
  palette: unknown
  typography: unknown
  is_default: boolean
} | null): WorkerBrandKitRecord {
  if (!record) {
    return {
      id: "fallback-brand-kit",
      owner_id: "",
      name: "Fallback Brand Kit",
      logo_asset_id: null,
      palette: fallbackPalette,
      typography: fallbackTypography,
      is_default: true
    }
  }

  return {
    ...record,
    palette: (record.palette ?? fallbackPalette) as BrandKitPalette,
    typography: (record.typography ?? fallbackTypography) as BrandKitTypography
  }
}

export async function getProjectBrandKit(
  supabase: SupabaseClient,
  input: {
    brandKitId: string | null
    ownerId: string
  }
) {
  if (!input.brandKitId) {
    const { data, error } = await supabase
      .from("brand_kits")
      .select("id, owner_id, name, logo_asset_id, palette, typography, is_default")
      .eq("owner_id", input.ownerId)
      .eq("is_default", true)
      .maybeSingle()

    if (error) {
      throw new Error("Failed to load default brand kit")
    }

    return normalizeBrandKit(
      data as {
        id: string
        owner_id: string
        name: string
        logo_asset_id: string | null
        palette: unknown
        typography: unknown
        is_default: boolean
      } | null
    )
  }

  const { data, error } = await supabase
    .from("brand_kits")
    .select("id, owner_id, name, logo_asset_id, palette, typography, is_default")
    .eq("id", input.brandKitId)
    .eq("owner_id", input.ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load selected brand kit")
  }

  return normalizeBrandKit(
    data as {
      id: string
      owner_id: string
      name: string
      logo_asset_id: string | null
      palette: unknown
      typography: unknown
      is_default: boolean
    } | null
  )
}
