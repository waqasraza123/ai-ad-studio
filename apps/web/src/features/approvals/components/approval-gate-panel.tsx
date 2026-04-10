import type { ApprovalRecord, ConceptRecord } from "@/server/database/types"
import {
  approveRenderAction,
  rejectRenderAction
} from "@/features/approvals/actions/decide-approval"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getServerI18n } from "@/lib/i18n/server"
import type { AppMessageKey } from "@/lib/i18n/messages/en"

type ApprovalGatePanelProps = {
  approval: ApprovalRecord | null
  selectedConcept: ConceptRecord | null
}

function statusClasses(status: ApprovalRecord["status"]) {
  if (status === "approved") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
  }

  if (status === "rejected") {
    return "border-rose-400/20 bg-rose-500/10 text-rose-100"
  }

  return "border-amber-400/20 bg-amber-500/10 text-amber-100"
}

function getStatusLabelKey(status: ApprovalRecord["status"]): AppMessageKey {
  if (status === "approved") {
    return "common.status.approved"
  }

  if (status === "rejected") {
    return "common.status.rejected"
  }

  return "common.status.pending"
}

export async function ApprovalGatePanel({
  approval,
  selectedConcept
}: ApprovalGatePanelProps) {
  const { t } = await getServerI18n()
  if (!approval) {
    return null
  }

  const approveAction = approveRenderAction.bind(null, approval.job_id)
  const rejectAction = rejectRenderAction.bind(null, approval.job_id)
  const isPending = approval.status === "pending"

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("approvals.gate.eyebrow")}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
          {t("approvals.gate.title")}
        </h2>
        <span
          className={`rounded-full border px-3 py-1 text-xs ${statusClasses(approval.status)}`}
        >
          {t(getStatusLabelKey(approval.status))}
        </span>
      </div>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {t("approvals.gate.description")}
      </p>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-slate-400">{t("approvals.gate.selectedConcept")}</p>
        <p className="mt-2 text-sm font-medium text-white">
          {selectedConcept?.title ?? t("approvals.gate.unknownConcept")}
        </p>
        <p className="mt-2 text-sm text-slate-300">
          {selectedConcept?.hook ?? t("approvals.gate.noHook")}
        </p>
      </div>

      {approval.decision_note ? (
        <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("approvals.gate.decisionNote")}</p>
          <p className="mt-2 text-sm leading-7 text-white">
            {approval.decision_note}
          </p>
        </div>
      ) : null}

      {isPending ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <form action={approveAction} className="space-y-4">
            <textarea
              className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
              name="decision_note"
              placeholder={t("approvals.gate.approvalPlaceholder")}
            />
            <FormSubmitButton pendingLabel={t("approvals.gate.approvePending")}>
              {t("approvals.gate.approveAction")}
            </FormSubmitButton>
          </form>

          <form action={rejectAction} className="space-y-4">
            <textarea
              className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
              name="decision_note"
              placeholder={t("approvals.gate.rejectionPlaceholder")}
            />
            <FormSubmitButton variant="secondary" pendingLabel={t("approvals.gate.rejectPending")}>
              {t("approvals.gate.rejectAction")}
            </FormSubmitButton>
          </form>
        </div>
      ) : null}
    </SurfaceCard>
  )
}
