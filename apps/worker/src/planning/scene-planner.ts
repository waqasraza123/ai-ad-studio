export type PlannedScene = {
  captionText: string
  durationSeconds: number
  motionStyle: string
  promptText: string
  purpose: "opener" | "product_emphasis" | "cta_close"
}

export type RenderVariantKey = "default" | "caption_heavy" | "cta_heavy"

function shorten(value: string, limit: number) {
  const normalized = value.trim()
  return normalized.length > limit ? `${normalized.slice(0, limit - 3)}...` : normalized
}

export function buildStructuredScenePlan(input: {
  angle: string
  callToAction: string | null
  hook: string
  productName: string
  script: string
  variantKey: RenderVariantKey
  visualDirection: string | null
}) {
  const ctaText = input.callToAction?.trim() || "Shop now"
  const visualDirection =
    input.visualDirection?.trim() || "premium studio visuals with clean motion"
  const openerCaption = shorten(
    input.variantKey === "caption_heavy"
      ? `${input.hook} ${input.script}`
      : input.hook,
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
          ? "caption-led hero reveal"
          : "premium hero reveal",
      promptText: `Create an opener scene for ${input.productName}. Hook: ${input.hook}. ${visualDirection}. Premium vertical ad motion.`,
      purpose: "opener" as const
    },
    {
      captionText: productCaption,
      durationSeconds: 4,
      motionStyle:
        input.variantKey === "cta_heavy"
          ? "conversion-focused product emphasis"
          : input.variantKey === "caption_heavy"
            ? "caption-rich product emphasis"
            : "product-detail motion emphasis",
      promptText: `Create a product emphasis scene for ${input.productName}. Angle: ${input.angle}. Script focus: ${input.script}. ${visualDirection}.`,
      purpose: "product_emphasis" as const
    },
    {
      captionText: closeCaption,
      durationSeconds: 3,
      motionStyle:
        input.variantKey === "cta_heavy"
          ? "strong CTA close"
          : "clean CTA close",
      promptText: `Create a final conversion scene for ${input.productName}. CTA: ${ctaText}. ${visualDirection}. Motion should set up a final end card.`,
      purpose: "cta_close" as const
    }
  ]
}
