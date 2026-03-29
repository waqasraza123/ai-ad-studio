import { notFound } from "next/navigation"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { getFormErrorMessage } from "@/lib/form-error-messages"
import { submitPublicBatchReviewResponseAction } from "@/features/renders/actions/public-batch-review"
import { PublicBatchReviewComments } from "@/features/renders/components/public-batch-review-comments"
import { PublicBatchReviewGrid } from "@/features/renders/components/public-batch-review-grid"
import {
  getPublicBatchReviewLockMessage,
  getPublicBatchReviewWriteState
} from "@/features/renders/lib/public-batch-review-state"
import {
  getPublicBatchReviewContext,
  listPublicBatchReviewComments,
  listPublicBatchReviewExports
} from "@/server/batch-reviews/batch-review-repository"

type PublicBatchReviewPageProps = {
  params: Promise<{
    token: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function readSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key]

  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

function responseClasses(status: string) {
  if (status === "approved") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
  }

  if (status === "rejected") {
    return "border-rose-400/20 bg-rose-500/10 text-rose-100"
  }

  return "border-white/10 bg-white/[0.05] text-slate-300"
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Pending"
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

export default async function PublicBatchReviewPage({
  params,
  searchParams
}: PublicBatchReviewPageProps) {
  const { token } = await params
  const sp = await searchParams
  const formErrorMessage = getFormErrorMessage(readSearchParam(sp, "error"))

  const [context, exports, comments] = await Promise.all([
    getPublicBatchReviewContext(token),
    listPublicBatchReviewExports(token),
    listPublicBatchReviewComments(token)
  ])

  if (!context) {
    notFound()
  }

  const responseAction = submitPublicBatchReviewResponseAction.bind(null, token)
  const exportLabels = new Map(
    exports.map((exportItem) => [
      exportItem.export_id,
      `${exportItem.variant_key} · ${exportItem.aspect_ratio}`
    ] as const)
  )

  const writeState = getPublicBatchReviewWriteState({
    batchIsFinalized: context.batch_is_finalized,
    reviewLinkStatus: context.review_link_status
  })
  const lockMessage = getPublicBatchReviewLockMessage({
    finalizationNote: context.finalization_note,
    writeState
  })

  const decisionRecorded =
    context.response_status === "approved" || context.response_status === "rejected"

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_24rem),linear-gradient(180deg,#050816_0%,#0f172a_100%)] px-4 py-10 text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {formErrorMessage ? (
          <div className="rounded-[1.5rem] border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {formErrorMessage}
          </div>
        ) : null}
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                External batch review
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
                Review outputs for {context.project_name}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                {context.review_message}
              </p>
            </div>

            <div
              className={`rounded-full border px-4 py-2 text-sm ${responseClasses(context.response_status)}`}
            >
              {context.response_status}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Reviewer</p>
              <p className="mt-2 text-sm font-medium text-white">
                {context.reviewer_name}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Role</p>
              <p className="mt-2 text-sm font-medium text-white">
                {context.reviewer_role}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Outputs</p>
              <p className="mt-2 text-sm font-medium text-white">
                {exports.length}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Responded</p>
              <p className="mt-2 text-sm font-medium text-white">
                {formatTimestamp(context.responded_at)}
              </p>
            </div>
          </div>

          {decisionRecorded ? (
            <div className="mt-6 rounded-[1.5rem] border border-emerald-400/25 bg-emerald-500/10 p-4 text-sm text-emerald-50">
              <p className="font-medium text-white">Thank you — your decision is recorded.</p>
              <p className="mt-2 text-emerald-100/90">
                Outcome:{" "}
                <span className="font-semibold text-white">{context.response_status}</span>.
                {context.response_note ? (
                  <span className="mt-2 block text-emerald-100/85">
                    Note: {context.response_note}
                  </span>
                ) : null}
              </p>
            </div>
          ) : null}

          {writeState.isLocked ? (
            <div className="mt-6 rounded-[1.5rem] border border-indigo-400/20 bg-indigo-500/10 p-4 text-sm text-indigo-100">
              {lockMessage}
            </div>
          ) : decisionRecorded ? null : (
            <form
              action={responseAction}
              className="mt-6 grid gap-4 md:grid-cols-[0.35fr_1fr_auto]"
            >
              <label className="grid gap-2">
                <span className="text-sm text-slate-300">Decision</span>
                <select
                  className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-indigo-300/40"
                  defaultValue={
                    context.response_status === "pending"
                      ? "approved"
                      : context.response_status
                  }
                  name="response_status"
                >
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-slate-300">Decision note</span>
                <textarea
                  className="min-h-28 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
                  defaultValue={context.response_note ?? ""}
                  name="response_note"
                  placeholder="Share why you approve or reject this batch"
                />
              </label>

              <div className="flex items-end">
                <FormSubmitButton pendingLabel="Submitting…">Submit decision</FormSubmitButton>
              </div>
            </form>
          )}
        </section>

        <PublicBatchReviewGrid
          exports={exports}
          isReadOnly={writeState.isLocked}
          token={token}
        />
        <PublicBatchReviewComments comments={comments} exportLabels={exportLabels} />
      </div>
    </main>
  )
}
