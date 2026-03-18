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

export type TemplateScenePackItem = {
  purpose: "opener" | "product_emphasis" | "cta_close"
  motion_style: string
  visual_style: string
  caption_tone: string
}

export type TemplateCtaPreset = {
  headline_prefix: string
  subheadline_text: string
  emphasis_style: "clean" | "bold" | "minimal"
}

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
  templateCtaPreset: TemplateCtaPreset
  templateScenePack: TemplateScenePackItem[]
  variantKey: RenderVariantKey
  visualDirection: string | null
}) {
  const ctaText = input.callToAction?.trim() || "Shop now"
  const visualDirection =
    input.visualDirection?.trim() || "premium studio visuals with clean motion"
  const framing = aspectRatioFraming(input.aspectRatio)
  const preset = presetStyle(input.platformPreset)

  const openerScene = input.templateScenePack[0]
  const emphasisScene = input.templateScenePack[1]
  const closeScene = input.templateScenePack[2]

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
      ? `${input.templateCtaPreset.headline_prefix} ${ctaText}`
      : `Close with CTA: ${ctaText}`

  return [
    {
      captionText: openerCaption,
      durationSeconds: 3,
      motionStyle: openerScene?.motion_style ?? `premium hero reveal with ${framing}`,
      promptText: `Create an opener scene for ${input.productName}. Hook: ${input.hook}. ${visualDirection}. ${framing}. ${preset}. Visual style: ${openerScene?.visual_style ?? "premium product reveal"}. Caption tone: ${openerScene?.caption_tone ?? "clear"}.`,
      purpose: "opener" as const
    },
    {
      captionText: productCaption,
      durationSeconds: 4,
      motionStyle: emphasisScene?.motion_style ?? `product-detail emphasis with ${framing}`,
      promptText: `Create a product emphasis scene for ${input.productName}. Angle: ${input.angle}. Script focus: ${input.script}. ${visualDirection}. ${framing}. ${preset}. Visual style: ${emphasisScene?.visual_style ?? "product emphasis frame"}. Caption tone: ${emphasisScene?.caption_tone ?? "direct"}.`,
      purpose: "product_emphasis" as const
    },
    {
      captionText: closeCaption,
      durationSeconds: 3,
      motionStyle: closeScene?.motion_style ?? `clean CTA close with ${framing}`,
      promptText: `Create a final conversion scene for ${input.productName}. CTA: ${ctaText}. ${visualDirection}. ${framing}. ${preset}. Visual style: ${closeScene?.visual_style ?? "conversion end-card frame"}. Caption tone: ${closeScene?.caption_tone ?? "strong"}. Motion should set up a final end card.`,
      purpose: "cta_close" as const
    }
  ]
}
