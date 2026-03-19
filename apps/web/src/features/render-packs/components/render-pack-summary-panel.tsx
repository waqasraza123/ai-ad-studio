import { SurfaceCard } from "@/components/primitives/surface-card"
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

export function RenderPackSummaryPanel({
  aspectRatio,
  platformPreset,
  renderPacks
}: RenderPackSummaryPanelProps) {
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
        Render pack
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        Platform-safe layout
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">
        Active render pack for {platformPreset} at {aspectRatio}. This controls safe zones,
        caption placement, and CTA timing during composition.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Safe zone</p>
          <p className="mt-2 text-sm font-medium text-white">
            T {currentPack.safe_zone.top} · R {currentPack.safe_zone.right} · B {currentPack.safe_zone.bottom} · L {currentPack.safe_zone.left}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Caption layout</p>
          <p className="mt-2 text-sm font-medium text-white">
            {currentPack.caption_layout.box_width} × {currentPack.caption_layout.box_height}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            x {currentPack.caption_layout.x} · y {currentPack.caption_layout.y} · font {currentPack.caption_layout.font_size}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">CTA timing</p>
          <p className="mt-2 text-sm font-medium text-white">
            start {currentPack.cta_timing.cta_start_seconds}s
          </p>
          <p className="mt-1 text-xs text-slate-500">
            duration {currentPack.cta_timing.cta_card_seconds}s
          </p>
        </div>
      </div>
    </SurfaceCard>
  )
}
