import { notFound } from "next/navigation"
import { PublicPageHeader } from "@/components/i18n/public-page-header"
import { PublicPageFrame } from "@/components/layout/page-frame"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { getFormErrorMessage } from "@/lib/form-error-messages"
import { getServerI18n } from "@/lib/i18n/server"
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

  return "border-[var(--border)] bg-[var(--background-soft)] text-[var(--soft-foreground)]"
}

function formatTimestamp(
  formatDateTime: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string,
  value: string | null,
  pendingLabel: string
) {
  if (!value) {
    return pendingLabel
  }

  return formatDateTime(new Date(value), {
    dateStyle: "medium",
    timeStyle: "short"
  })
}

export default async function PublicBatchReviewPage({
  params,
  searchParams
}: PublicBatchReviewPageProps) {
  const { formatDateTime, t } = await getServerI18n()
  const { token } = await params
  const sp = await searchParams
  const formErrorMessage = getFormErrorMessage(readSearchParam(sp, "error"), t)

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
    <main className="theme-page-shell min-h-screen text-[var(--foreground)]">
      <PublicPageHeader />
      <PublicPageFrame variant="wide" className="space-y-6">
        {formErrorMessage ? (
          <div className="rounded-[1.5rem] border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {formErrorMessage}
          </div>
        ) : null}
        <section className="theme-surface-card rounded-[2rem] border p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                {t("public.review.eyebrow")}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                {t("public.review.title", { projectName: context.project_name })}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted-foreground)]">
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
            <div className="theme-soft-panel rounded-[1.5rem] border p-4">
              <p className="text-sm text-[var(--muted-foreground)]">{t("common.words.reviewer")}</p>
              <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                {context.reviewer_name}
              </p>
            </div>

            <div className="theme-soft-panel rounded-[1.5rem] border p-4">
              <p className="text-sm text-[var(--muted-foreground)]">{t("common.words.role")}</p>
              <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                {context.reviewer_role}
              </p>
            </div>

            <div className="theme-soft-panel rounded-[1.5rem] border p-4">
              <p className="text-sm text-[var(--muted-foreground)]">{t("common.words.outputs")}</p>
              <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                {exports.length}
              </p>
            </div>

            <div className="theme-soft-panel rounded-[1.5rem] border p-4">
              <p className="text-sm text-[var(--muted-foreground)]">{t("common.words.responded")}</p>
              <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                {formatTimestamp(formatDateTime, context.responded_at, t("common.status.pending"))}
              </p>
            </div>
          </div>

          {decisionRecorded ? (
            <div className="mt-6 rounded-[1.5rem] border border-emerald-400/25 bg-emerald-500/10 p-4 text-sm text-emerald-50">
              <p className="font-medium text-[var(--foreground)]">
                {t("public.review.recordedTitle")}
              </p>
              <p className="mt-2 text-emerald-100/90">
                {t("public.review.outcome", { value: context.response_status })}
                {context.response_note ? (
                  <span className="mt-2 block text-emerald-100/85">
                    {t("public.review.note", { value: context.response_note })}
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
                <span className="text-sm text-[var(--soft-foreground)]">{t("common.words.decision")}</span>
                <select
                  className="theme-form-input h-11 rounded-2xl border px-4"
                  defaultValue={
                    context.response_status === "pending"
                      ? "approved"
                      : context.response_status
                  }
                  name="response_status"
                >
                  <option value="approved">{t("public.review.decision.approve")}</option>
                  <option value="rejected">{t("public.review.decision.reject")}</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-[var(--soft-foreground)]">{t("common.words.decisionNote")}</span>
                <textarea
                  dir="auto"
                  className="theme-form-input min-h-28 rounded-2xl border px-4 py-3 text-sm"
                  defaultValue={context.response_note ?? ""}
                  name="response_note"
                  placeholder={t("public.review.placeholder")}
                />
              </label>

              <div className="flex items-end">
                <FormSubmitButton pendingLabel={t("public.review.submitPending")}>
                  {t("public.review.submit")}
                </FormSubmitButton>
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
      </PublicPageFrame>
    </main>
  )
}
