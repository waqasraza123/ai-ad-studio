import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  CaptionLayoutPreset,
  CtaTimingPreset,
  ExportAspectRatio,
  PlatformPresetKey,
  PlatformRenderPackRecord,
  RenderSafeZone
} from "@/server/database/types"

const renderPackSelection =
  "id, owner_id, name, platform_preset, aspect_ratio, safe_zone, caption_layout, cta_timing, is_default, created_at, updated_at"

const defaultRenderPacks: Array<{
  name: string
  platform_preset: PlatformPresetKey
  aspect_ratio: ExportAspectRatio
  safe_zone: RenderSafeZone
  caption_layout: CaptionLayoutPreset
  cta_timing: CtaTimingPreset
  is_default: boolean
}> = [
  {
    name: "Instagram Reels Vertical",
    platform_preset: "instagram_reels",
    aspect_ratio: "9:16",
    safe_zone: { top: 180, right: 70, bottom: 260, left: 70 },
    caption_layout: { box_width: 900, box_height: 220, x: 90, y: 1420, font_size: 44 },
    cta_timing: { cta_card_seconds: 1.6, cta_start_seconds: 8.4 },
    is_default: true
  },
  {
    name: "Instagram Feed Square",
    platform_preset: "instagram_feed",
    aspect_ratio: "1:1",
    safe_zone: { top: 90, right: 90, bottom: 140, left: 90 },
    caption_layout: { box_width: 860, box_height: 170, x: 110, y: 760, font_size: 40 },
    cta_timing: { cta_card_seconds: 1.4, cta_start_seconds: 8.6 },
    is_default: true
  },
  {
    name: "YouTube Shorts Vertical",
    platform_preset: "youtube_shorts",
    aspect_ratio: "9:16",
    safe_zone: { top: 160, right: 70, bottom: 220, left: 70 },
    caption_layout: { box_width: 920, box_height: 210, x: 80, y: 1440, font_size: 42 },
    cta_timing: { cta_card_seconds: 1.8, cta_start_seconds: 8.2 },
    is_default: true
  },
  {
    name: "YouTube Landscape",
    platform_preset: "youtube_landscape",
    aspect_ratio: "16:9",
    safe_zone: { top: 80, right: 140, bottom: 100, left: 140 },
    caption_layout: { box_width: 1520, box_height: 170, x: 200, y: 780, font_size: 40 },
    cta_timing: { cta_card_seconds: 1.5, cta_start_seconds: 8.5 },
    is_default: true
  },
  {
    name: "Default Vertical",
    platform_preset: "default",
    aspect_ratio: "9:16",
    safe_zone: { top: 140, right: 70, bottom: 220, left: 70 },
    caption_layout: { box_width: 940, box_height: 230, x: 70, y: 1460, font_size: 46 },
    cta_timing: { cta_card_seconds: 1.5, cta_start_seconds: 8.5 },
    is_default: true
  }
]

function normalizeRenderPack(
  record: Omit<PlatformRenderPackRecord, "safe_zone" | "caption_layout" | "cta_timing"> & {
    safe_zone: unknown
    caption_layout: unknown
    cta_timing: unknown
  }
): PlatformRenderPackRecord {
  return {
    ...record,
    safe_zone: (record.safe_zone ?? {}) as RenderSafeZone,
    caption_layout: (record.caption_layout ?? {}) as CaptionLayoutPreset,
    cta_timing: (record.cta_timing ?? {}) as CtaTimingPreset
  }
}

export async function ensureDefaultRenderPacks(ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("platform_render_packs")
    .select(renderPackSelection)
    .eq("owner_id", ownerId)

  if (error) {
    throw new Error("Failed to load render packs")
  }

  if ((data ?? []).length > 0) {
    return (data ?? []).map((record) =>
      normalizeRenderPack(
        record as PlatformRenderPackRecord & {
          safe_zone: unknown
          caption_layout: unknown
          cta_timing: unknown
        }
      )
    )
  }

  const { data: inserted, error: insertError } = await supabase
    .from("platform_render_packs")
    .insert(
      defaultRenderPacks.map((pack) => ({
        ...pack,
        owner_id: ownerId
      }))
    )
    .select(renderPackSelection)

  if (insertError) {
    throw new Error("Failed to create default render packs")
  }

  return (inserted ?? []).map((record) =>
    normalizeRenderPack(
      record as PlatformRenderPackRecord & {
        safe_zone: unknown
        caption_layout: unknown
        cta_timing: unknown
      }
    )
  )
}

export async function listRenderPacksByOwner(ownerId: string) {
  const packs = await ensureDefaultRenderPacks(ownerId)

  return packs.sort((left, right) => left.name.localeCompare(right.name))
}
