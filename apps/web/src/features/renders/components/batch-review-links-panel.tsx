import { getPublicEnvironment } from "@/lib/env"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
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

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

export function BatchReviewLinksPanel({
  batch,
  links
}: BatchReviewLinksPanelProps) {
  const action = createBatchReviewLinkAction.bind(null, batch.id)
  const environment = getPublicEnvironment()

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        External reviewers
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        Client review links
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">
        Invite clients or stakeholders to review this batch through a public link with approve, reject, and comment actions.
      </p>

      {!batch.is_finalized ? (
        <form action={action} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Reviewer name</span>
            <input
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-indigo-300/40"
              name="reviewer_name"
              placeholder="Client name"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Reviewer email</span>
            <input
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-indigo-300/40"
              name="reviewer_email"
              placeholder="name@example.com"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Reviewer role</span>
            <select
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-indigo-300/40"
              defaultValue="client"
              name="reviewer_role"
            >
              <option value="client">Client</option>
              <option value="stakeholder">Stakeholder</option>
              <option value="internal_reviewer">Internal reviewer</option>
            </select>
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm text-slate-300">Message</span>
            <textarea
              className="min-h-28 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
              defaultValue="Please review the batch outputs and leave your decision."
              name="message"
            />
          </label>

          <div className="md:col-span-2">
            <FormSubmitButton pendingLabel="Creating link…">Create review link</FormSubmitButton>
          </div>
        </form>
      ) : (
        <div className="mt-6 rounded-[1.5rem] border border-indigo-400/20 bg-indigo-500/10 p-4 text-sm text-indigo-100">
          This batch is finalized. External review is frozen and new review links can no longer be created.
        </div>
      )}

      <div className="mt-8 space-y-3">
        {links.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
            No external review links yet.
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
                      {link.reviewer_email ?? "No email provided"}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{link.message}</p>

                    {link.response_note ? (
                      <p className="mt-2 text-sm leading-7 text-white">{link.response_note}</p>
                    ) : null}

                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                      created {formatTimestamp(link.created_at)}
                      {link.responded_at ? ` · responded ${formatTimestamp(link.responded_at)}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {link.status !== "revoked" ? (
                      <a
                        className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                        href={publicUrl}
                      >
                        Open review link
                      </a>
                    ) : null}

                    {link.status === "active" && !batch.is_finalized ? (
                      <form action={revokeAction}>
                        <FormSubmitButton variant="secondary" pendingLabel="Revoking…">
                          Revoke
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
