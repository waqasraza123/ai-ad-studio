import type {
  AdTemplateRecord,
  BrandKitRecord,
  PlatformPresetKey,
  PlatformRenderPackRecord,
  RenderVariantKey
} from "@/server/database/types"
import type { AppMessageKey } from "@/lib/i18n/messages/en"

export type ScenePlanItem = {
  captionText: string
  durationSeconds: number
  motionStyle: string
  purpose: "opener" | "product_emphasis" | "cta_close"
}

type Translate = (
  key: AppMessageKey,
  values?: Record<string, string | number | null | undefined>
) => string

function shorten(value: string, limit: number) {
  const normalized = value.trim()
  return normalized.length > limit ? `${normalized.slice(0, limit - 3)}...` : normalized
}

export function buildScenePlanPreview(input: {
  brandKit: BrandKitRecord | null
  callToAction: string | null
  hook: string
  platformPreset: PlatformPresetKey
  renderPack: PlatformRenderPackRecord | null
  script: string
  t: Translate
  template: AdTemplateRecord | null
  variantKey: RenderVariantKey
}) {
  const ctaText = input.callToAction?.trim() || input.t("projects.brief.placeholder.callToAction")
  const presetMotion =
    input.platformPreset === "youtube_landscape"
      ? input.t("renders.scenePlan.motion.landscapeFriendly")
      : input.platformPreset === "instagram_feed"
        ? input.t("renders.scenePlan.motion.squareSafe")
        : input.t("renders.scenePlan.motion.verticalFirst")

  const templateScenes = input.template?.scene_pack ?? []
  const brandAccent = input.brandKit?.palette.accent ?? "#22D3EE"
  const safeZone =
    input.renderPack
      ? input.t("renders.scenePlan.safeZone.custom", {
          bottom: input.renderPack.safe_zone.bottom,
          top: input.renderPack.safe_zone.top
        })
      : input.t("renders.scenePlan.safeZone.default")

  const defaultMotion = [
    input.variantKey === "caption_heavy"
      ? input.t("renders.scenePlan.defaultMotion.captionLead", {
          value: presetMotion
        })
      : input.t("renders.scenePlan.defaultMotion.heroReveal", {
          value: presetMotion
        }),
    input.variantKey === "default"
      ? input.t("renders.scenePlan.defaultMotion.productDetail", {
          value: presetMotion
        })
      : input.variantKey === "cta_heavy"
        ? input.t("renders.scenePlan.defaultMotion.conversionFocused", {
            value: presetMotion
          })
        : input.t("renders.scenePlan.defaultMotion.captionRich", {
            value: presetMotion
          }),
    input.variantKey === "cta_heavy"
      ? input.t("renders.scenePlan.defaultMotion.aggressiveCta", {
          value: presetMotion
        })
      : input.t("renders.scenePlan.defaultMotion.cleanCta", {
          value: presetMotion
        })
  ]

  return [
    {
      captionText: shorten(input.hook, input.variantKey === "caption_heavy" ? 86 : 70),
      durationSeconds: 3,
      motionStyle: `${templateScenes[0]?.motion_style ?? defaultMotion[0]} · accent ${brandAccent} · ${safeZone}`,
      purpose: "opener" as const
    },
    {
      captionText: shorten(
        input.variantKey === "cta_heavy" ? `${input.script} ${ctaText}` : input.script,
        input.variantKey === "caption_heavy" ? 98 : 76
      ),
      durationSeconds: 4,
      motionStyle: `${templateScenes[1]?.motion_style ?? defaultMotion[1]} · accent ${brandAccent} · ${safeZone}`,
      purpose: "product_emphasis" as const
    },
    {
      captionText:
        input.variantKey === "cta_heavy"
          ? input.t("renders.scenePlan.caption.strongCta", { value: ctaText })
          : input.t("renders.scenePlan.caption.closeWithCta", { value: ctaText }),
      durationSeconds: 3,
      motionStyle: `${templateScenes[2]?.motion_style ?? defaultMotion[2]} · accent ${brandAccent} · ${safeZone}`,
      purpose: "cta_close" as const
    }
  ]
}
