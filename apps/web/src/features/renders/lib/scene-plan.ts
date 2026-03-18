import type {
  AdTemplateRecord,
  PlatformPresetKey,
  RenderVariantKey
} from "@/server/database/types"

export type ScenePlanItem = {
  captionText: string
  durationSeconds: number
  motionStyle: string
  purpose: "opener" | "product_emphasis" | "cta_close"
}

function shorten(value: string, limit: number) {
  const normalized = value.trim()
  return normalized.length > limit
    ? `${normalized.slice(0, limit - 3)}...`
    : normalized
}

export function buildScenePlanPreview(input: {
  callToAction: string | null
  hook: string
  platformPreset: PlatformPresetKey
  script: string
  template: AdTemplateRecord | null
  variantKey: RenderVariantKey
}): ScenePlanItem[] {
  const ctaText = input.callToAction?.trim() || "Shop now"
  const presetMotion =
    input.platformPreset === "youtube_landscape"
      ? "landscape-friendly framing"
      : input.platformPreset === "instagram_feed"
        ? "square-safe framing"
        : "vertical-first framing"

  const templateScenes = input.template?.scene_pack ?? []

  const defaultMotion = [
    input.variantKey === "caption_heavy"
      ? `caption-led hero reveal with ${presetMotion}`
      : `hero reveal with ${presetMotion}`,
    input.variantKey === "default"
      ? `product detail emphasis with ${presetMotion}`
      : input.variantKey === "cta_heavy"
        ? `conversion-focused emphasis with ${presetMotion}`
        : `caption-rich detail emphasis with ${presetMotion}`,
    input.variantKey === "cta_heavy"
      ? `aggressive CTA transition with ${presetMotion}`
      : `clean CTA close with ${presetMotion}`
  ] as const

  return [
    {
      captionText: shorten(
        input.hook,
        input.variantKey === "caption_heavy" ? 86 : 70
      ),
      durationSeconds: 3,
      motionStyle: templateScenes[0]?.motion_style ?? defaultMotion[0],
      purpose: "opener"
    },
    {
      captionText: shorten(
        input.variantKey === "cta_heavy"
          ? `${input.script} ${ctaText}`
          : input.script,
        input.variantKey === "caption_heavy" ? 98 : 76
      ),
      durationSeconds: 4,
      motionStyle: templateScenes[1]?.motion_style ?? defaultMotion[1],
      purpose: "product_emphasis"
    },
    {
      captionText:
        input.variantKey === "cta_heavy"
          ? `Strong CTA close: ${ctaText}`
          : `Close with CTA: ${ctaText}`,
      durationSeconds: 3,
      motionStyle: templateScenes[2]?.motion_style ?? defaultMotion[2],
      purpose: "cta_close"
    }
  ]
}
