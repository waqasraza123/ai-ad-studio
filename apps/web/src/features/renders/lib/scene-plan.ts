import type { RenderVariantKey } from "@/server/database/types"

export type ScenePlanItem = {
  captionText: string
  durationSeconds: number
  motionStyle: string
  purpose: "opener" | "product_emphasis" | "cta_close"
}

function shorten(value: string, limit: number) {
  const normalized = value.trim()
  return normalized.length > limit ? `${normalized.slice(0, limit - 3)}...` : normalized
}

export function buildScenePlanPreview(input: {
  callToAction: string | null
  hook: string
  script: string
  variantKey: RenderVariantKey
}) {
  const ctaText = input.callToAction?.trim() || "Shop now"
  const baseScenes: ScenePlanItem[] = [
    {
      captionText: shorten(input.hook, 70),
      durationSeconds: 3,
      motionStyle:
        input.variantKey === "caption_heavy"
          ? "slow reveal with bold caption focus"
          : "hero reveal with premium motion",
      purpose: "opener"
    },
    {
      captionText: shorten(
        input.script,
        input.variantKey === "caption_heavy" ? 92 : 70
      ),
      durationSeconds: 4,
      motionStyle:
        input.variantKey === "default"
          ? "product detail motion emphasis"
          : input.variantKey === "cta_heavy"
            ? "conversion-focused product emphasis"
            : "caption-led product emphasis",
      purpose: "product_emphasis"
    },
    {
      captionText:
        input.variantKey === "cta_heavy"
          ? `Strong CTA close: ${ctaText}`
          : `Close with CTA: ${ctaText}`,
      durationSeconds: 3,
      motionStyle:
        input.variantKey === "cta_heavy"
          ? "aggressive end-card transition"
          : "clean CTA close",
      purpose: "cta_close"
    }
  ]

  return baseScenes
}
