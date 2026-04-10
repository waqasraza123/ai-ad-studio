import Link from "next/link"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { startRenderBatchAction } from "@/features/renders/actions/start-render-batch"
import { getServerI18n } from "@/lib/i18n/server"
import type { RenderBatchRecord } from "@/server/database/types"

type RenderBatchPanelProps = {
  projectId: string
  renderBatches: RenderBatchRecord[]
  selectedConceptTitle: string | null
}

function statusClasses(status: RenderBatchRecord["status"]) {
  if (status === "ready") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
  }

  if (status === "failed") {
    return "border-rose-400/20 bg-rose-500/10 text-rose-100"
  }

  if (status === "rendering") {
    return "border-amber-400/20 bg-amber-500/10 text-amber-100"
  }

  return "border-white/10 bg-white/[0.05] text-slate-300"
}

export async function RenderBatchPanel({
  projectId,
  renderBatches,
  selectedConceptTitle
}: RenderBatchPanelProps) {
  const { formatDateTime, t } = await getServerI18n()
  const action = startRenderBatchAction.bind(null, projectId)
  const isBlocked = !selectedConceptTitle

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("renders.batchPanel.eyebrow")}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        {t("renders.batchPanel.title")}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">
        {t("renders.batchPanel.description")}
      </p>

      <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-slate-400">{t("renders.batchPanel.selectedConcept")}</p>
        <p className="mt-2 text-sm font-medium text-white">
          {selectedConceptTitle ?? t("renders.batchPanel.selectConceptFirst")}
        </p>
      </div>

      <form action={action} className="mt-6 space-y-6">
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">{t("renders.batchPanel.platformPreset")}</span>
          <select
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-indigo-300/40"
            defaultValue="default"
            disabled={isBlocked}
            name="platform_preset"
          >
            <option value="default">{t("renders.batchPanel.variant.default")}</option>
            <option value="instagram_reels">Instagram Reels</option>
            <option value="instagram_feed">Instagram Feed</option>
            <option value="youtube_shorts">YouTube Shorts</option>
            <option value="youtube_landscape">YouTube Landscape</option>
          </select>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-medium text-white">{t("renders.batchPanel.aspectRatios")}</p>
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input defaultChecked disabled={isBlocked} name="aspect_ratios" type="checkbox" value="9:16" />
                <span>9:16</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input disabled={isBlocked} name="aspect_ratios" type="checkbox" value="1:1" />
                <span>1:1</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input disabled={isBlocked} name="aspect_ratios" type="checkbox" value="16:9" />
                <span>16:9</span>
              </label>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-medium text-white">{t("renders.batchPanel.controlledVariants")}</p>
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input defaultChecked disabled={isBlocked} name="variant_keys" type="checkbox" value="default" />
                <span>{t("renders.batchPanel.variant.default")}</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input defaultChecked disabled={isBlocked} name="variant_keys" type="checkbox" value="caption_heavy" />
                <span>{t("renders.batchPanel.variant.captionHeavy")}</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input defaultChecked disabled={isBlocked} name="variant_keys" type="checkbox" value="cta_heavy" />
                <span>{t("renders.batchPanel.variant.ctaHeavy")}</span>
              </label>
            </div>
          </div>
        </div>

        <FormSubmitButton disabled={isBlocked} pendingLabel={t("renders.batchPanel.starting")}>
          {t("renders.batchPanel.startAction")}
        </FormSubmitButton>
      </form>

      <div className="mt-8 space-y-3">
        {renderBatches.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
            {t("renders.batchPanel.empty")}
          </div>
        ) : (
          renderBatches.map((batch) => (
            <div
              key={batch.id}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-white">
                      {batch.variant_keys.length} variants · {batch.aspect_ratios.join(", ")}
                    </p>
                    <span className={`rounded-full border px-3 py-1 text-xs ${statusClasses(batch.status)}`}>
                      {batch.status}
                    </span>
                    {batch.winner_export_id ? (
                      <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">
                        {t("renders.batchPanel.winnerSelected")}
                      </span>
                    ) : null}
                    {batch.is_finalized ? (
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100">
                        {t("renders.batchPanel.canonicalLocked")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    {batch.platform_preset} · {t("renders.batchPanel.exportsCount", {
                      count: batch.export_count
                    })}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                    {formatDateTime(batch.created_at, {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                    {batch.finalized_at
                      ? ` · ${t("renders.batchPanel.finalized", {
                          value: formatDateTime(batch.finalized_at, {
                            dateStyle: "medium",
                            timeStyle: "short"
                          })
                        })}`
                      : ""}
                  </p>
                  {batch.review_note ? (
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {batch.review_note}
                    </p>
                  ) : null}
                  {batch.finalization_note ? (
                    <p className="mt-3 text-sm leading-7 text-white">
                      {batch.finalization_note}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {batch.variant_keys.map((variantKey) => (
                    <span
                      key={variantKey}
                      className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300"
                    >
                      {variantKey}
                    </span>
                  ))}
                  <Link
                    href={`/dashboard/render-batches/${batch.id}`}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                  >
                    {t("renders.batchPanel.openReview")}
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </SurfaceCard>
  )
}
