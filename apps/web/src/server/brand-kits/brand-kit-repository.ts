import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  BrandKitPalette,
  BrandKitRecord,
  BrandKitTypography
} from "@/server/database/types"

const brandKitSelection =
  "id, owner_id, name, logo_asset_id, palette, typography, is_default, created_at, updated_at"

const defaultBrandKits: Array<{
  name: string
  is_default: boolean
  palette: BrandKitPalette
  typography: BrandKitTypography
}> = [
  {
    name: "Default Brand Kit",
    is_default: true,
    palette: {
      primary: "#6366F1",
      secondary: "#A5B4FC",
      accent: "#22D3EE",
      background: "#0F172A",
      foreground: "#F8FAFC"
    },
    typography: {
      heading_family: "Inter",
      body_family: "Inter",
      headline_weight: "700",
      body_weight: "400",
      letter_spacing: "0.02em"
    }
  }
]

function normalizeBrandKit(
  record: Omit<BrandKitRecord, "palette" | "typography"> & {
    palette: unknown
    typography: unknown
  }
): BrandKitRecord {
  return {
    ...record,
    palette: (record.palette ?? {}) as BrandKitPalette,
    typography: (record.typography ?? {}) as BrandKitTypography
  }
}

export async function ensureDefaultBrandKits(ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("brand_kits")
    .select(brandKitSelection)
    .eq("owner_id", ownerId)

  if (error) {
    throw new Error("Failed to load brand kits")
  }

  if ((data ?? []).length > 0) {
    return (data ?? []).map((record) =>
      normalizeBrandKit(record as BrandKitRecord & { palette: unknown; typography: unknown })
    )
  }

  const { data: inserted, error: insertError } = await supabase
    .from("brand_kits")
    .insert(
      defaultBrandKits.map((kit) => ({
        ...kit,
        owner_id: ownerId
      }))
    )
    .select(brandKitSelection)

  if (insertError) {
    throw new Error("Failed to create default brand kits")
  }

  return (inserted ?? []).map((record) =>
    normalizeBrandKit(record as BrandKitRecord & { palette: unknown; typography: unknown })
  )
}

export async function listBrandKitsByOwner(ownerId: string) {
  const kits = await ensureDefaultBrandKits(ownerId)

  return kits.sort((left, right) => {
    if (left.is_default === right.is_default) {
      return left.name.localeCompare(right.name)
    }

    return left.is_default ? -1 : 1
  })
}

export async function getBrandKitByIdForOwner(brandKitId: string, ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("brand_kits")
    .select(brandKitSelection)
    .eq("id", brandKitId)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load brand kit")
  }

  if (!data) {
    return null
  }

  return normalizeBrandKit(
    data as BrandKitRecord & { palette: unknown; typography: unknown }
  )
}

export async function getDefaultBrandKitForOwner(ownerId: string) {
  const kits = await listBrandKitsByOwner(ownerId)
  return kits.find((kit) => kit.is_default) ?? kits[0] ?? null
}

export async function updateBrandKit(input: {
  ownerId: string
  brandKitId: string
  name: string
  logoAssetId: string | null
  palette: BrandKitPalette
  typography: BrandKitTypography
}) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("brand_kits")
    .update({
      logo_asset_id: input.logoAssetId,
      name: input.name,
      palette: input.palette,
      typography: input.typography,
      updated_at: new Date().toISOString()
    })
    .eq("id", input.brandKitId)
    .eq("owner_id", input.ownerId)
    .select(brandKitSelection)
    .single()

  if (error) {
    throw new Error("Failed to update brand kit")
  }

  return normalizeBrandKit(
    data as BrandKitRecord & { palette: unknown; typography: unknown }
  )
}
