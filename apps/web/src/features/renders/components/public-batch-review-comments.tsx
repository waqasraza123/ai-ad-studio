type PublicBatchReviewCommentsProps = {
  comments: Array<{
    comment_id: string
    export_id: string | null
    author_label: string
    reviewer_role: string | null
    body: string
    created_at: string
  }>
  exportLabels: Map<string, string>
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

export function PublicBatchReviewComments({
  comments,
  exportLabels
}: PublicBatchReviewCommentsProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Review activity
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        Comments and decisions
      </h2>

      <div className="mt-6 space-y-3">
        {comments.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
            No comments yet.
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.comment_id}
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
                  {comment.export_id ? exportLabels.get(comment.export_id) ?? "Export" : "Batch-wide"}
                </span>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-200">{comment.body}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                {formatTimestamp(comment.created_at)}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
