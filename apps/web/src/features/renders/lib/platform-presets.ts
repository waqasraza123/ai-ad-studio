import type {
  ExportAspectRatio,
  PlatformPresetKey,
  RenderVariantKey
} from "@/server/database/types"
import type { AppMessageKey } from "@/lib/i18n/messages/en"

export type PlatformPresetDefinition = {
  aspectRatios: ExportAspectRatio[]
  defaultVariant: RenderVariantKey
  descriptionKey: AppMessageKey
  key: PlatformPresetKey
  labelKey: AppMessageKey
}

const defaultPlatformPreset: PlatformPresetDefinition = {
  aspectRatios: ["9:16"],
  defaultVariant: "default",
  descriptionKey: "renders.platformPreset.default.description",
  key: "default",
  labelKey: "renders.platformPreset.default.label"
}

export const platformPresets: PlatformPresetDefinition[] = [
  defaultPlatformPreset,
  {
    aspectRatios: ["9:16"],
    defaultVariant: "cta_heavy",
    descriptionKey: "renders.platformPreset.instagram_reels.description",
    key: "instagram_reels",
    labelKey: "renders.platformPreset.instagram_reels.label"
  },
  {
    aspectRatios: ["1:1"],
    defaultVariant: "caption_heavy",
    descriptionKey: "renders.platformPreset.instagram_feed.description",
    key: "instagram_feed",
    labelKey: "renders.platformPreset.instagram_feed.label"
  },
  {
    aspectRatios: ["9:16"],
    defaultVariant: "default",
    descriptionKey: "renders.platformPreset.youtube_shorts.description",
    key: "youtube_shorts",
    labelKey: "renders.platformPreset.youtube_shorts.label"
  },
  {
    aspectRatios: ["16:9"],
    defaultVariant: "caption_heavy",
    descriptionKey: "renders.platformPreset.youtube_landscape.description",
    key: "youtube_landscape",
    labelKey: "renders.platformPreset.youtube_landscape.label"
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
