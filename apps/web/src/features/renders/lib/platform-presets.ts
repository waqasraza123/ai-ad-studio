import type {
  ExportAspectRatio,
  PlatformPresetKey,
  RenderVariantKey
} from "@/server/database/types"

export type PlatformPresetDefinition = {
  aspectRatios: ExportAspectRatio[]
  defaultVariant: RenderVariantKey
  description: string
  key: PlatformPresetKey
  label: string
}

const defaultPlatformPreset: PlatformPresetDefinition = {
  aspectRatios: ["9:16"],
  defaultVariant: "default",
  description: "General-purpose vertical export",
  key: "default",
  label: "Default"
}

export const platformPresets: PlatformPresetDefinition[] = [
  defaultPlatformPreset,
  {
    aspectRatios: ["9:16"],
    defaultVariant: "cta_heavy",
    description: "Optimized for Instagram Reels pacing",
    key: "instagram_reels",
    label: "Instagram Reels"
  },
  {
    aspectRatios: ["1:1"],
    defaultVariant: "caption_heavy",
    description: "Square export for Instagram feed",
    key: "instagram_feed",
    label: "Instagram Feed"
  },
  {
    aspectRatios: ["9:16"],
    defaultVariant: "default",
    description: "Vertical short-form preset for YouTube Shorts",
    key: "youtube_shorts",
    label: "YouTube Shorts"
  },
  {
    aspectRatios: ["16:9"],
    defaultVariant: "caption_heavy",
    description: "Landscape export for YouTube or landing pages",
    key: "youtube_landscape",
    label: "YouTube Landscape"
  }
]

export function isPlatformPresetKey(value: string): value is PlatformPresetKey {
  return platformPresets.some((preset) => preset.key === value)
}

export function getPlatformPresetDefinition(key: PlatformPresetKey) {
  return (
    platformPresets.find((preset) => preset.key === key) ?? defaultPlatformPreset
  )
}
