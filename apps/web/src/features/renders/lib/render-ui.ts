import type { AppMessageKey } from "@/lib/i18n/messages/en"
import type {
  PlatformPresetKey,
  RenderBatchRecord,
  RenderVariantKey,
  ShareCampaignRecord
} from "@/server/database/types"

export function getPlatformPresetLabelKey(
  platformPreset: PlatformPresetKey
): AppMessageKey {
  if (platformPreset === "instagram_reels") {
    return "renders.platformPreset.instagram_reels.label"
  }

  if (platformPreset === "instagram_feed") {
    return "renders.platformPreset.instagram_feed.label"
  }

  if (platformPreset === "youtube_shorts") {
    return "renders.platformPreset.youtube_shorts.label"
  }

  if (platformPreset === "youtube_landscape") {
    return "renders.platformPreset.youtube_landscape.label"
  }

  return "renders.platformPreset.default.label"
}

export function getPlatformPresetDescriptionKey(
  platformPreset: PlatformPresetKey
): AppMessageKey {
  if (platformPreset === "instagram_reels") {
    return "renders.platformPreset.instagram_reels.description"
  }

  if (platformPreset === "instagram_feed") {
    return "renders.platformPreset.instagram_feed.description"
  }

  if (platformPreset === "youtube_shorts") {
    return "renders.platformPreset.youtube_shorts.description"
  }

  if (platformPreset === "youtube_landscape") {
    return "renders.platformPreset.youtube_landscape.description"
  }

  return "renders.platformPreset.default.description"
}

export function getRenderVariantLabelKey(
  variantKey: RenderVariantKey
): AppMessageKey {
  if (variantKey === "caption_heavy") {
    return "renders.variant.caption_heavy"
  }

  if (variantKey === "cta_heavy") {
    return "renders.variant.cta_heavy"
  }

  return "renders.variant.default"
}

export function getRenderBatchStatusLabelKey(
  status: RenderBatchRecord["status"]
): AppMessageKey {
  if (status === "rendering") {
    return "common.status.rendering"
  }

  if (status === "ready") {
    return "common.status.ready"
  }

  if (status === "failed") {
    return "common.status.failed"
  }

  return "common.status.queued"
}

export function getShareCampaignStatusLabelKey(
  status: ShareCampaignRecord["status"]
): AppMessageKey {
  if (status === "archived") {
    return "common.status.archived"
  }

  return "common.status.active"
}
