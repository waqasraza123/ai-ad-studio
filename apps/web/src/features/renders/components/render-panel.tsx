import Link from "next/link"
import { renderProjectAction } from "@/features/renders/actions/render-project"
import {
  getPlatformPresetDefinition,
  platformPresets
} from "@/features/renders/lib/platform-presets"
import type {
  PlatformPresetKey,
  RenderVariantKey
} from "@/server/database/types"
import type { ScenePlanItem } from "@/features/renders/lib/scene-plan"
import { Button } from "@/components/primitives/button"
import { SurfaceCard } from "@/components/primitives/surface-card"

type RenderPanelProps = {
  latestExportId: string | null
  platformPreset: PlatformPresetKey
  projectId: string
  renderJobDescription: string
  renderJobLabel: string
  selectedConceptTitle: string | null
  selectedVariantKey: RenderVariantKey
  scenePlan: ScenePlanItem[]
}

export function RenderPanel({
  latestExportId,
  platformPreset,
  projectId,
  renderJobDescription,
  renderJobLabel,
  scenePlan,
  selectedConceptTitle,
  selectedVariantKey
}: RenderPanelProps) {
  const action = renderProjectAction.bind(null, projectId)
  const isBlocked = renderJobLabel === "Queued" || renderJobLabel === "Running"
  const canRender = Boolean(selectedConceptTitle)
  const presetDefinition = getPlatformPresetDefinition(platformPreset)

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Final render
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
          Multi-format render pipeline
        </h2>
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
          {renderJobLabel}
        </span>
      </div>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {renderJobDescription}
      </p>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-slate-400">Selected concept</p>
        <p className="mt-2 text-sm font-medium text-white">
          {selectedConceptTitle ?? "No concept selected yet"}
        </p>
      </div>

      <form action={action} className="mt-6 space-y-5">
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Platform preset</span>
          <select
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-indigo-300/40"
            defaultValue={platformPreset}
            name="platformPreset"
          >
            {platformPresets.map((preset) => (
              <option key={preset.key} value={preset.key}>
                {preset.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">{presetDefinition.description}</p>
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Render variant</span>
          <select
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-indigo-300/40"
            defaultValue={selectedVariantKey}
            name="variantKey"
          >
            <option value="default">Default</option>
            <option value="caption_heavy">Caption heavy</option>
            <option value="cta_heavy">CTA heavy</option>
          </select>
        </label>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-medium text-white">Output formats</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {presetDefinition.aspectRatios.map((aspectRatio) => (
              <span
                key={aspectRatio}
                className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100"
              >
                {aspectRatio}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-medium text-white">Scene plan preview</p>
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

        <Button disabled={!canRender || isBlocked}>
          {!canRender
            ? "Select a concept first"
            : isBlocked
              ? "Render in progress"
              : "Render project"}
        </Button>
      </form>

      {latestExportId ? (
        <div className="mt-6">
          <Link
            href={`/dashboard/exports/${latestExportId}`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-indigo-400/20 bg-indigo-500/10 px-5 text-sm font-medium text-indigo-100 transition hover:bg-indigo-500/20"
          >
            Open latest export
          </Link>
        </div>
      ) : null}
    </SurfaceCard>
  )
}
