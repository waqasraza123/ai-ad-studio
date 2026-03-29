import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { submitPublicBatchReviewCommentAction } from "@/features/renders/actions/public-batch-review"
import type { PublicBatchReviewExport } from "@/server/database/types"

type PublicBatchReviewGridProps = {
  exports: PublicBatchReviewExport[]
  isReadOnly: boolean
  token: string
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

export function PublicBatchReviewGrid({
  exports,
  isReadOnly,
  token
}: PublicBatchReviewGridProps) {
  if (exports.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
        No exports are available for this review link yet.
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {exports.map((exportItem) => {
        const action = submitPublicBatchReviewCommentAction.bind(
          null,
          token,
          exportItem.export_id
        )

        return (
          <article
            key={exportItem.export_id}
            className={`overflow-hidden rounded-[2rem] border p-4 ${
              exportItem.is_winner
                ? "border-indigo-400/30 bg-indigo-500/10"
                : "border-white/10 bg-white/[0.04]"
            }`}
          >
            {exportItem.preview_data_url ? (
              <img
                alt={`${exportItem.variant_key} preview`}
                className="h-72 w-full rounded-[1.5rem] object-cover"
                src={exportItem.preview_data_url}
              />
            ) : (
              <div className="flex h-72 items-center justify-center rounded-[1.5rem] bg-white/[0.04] text-sm text-slate-400">
                Preview unavailable
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                {exportItem.variant_key}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                {exportItem.aspect_ratio}
              </span>
              <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">
                {exportItem.platform_preset}
              </span>
              {exportItem.is_winner ? (
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100">
                  Current internal winner
                </span>
              ) : null}
            </div>

            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
              {formatTimestamp(exportItem.created_at)}
            </p>

            {isReadOnly ? (
              <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
                Comments are locked because this review is closed.
              </div>
            ) : (
              <form action={action} className="mt-4 space-y-4">
                <input
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
                  name="author_label"
                  placeholder="Your name"
                />
                <textarea
                  className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
                  name="body"
                  placeholder="Comment on this export"
                />
                <FormSubmitButton pendingLabel="Posting comment…">
                  Comment on this output
                </FormSubmitButton>
              </form>
            )}
          </article>
        )
      })}
    </div>
  )
}
