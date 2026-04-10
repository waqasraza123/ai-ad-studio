import { getPublicEnvironment } from "@/lib/env"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getServerI18n } from "@/lib/i18n/server"
import {
  createBatchReviewLinkAction,
  revokeBatchReviewLinkAction
} from "@/features/renders/actions/manage-batch-review-links"
import type { BatchReviewLinkRecord, RenderBatchRecord } from "@/server/database/types"

type BatchReviewLinksPanelProps = {
  batch: RenderBatchRecord
  links: BatchReviewLinkRecord[]
}

function responseClasses(status: BatchReviewLinkRecord["response_status"]) {
  if (status === "approved") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
  }

  if (status === "rejected") {
    return "border-rose-400/20 bg-rose-500/10 text-rose-100"
  }

  return "border-white/10 bg-white/[0.05] text-slate-300"
}

function linkStateClasses(status: BatchReviewLinkRecord["status"]) {
  if (status === "closed") {
    return "border-indigo-400/20 bg-indigo-500/10 text-indigo-100"
  }

  if (status === "revoked") {
    return "border-rose-400/20 bg-rose-500/10 text-rose-100"
  }

  return "border-white/10 bg-white/[0.05] text-slate-300"
}

export async function BatchReviewLinksPanel({
  batch,
  links
}: BatchReviewLinksPanelProps) {
  const { formatDateTime, t } = await getServerI18n()
  const action = createBatchReviewLinkAction.bind(null, batch.id)
  const environment = getPublicEnvironment()

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("renders.links.eyebrow")}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        {t("renders.links.title")}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">
        {t("renders.links.description")}
      </p>

      {!batch.is_finalized ? (
        <form action={action} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">{t("renders.links.reviewerName")}</span>
            <input
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-indigo-300/40"
              name="reviewer_name"
              placeholder={t("renders.links.client")}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">{t("renders.links.reviewerEmail")}</span>
            <input
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-indigo-300/40"
              name="reviewer_email"
              placeholder="name@example.com"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">{t("renders.links.reviewerRole")}</span>
            <select
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-indigo-300/40"
              defaultValue="client"
              name="reviewer_role"
            >
              <option value="client">{t("renders.links.client")}</option>
              <option value="stakeholder">{t("renders.links.stakeholder")}</option>
              <option value="internal_reviewer">{t("renders.links.internalReviewer")}</option>
            </select>
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm text-slate-300">{t("renders.links.message")}</span>
            <textarea
              className="min-h-28 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
              defaultValue={t("renders.links.messageDefault")}
              name="message"
            />
          </label>

          <div className="md:col-span-2">
            <FormSubmitButton pendingLabel={t("renders.links.creating")}>
              {t("renders.links.create")}
            </FormSubmitButton>
          </div>
        </form>
      ) : (
        <div className="mt-6 rounded-[1.5rem] border border-indigo-400/20 bg-indigo-500/10 p-4 text-sm text-indigo-100">
          {t("renders.links.finalizedFrozen")}
        </div>
      )}

      <div className="mt-8 space-y-3">
        {links.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
            {t("renders.links.empty")}
          </div>
        ) : (
          links.map((link) => {
            const revokeAction = revokeBatchReviewLinkAction.bind(null, batch.id, link.id)
            const publicUrl = `${environment.NEXT_PUBLIC_APP_URL}/review/${link.token}`

            return (
              <div
                key={link.id}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-white">{link.reviewer_name}</p>
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                        {link.reviewer_role}
                      </span>
                      <span className={`rounded-full border px-3 py-1 text-xs ${responseClasses(link.response_status)}`}>
                        {link.response_status}
                      </span>
                      <span className={`rounded-full border px-3 py-1 text-xs ${linkStateClasses(link.status)}`}>
                        {link.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-300">
                      {link.reviewer_email ?? t("renders.links.noEmail")}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{link.message}</p>

                    {link.response_note ? (
                      <p className="mt-2 text-sm leading-7 text-white">{link.response_note}</p>
                    ) : null}

                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                      {t("renders.links.created", {
                        value: formatDateTime(link.created_at, {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })
                      })}
                      {link.responded_at
                        ? ` · ${t("renders.links.responded", {
                            value: formatDateTime(link.responded_at, {
                              dateStyle: "medium",
                              timeStyle: "short"
                            })
                          })}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {link.status !== "revoked" ? (
                      <a
                        className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                        href={publicUrl}
                      >
                        {t("renders.links.open")}
                      </a>
                    ) : null}

                    {link.status === "active" && !batch.is_finalized ? (
                      <form action={revokeAction}>
                        <FormSubmitButton
                          variant="secondary"
                          pendingLabel={t("renders.links.revoking")}
                        >
                          {t("renders.links.revoke")}
                        </FormSubmitButton>
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </SurfaceCard>
  )
}
