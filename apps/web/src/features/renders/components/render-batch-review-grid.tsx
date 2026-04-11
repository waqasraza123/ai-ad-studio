import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { selectRenderBatchWinnerAction } from "@/features/renders/actions/select-render-batch-winner"
import {
  getPlatformPresetLabelKey,
  getRenderVariantLabelKey
} from "@/features/renders/lib/render-ui"
import { getServerI18n } from "@/lib/i18n/server"
import type {
  AssetRecord,
  ExportRecord,
  RenderBatchRecord
} from "@/server/database/types"

type RenderBatchReviewGridProps = {
  assetsById: Map<string, AssetRecord>
  batch: RenderBatchRecord
  exports: ExportRecord[]
}

function variantLabel(exportRecord: ExportRecord) {
  const batchVariantKey = exportRecord.render_metadata.batchVariantKey

  if (typeof batchVariantKey === "string") {
    return batchVariantKey
  }

  if (typeof exportRecord.render_metadata.variantKey === "string") {
    return String(exportRecord.render_metadata.variantKey)
  }

  return exportRecord.variant_key
}

export async function RenderBatchReviewGrid({
  assetsById,
  batch,
  exports
}: RenderBatchReviewGridProps) {
  const { formatDateTime, t } = await getServerI18n()
  if (exports.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
        {t("renders.reviewGrid.empty")}
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {exports.map((exportRecord) => {
        const asset = exportRecord.asset_id
          ? assetsById.get(exportRecord.asset_id) ?? null
          : null
        const previewDataUrl =
          asset && typeof asset.metadata.previewDataUrl === "string"
            ? asset.metadata.previewDataUrl
            : null
        const videoSrc =
          asset?.mime_type === "video/mp4"
            ? `/api/exports/${exportRecord.id}/download`
            : null
        const isWinner = batch.winner_export_id === exportRecord.id
        const isCanonical = batch.finalized_export_id === exportRecord.id
        const action = selectRenderBatchWinnerAction.bind(
          null,
          batch.id,
          exportRecord.id
        )

        return (
          <article
            key={exportRecord.id}
            className={`overflow-hidden rounded-[2rem] border p-4 ${
              isCanonical
                ? "border-emerald-400/30 bg-emerald-500/10"
                : isWinner
                  ? "border-indigo-400/30 bg-indigo-500/10"
                  : "border-white/10 bg-white/[0.04]"
            }`}
          >
            <div className="relative">
              {videoSrc ? (
                <video
                  className="h-72 w-full rounded-[1.5rem] object-cover"
                  controls
                  playsInline
                  poster={previewDataUrl ?? undefined}
                  preload="none"
                  src={videoSrc}
                />
              ) : previewDataUrl ? (
                <img
                  alt={String(
                    exportRecord.render_metadata.templateName ?? t("public.review.comments.export")
                  )}
                  className="h-72 w-full rounded-[1.5rem] object-cover"
                  decoding="async"
                  loading="lazy"
                  src={previewDataUrl}
                />
              ) : (
                <div className="flex h-72 items-center justify-center rounded-[1.5rem] bg-white/[0.04] text-sm text-slate-400">
                  {t("renders.reviewGrid.previewUnavailable")}
                </div>
              )}

              {isCanonical ? (
                <div className="absolute top-4 rounded-full border border-emerald-400/20 bg-emerald-500/90 px-3 py-1 text-xs font-medium text-white [inset-inline-start:1rem]">
                  {t("renders.reviewGrid.canonicalExport")}
                </div>
              ) : isWinner ? (
                <div className="absolute top-4 rounded-full border border-indigo-400/20 bg-indigo-500/90 px-3 py-1 text-xs font-medium text-white [inset-inline-start:1rem]">
                  {t("renders.reviewGrid.winner")}
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                {t(getRenderVariantLabelKey(variantLabel(exportRecord) as "default" | "caption_heavy" | "cta_heavy"))}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                {exportRecord.aspect_ratio}
              </span>
              <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">
                {t(getPlatformPresetLabelKey(exportRecord.platform_preset))}
              </span>
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">
              {formatDateTime(exportRecord.created_at, {
                dateStyle: "medium",
                timeStyle: "short"
              })}
            </p>

            {batch.is_finalized ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
                  {t("renders.reviewGrid.locked")}
                </div>
                <a
                  href={`/dashboard/exports/${exportRecord.id}`}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                >
                  {t("renders.reviewGrid.openExport")}
                </a>
              </div>
            ) : (
              <form action={action} className="mt-4 space-y-4">
                <textarea
                  className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
                  defaultValue={isWinner ? batch.review_note ?? "" : ""}
                  name="review_note"
                  placeholder={t("renders.reviewGrid.notePlaceholder")}
                />
                <div className="flex flex-wrap gap-2">
                  <FormSubmitButton pendingLabel={t("renders.reviewGrid.saving")}>
                    {isWinner
                      ? t("renders.reviewGrid.saveWinnerNote")
                      : t("renders.reviewGrid.selectWinner")}
                  </FormSubmitButton>
                  <a
                    href={`/dashboard/exports/${exportRecord.id}`}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                  >
                    {t("renders.reviewGrid.openExport")}
                  </a>
                </div>
              </form>
            )}
          </article>
        )
      })}
    </div>
  )
}
