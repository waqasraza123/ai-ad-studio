import { SurfaceCard } from "@/components/primitives/surface-card"
import { getServerI18n } from "@/lib/i18n/server"
import { getPlatformPresetLabelKey } from "@/features/renders/lib/render-ui"
import type {
  ExportAspectRatio,
  PlatformPresetKey,
  PlatformRenderPackRecord
} from "@/server/database/types"

type RenderPackSummaryPanelProps = {
  aspectRatio: ExportAspectRatio
  platformPreset: PlatformPresetKey
  renderPacks: PlatformRenderPackRecord[]
}

export async function RenderPackSummaryPanel({
  aspectRatio,
  platformPreset,
  renderPacks
}: RenderPackSummaryPanelProps) {
  const { t } = await getServerI18n()
  const currentPack =
    renderPacks.find(
      (pack) =>
        pack.platform_preset === platformPreset && pack.aspect_ratio === aspectRatio
    ) ??
    renderPacks.find(
      (pack) => pack.platform_preset === "default" && pack.aspect_ratio === aspectRatio
    ) ??
    null

  if (!currentPack) {
    return null
  }

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("renderPack.summary.eyebrow")}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        {t("renderPack.summary.title")}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">
        {t("renderPack.summary.description", {
          aspectRatio,
          platformPreset: t(getPlatformPresetLabelKey(platformPreset))
        })}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("renderPack.summary.safeZone")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            T {currentPack.safe_zone.top} · R {currentPack.safe_zone.right} · B {currentPack.safe_zone.bottom} · L {currentPack.safe_zone.left}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("renderPack.summary.captionLayout")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            {currentPack.caption_layout.box_width} × {currentPack.caption_layout.box_height}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {t("renderPack.summary.captionLayoutPosition", {
              font: currentPack.caption_layout.font_size,
              x: currentPack.caption_layout.x,
              y: currentPack.caption_layout.y
            })}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("renderPack.summary.ctaTiming")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            {t("renderPack.summary.ctaStart", {
              value: currentPack.cta_timing.cta_start_seconds
            })}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {t("renderPack.summary.ctaDuration", {
              value: currentPack.cta_timing.cta_card_seconds
            })}
          </p>
        </div>
      </div>
    </SurfaceCard>
  )
}
