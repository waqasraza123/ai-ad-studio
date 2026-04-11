import Link from "next/link"
import { SurfaceCard } from "@/components/primitives/surface-card"
import {
  getPlatformPresetLabelKey,
  getRenderBatchStatusLabelKey,
  getRenderVariantLabelKey
} from "@/features/renders/lib/render-ui"
import { getServerI18n } from "@/lib/i18n/server"
import type {
  BatchReviewLinkRecord,
  ExportRecord,
  RenderBatchRecord
} from "@/server/database/types"

type RenderBatchReviewSummaryProps = {
  batch: RenderBatchRecord
  exports: ExportRecord[]
  projectName: string
  reviewLinks: BatchReviewLinkRecord[]
}

export async function RenderBatchReviewSummary({
  batch,
  exports,
  projectName,
  reviewLinks
}: RenderBatchReviewSummaryProps) {
  const { formatDateTime, t } = await getServerI18n()
  const winner =
    exports.find((exportRecord) => exportRecord.id === batch.winner_export_id) ?? null
  const finalizedExport =
    exports.find((exportRecord) => exportRecord.id === batch.finalized_export_id) ?? null

  const approvedCount = reviewLinks.filter((link) => link.response_status === "approved").length
  const rejectedCount = reviewLinks.filter((link) => link.response_status === "rejected").length
  const pendingCount = reviewLinks.filter((link) => link.response_status === "pending" && link.status === "active").length
  const closedCount = reviewLinks.filter((link) => link.status === "closed").length
  const formatTimestamp = (value: string | null) =>
    value
      ? formatDateTime(value, { dateStyle: "medium", timeStyle: "short" })
      : t("common.status.pending")

  return (
    <SurfaceCard className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            {t("renders.reviewSummary.eyebrow")}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
            {t("renders.reviewSummary.title")}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            {t("renders.reviewSummary.description")}
          </p>
        </div>

        <Link
          href={`/dashboard/projects/${batch.project_id}`}
          className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
        >
          {t("renders.reviewSummary.backToProject")}
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-5">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("renders.reviewSummary.project")}</p>
          <p className="mt-2 text-sm font-medium text-white">{projectName}</p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("renders.reviewSummary.status")}</p>
          <p className="mt-2 text-sm font-medium text-white">{t(getRenderBatchStatusLabelKey(batch.status))}</p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("renders.reviewSummary.preset")}</p>
          <p className="mt-2 text-sm font-medium text-white">{t(getPlatformPresetLabelKey(batch.platform_preset))}</p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("renders.reviewSummary.outputs")}</p>
          <p className="mt-2 text-sm font-medium text-white">{exports.length}</p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("renders.reviewSummary.reviewed")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            {formatTimestamp(batch.decided_at)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-5">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("renders.reviewSummary.currentWinner")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            {winner
              ? `${t(getRenderVariantLabelKey(winner.variant_key))} · ${winner.aspect_ratio}`
              : t("renders.reviewSummary.noWinner")}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("renders.reviewSummary.canonicalExport")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            {finalizedExport
              ? `${t(getRenderVariantLabelKey(finalizedExport.variant_key))} · ${finalizedExport.aspect_ratio}`
              : t("renders.reviewSummary.notFinalized")}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-100">{t("renders.reviewSummary.approved")}</p>
          <p className="mt-2 text-sm font-medium text-white">{approvedCount}</p>
        </div>

        <div className="rounded-[1.5rem] border border-rose-400/20 bg-rose-500/10 p-4">
          <p className="text-sm text-rose-100">{t("renders.reviewSummary.rejected")}</p>
          <p className="mt-2 text-sm font-medium text-white">{rejectedCount}</p>
        </div>

        <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-100">{t("renders.reviewSummary.pendingLinks")}</p>
          <p className="mt-2 text-sm font-medium text-white">{pendingCount}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("renders.reviewSummary.decisionNote")}</p>
          <p className="mt-2 text-sm leading-7 text-white">
            {batch.review_note ?? t("renders.reviewSummary.noDecisionNote")}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("renders.reviewSummary.finalDecision")}</p>
          <p className="mt-2 text-sm leading-7 text-white">
            {batch.finalization_note ?? t("renders.reviewSummary.notFinalizedNote")}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
            {t("renders.reviewSummary.finalized", {
              value: formatTimestamp(batch.finalized_at)
            })}{" "}
            · {t("renders.reviewSummary.closedLinks", { count: closedCount })}
          </p>
        </div>
      </div>
    </SurfaceCard>
  )
}
