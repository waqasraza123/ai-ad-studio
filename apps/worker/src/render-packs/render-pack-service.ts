import type { SupabaseClient } from "@supabase/supabase-js"

type ExportAspectRatio = "9:16" | "1:1" | "16:9"
type PlatformPresetKey =
  | "default"
  | "instagram_reels"
  | "instagram_feed"
  | "youtube_shorts"
  | "youtube_landscape"

type RenderSafeZone = {
  top: number
  right: number
  bottom: number
  left: number
}

type CaptionLayoutPreset = {
  box_width: number
  box_height: number
  x: number
  y: number
  font_size: number
}

type CtaTimingPreset = {
  cta_card_seconds: number
  cta_start_seconds: number
}

type WorkerRenderPackRecord = {
  id: string
  owner_id: string
  name: string
  platform_preset: PlatformPresetKey
  aspect_ratio: ExportAspectRatio
  safe_zone: RenderSafeZone
  caption_layout: CaptionLayoutPreset
  cta_timing: CtaTimingPreset
  is_default: boolean
}

function fallbackRenderPackForAspect(aspectRatio: ExportAspectRatio): WorkerRenderPackRecord {
  if (aspectRatio === "1:1") {
    return {
      id: "fallback-render-pack-square",
      owner_id: "",
      name: "Fallback Render Pack Square",
      platform_preset: "default",
      aspect_ratio: aspectRatio,
      safe_zone: { top: 90, right: 90, bottom: 140, left: 90 },
      caption_layout: { box_width: 860, box_height: 170, x: 110, y: 760, font_size: 40 },
      cta_timing: { cta_card_seconds: 1.4, cta_start_seconds: 8.6 },
      is_default: true
    }
  }

  if (aspectRatio === "16:9") {
    return {
      id: "fallback-render-pack-landscape",
      owner_id: "",
      name: "Fallback Render Pack Landscape",
      platform_preset: "default",
      aspect_ratio: aspectRatio,
      safe_zone: { top: 80, right: 140, bottom: 100, left: 140 },
      caption_layout: { box_width: 1520, box_height: 170, x: 200, y: 780, font_size: 40 },
      cta_timing: { cta_card_seconds: 1.5, cta_start_seconds: 8.5 },
      is_default: true
    }
  }

  return {
    id: "fallback-render-pack-vertical",
    owner_id: "",
    name: "Fallback Render Pack Vertical",
    platform_preset: "default",
    aspect_ratio: aspectRatio,
    safe_zone: { top: 140, right: 70, bottom: 220, left: 70 },
    caption_layout: { box_width: 940, box_height: 230, x: 70, y: 1460, font_size: 46 },
    cta_timing: { cta_card_seconds: 1.5, cta_start_seconds: 8.5 },
    is_default: true
  }
}

function normalizeRenderPack(
  record: {
    id: string
    owner_id: string
    name: string
    platform_preset: PlatformPresetKey
    aspect_ratio: ExportAspectRatio
    safe_zone: unknown
    caption_layout: unknown
    cta_timing: unknown
    is_default: boolean
  } | null,
  aspectRatio: ExportAspectRatio
): WorkerRenderPackRecord {
  const fallback = fallbackRenderPackForAspect(aspectRatio)

  if (!record) {
    return fallback
  }

  return {
    ...record,
    safe_zone: (record.safe_zone ?? fallback.safe_zone) as RenderSafeZone,
    caption_layout: (record.caption_layout ?? fallback.caption_layout) as CaptionLayoutPreset,
    cta_timing: (record.cta_timing ?? fallback.cta_timing) as CtaTimingPreset
  }
}

export async function getRenderPackForPlatform(
  supabase: SupabaseClient,
  input: {
    ownerId: string
    platformPreset: PlatformPresetKey
    aspectRatio: ExportAspectRatio
  }
) {
  const { data, error } = await supabase
    .from("platform_render_packs")
    .select("id, owner_id, name, platform_preset, aspect_ratio, safe_zone, caption_layout, cta_timing, is_default")
    .eq("owner_id", input.ownerId)
    .eq("platform_preset", input.platformPreset)
    .eq("aspect_ratio", input.aspectRatio)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load specific render pack")
  }

  if (data) {
    return normalizeRenderPack(
      data as {
        id: string
        owner_id: string
        name: string
        platform_preset: PlatformPresetKey
        aspect_ratio: ExportAspectRatio
        safe_zone: unknown
        caption_layout: unknown
        cta_timing: unknown
        is_default: boolean
      },
      input.aspectRatio
    )
  }

  const { data: fallback, error: fallbackError } = await supabase
    .from("platform_render_packs")
    .select("id, owner_id, name, platform_preset, aspect_ratio, safe_zone, caption_layout, cta_timing, is_default")
    .eq("owner_id", input.ownerId)
    .eq("platform_preset", "default")
    .eq("aspect_ratio", input.aspectRatio)
    .maybeSingle()

  if (fallbackError) {
    throw new Error("Failed to load fallback render pack")
  }

  return normalizeRenderPack(
    fallback as {
      id: string
      owner_id: string
      name: string
      platform_preset: PlatformPresetKey
      aspect_ratio: ExportAspectRatio
      safe_zone: unknown
      caption_layout: unknown
      cta_timing: unknown
      is_default: boolean
    } | null,
    input.aspectRatio
  )
}
