export type PlannedScene = {
  captionText: string
  durationSeconds: number
  motionStyle: string
  promptText: string
  purpose: "opener" | "product_emphasis" | "cta_close"
}

export type RenderVariantKey = "default" | "caption_heavy" | "cta_heavy"
export type ExportAspectRatio = "9:16" | "1:1" | "16:9"
export type PlatformPresetKey =
  | "default"
  | "instagram_reels"
  | "instagram_feed"
  | "youtube_shorts"
  | "youtube_landscape"

function shorten(value: string, limit: number) {
  const normalized = value.trim()
  return normalized.length > limit ? `${normalized.slice(0, limit - 3)}...` : normalized
}

function aspectRatioFraming(aspectRatio: ExportAspectRatio) {
  if (aspectRatio === "1:1") {
    return "square-safe framing"
  }

  if (aspectRatio === "16:9") {
    return "landscape-safe framing"
  }

  return "vertical-first framing"
}

function presetStyle(platformPreset: PlatformPresetKey) {
  if (platformPreset === "instagram_feed") {
    return "optimized for square feed browsing"
  }

  if (platformPreset === "instagram_reels") {
    return "optimized for fast short-form reel pacing"
  }

  if (platformPreset === "youtube_landscape") {
    return "optimized for landscape playback"
  }

  if (platformPreset === "youtube_shorts") {
    return "optimized for vertical short-form playback"
  }

  return "general-purpose ad pacing"
}

export function buildStructuredScenePlan(input: {
  angle: string
  aspectRatio: ExportAspectRatio
  callToAction: string | null
  hook: string
  platformPreset: PlatformPresetKey
  productName: string
  script: string
  variantKey: RenderVariantKey
  visualDirection: string | null
}) {
  const ctaText = input.callToAction?.trim() || "Shop now"
  const visualDirection =
    input.visualDirection?.trim() || "premium studio visuals with clean motion"
  const framing = aspectRatioFraming(input.aspectRatio)
  const preset = presetStyle(input.platformPreset)

  const openerCaption = shorten(
    input.variantKey === "caption_heavy" ? `${input.hook} ${input.script}` : input.hook,
    input.variantKey === "caption_heavy" ? 92 : 70
  )
  const productCaption = shorten(
    input.variantKey === "cta_heavy"
      ? `${input.script} ${ctaText}`
      : input.script,
    input.variantKey === "caption_heavy" ? 100 : 76
  )
  const closeCaption =
    input.variantKey === "cta_heavy"
      ? `Strong CTA close: ${ctaText}`
      : `Close with CTA: ${ctaText}`

  return [
    {
      captionText: openerCaption,
      durationSeconds: 3,
      motionStyle:
        input.variantKey === "caption_heavy"
          ? `caption-led hero reveal with ${framing}`
          : `premium hero reveal with ${framing}`,
      promptText: `Create an opener scene for ${input.productName}. Hook: ${input.hook}. ${visualDirection}. ${framing}. ${preset}.`,
      purpose: "opener" as const
    },
    {
      captionText: productCaption,
      durationSeconds: 4,
      motionStyle:
        input.variantKey === "cta_heavy"
          ? `conversion-focused product emphasis with ${framing}`
          : input.variantKey === "caption_heavy"
            ? `caption-rich detail emphasis with ${framing}`
            : `product-detail emphasis with ${framing}`,
      promptText: `Create a product emphasis scene for ${input.productName}. Angle: ${input.angle}. Script focus: ${input.script}. ${visualDirection}. ${framing}. ${preset}.`,
      purpose: "product_emphasis" as const
    },
    {
      captionText: closeCaption,
      durationSeconds: 3,
      motionStyle:
        input.variantKey === "cta_heavy"
          ? `strong CTA close with ${framing}`
          : `clean CTA close with ${framing}`,
      promptText: `Create a final conversion scene for ${input.productName}. CTA: ${ctaText}. ${visualDirection}. ${framing}. ${preset}. Motion should set up a final end card.`,
      purpose: "cta_close" as const
    }
  ]
}
