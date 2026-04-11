import Link from "next/link"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { finalizeRenderBatchAction } from "@/features/renders/actions/finalize-render-batch"
import { getServerI18n } from "@/lib/i18n/server"
import { getRenderVariantLabelKey } from "@/features/renders/lib/render-ui"
import type {
  ExportRecord,
  RenderBatchRecord
} from "@/server/database/types"

type FinalizeRenderBatchPanelProps = {
  batch: RenderBatchRecord
  exports: ExportRecord[]
}

export async function FinalizeRenderBatchPanel({
  batch,
  exports
}: FinalizeRenderBatchPanelProps) {
  const { formatDateTime, t } = await getServerI18n()
  const action = finalizeRenderBatchAction.bind(null, batch.id)
  const winner =
    exports.find((exportRecord) => exportRecord.id === batch.winner_export_id) ?? null
  const finalizedExport =
    exports.find((exportRecord) => exportRecord.id === batch.finalized_export_id) ?? null
  const formatTimestamp = (value: string | null) =>
    value
      ? formatDateTime(value, { dateStyle: "medium", timeStyle: "short" })
      : t("common.status.pending")

  if (batch.is_finalized) {
    return (
      <SurfaceCard className="p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          {t("renders.finalize.eyebrow")}
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
          {t("renders.finalize.lockedTitle")}
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          {t("renders.finalize.lockedDescription")}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4">
            <p className="text-sm text-emerald-100">{t("renders.finalize.finalizedExport")}</p>
            <p className="mt-2 text-sm font-medium text-white">
              {finalizedExport
                ? `${t(getRenderVariantLabelKey(finalizedExport.variant_key))} · ${finalizedExport.aspect_ratio}`
                : t("renders.finalize.unknownExport")}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-slate-400">{t("renders.finalize.finalizedAt")}</p>
            <p className="mt-2 text-sm font-medium text-white">
              {formatTimestamp(batch.finalized_at)}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-slate-400">{t("renders.finalize.reviewState")}</p>
            <p className="mt-2 text-sm font-medium text-white">{t("renders.finalize.locked")}</p>
          </div>
        </div>

        <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("renders.finalize.note")}</p>
          <p className="mt-2 text-sm leading-7 text-white">
            {batch.finalization_note ?? t("renders.finalize.noNote")}
          </p>
        </div>

        {finalizedExport ? (
          <div className="mt-4">
            <Link
              href={`/dashboard/exports/${finalizedExport.id}`}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
            >
              {t("renders.finalize.openCanonical")}
            </Link>
          </div>
        ) : null}
      </SurfaceCard>
    )
  }

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("renders.finalize.eyebrow")}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        {t("renders.finalize.title")}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">
        {t("renders.finalize.description")}
      </p>

      <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-slate-400">{t("renders.finalize.selectedWinner")}</p>
        <p className="mt-2 text-sm font-medium text-white">
          {winner
            ? `${t(getRenderVariantLabelKey(winner.variant_key))} · ${winner.aspect_ratio}`
            : t("renders.finalize.chooseWinnerFirst")}
        </p>
      </div>

      <form action={action} className="mt-6 space-y-4">
        <textarea
          className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
          name="finalization_note"
          placeholder={t("renders.finalize.placeholder")}
        />
        <FormSubmitButton disabled={!winner} pendingLabel={t("renders.finalize.pending")}>
          {t("renders.finalize.action")}
        </FormSubmitButton>
      </form>
    </SurfaceCard>
  )
}
