import Link from "next/link"
import { getServerI18n } from "@/lib/i18n/server"
import { renderProjectAction } from "@/features/renders/actions/render-project"
import {
  getPlatformPresetDefinition,
  platformPresets
} from "@/features/renders/lib/platform-presets"
import {
  getPlatformPresetLabelKey,
  getRenderVariantLabelKey
} from "@/features/renders/lib/render-ui"
import type { AppMessageKey } from "@/lib/i18n/messages/en"
import type {
  PlatformPresetKey,
  RenderVariantKey
} from "@/server/database/types"
import type { ScenePlanItem } from "@/features/renders/lib/scene-plan"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"

type RenderPanelProps = {
  descriptionKey: AppMessageKey
  labelKey: AppMessageKey
  latestExportId: string | null
  platformPreset: PlatformPresetKey
  projectId: string
  selectedConceptTitle: string | null
  selectedVariantKey: RenderVariantKey
  scenePlan: ScenePlanItem[]
  status: "failed" | "idle" | "queued" | "ready" | "running" | "waiting"
}

export async function RenderPanel({
  descriptionKey,
  labelKey,
  latestExportId,
  platformPreset,
  projectId,
  scenePlan,
  selectedConceptTitle,
  selectedVariantKey,
  status
}: RenderPanelProps) {
  const { t } = await getServerI18n()
  const action = renderProjectAction.bind(null, projectId)
  const isBlocked = status === "queued" || status === "running"
  const canRender = Boolean(selectedConceptTitle)
  const presetDefinition = getPlatformPresetDefinition(platformPreset)

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("renders.panel.eyebrow")}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
          {t("renders.panel.title")}
        </h2>
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
          {t(labelKey)}
        </span>
      </div>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {t(descriptionKey)}
      </p>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-slate-400">{t("renders.panel.selectedConcept")}</p>
        <p className="mt-2 text-sm font-medium text-white">
          {selectedConceptTitle ?? t("renders.panel.noConceptSelected")}
        </p>
      </div>

      <form action={action} className="mt-6 space-y-5">
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">{t("renders.panel.platformPreset")}</span>
          <select
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-amber-300/40"
            defaultValue={platformPreset}
            name="platformPreset"
          >
            {platformPresets.map((preset) => (
              <option key={preset.key} value={preset.key}>
                {t(getPlatformPresetLabelKey(preset.key))}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">
            {t(presetDefinition.descriptionKey)}
          </p>
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">{t("renders.panel.renderVariant")}</span>
          <select
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-amber-300/40"
            defaultValue={selectedVariantKey}
            name="variantKey"
          >
            <option value="default">{t(getRenderVariantLabelKey("default"))}</option>
            <option value="caption_heavy">{t(getRenderVariantLabelKey("caption_heavy"))}</option>
            <option value="cta_heavy">{t(getRenderVariantLabelKey("cta_heavy"))}</option>
          </select>
        </label>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-medium text-white">{t("renders.panel.outputFormats")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {presetDefinition.aspectRatios.map((aspectRatio) => (
              <span
                key={aspectRatio}
                className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-100"
              >
                {aspectRatio}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-medium text-white">{t("renders.panel.scenePlanPreview")}</p>
          <div className="mt-4 space-y-3">
            {scenePlan.map((scene) => (
              <div
                key={`${scene.purpose}-${scene.durationSeconds}`}
                className="rounded-2xl border border-white/10 bg-black/10 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-white">{scene.purpose}</p>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-slate-300">
                    {scene.durationSeconds}s
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-300">{scene.captionText}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {scene.motionStyle}
                </p>
              </div>
            ))}
          </div>
        </div>

        <FormSubmitButton
          disabled={!canRender || isBlocked}
          pendingLabel={t("renders.panel.pending")}
        >
          {!canRender
            ? t("renders.panel.selectConceptFirst")
            : isBlocked
              ? t("renders.panel.inProgress")
              : t("renders.panel.action")}
        </FormSubmitButton>
      </form>

      {latestExportId ? (
        <div className="mt-6">
          <Link
            href={`/dashboard/exports/${latestExportId}`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-amber-400/20 bg-amber-500/10 px-5 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
          >
            {t("renders.panel.openLatestExport")}
          </Link>
        </div>
      ) : null}
    </SurfaceCard>
  )
}
