import { SurfaceCard } from "@/components/primitives/surface-card"
import { getServerI18n } from "@/lib/i18n/server"
import type { BatchReviewCommentRecord, ExportRecord } from "@/server/database/types"

type BatchReviewCommentsPanelProps = {
  comments: BatchReviewCommentRecord[]
  exports: ExportRecord[]
}

function exportLabel(
  exportId: string | null,
  exports: ExportRecord[],
  fallbackLabel: string,
  unknownLabel: string
) {
  if (!exportId) {
    return fallbackLabel
  }

  const exportRecord = exports.find((item) => item.id === exportId)

  if (!exportRecord) {
    return unknownLabel
  }

  return `${exportRecord.variant_key} · ${exportRecord.aspect_ratio}`
}

export async function BatchReviewCommentsPanel({
  comments,
  exports
}: BatchReviewCommentsPanelProps) {
  const { formatDateTime, t } = await getServerI18n()
  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("renders.commentsPanel.eyebrow")}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        {t("renders.commentsPanel.title")}
      </h2>

      <div className="mt-6 space-y-3">
        {comments.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
            {t("renders.commentsPanel.empty")}
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-white">{comment.author_label}</p>
                {comment.reviewer_role ? (
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                    {comment.reviewer_role}
                  </span>
                ) : null}
                <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">
                  {exportLabel(
                    comment.export_id,
                    exports,
                    t("renders.commentsPanel.batchWide"),
                    t("renders.commentsPanel.unknownExport")
                  )}
                </span>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-200">{comment.body}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                {formatDateTime(comment.created_at, {
                  dateStyle: "medium",
                  timeStyle: "short"
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </SurfaceCard>
  )
}
