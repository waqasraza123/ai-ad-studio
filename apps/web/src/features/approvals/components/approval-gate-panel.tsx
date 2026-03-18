import type { ApprovalRecord, ConceptRecord } from "@/server/database/types"
import {
  approveRenderAction,
  rejectRenderAction
} from "@/features/approvals/actions/decide-approval"
import { Button } from "@/components/primitives/button"
import { SurfaceCard } from "@/components/primitives/surface-card"

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

export function ApprovalGatePanel({
  approval,
  selectedConcept
}: ApprovalGatePanelProps) {
  if (!approval) {
    return null
  }

  const approveAction = approveRenderAction.bind(null, approval.job_id)
  const rejectAction = rejectRenderAction.bind(null, approval.job_id)
  const isPending = approval.status === "pending"

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Approval gate
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
          Final render approval
        </h2>
        <span
          className={`rounded-full border px-3 py-1 text-xs ${statusClasses(approval.status)}`}
        >
          {approval.status}
        </span>
      </div>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        Expensive final renders now require human approval before the worker is
        allowed to continue.
      </p>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-slate-400">Selected concept</p>
        <p className="mt-2 text-sm font-medium text-white">
          {selectedConcept?.title ?? "Unknown concept"}
        </p>
        <p className="mt-2 text-sm text-slate-300">
          {selectedConcept?.hook ?? "No hook available"}
        </p>
      </div>

      {approval.decision_note ? (
        <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Decision note</p>
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
              placeholder="Optional approval note"
            />
            <Button>Approve render</Button>
          </form>

          <form action={rejectAction} className="space-y-4">
            <textarea
              className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
              name="decision_note"
              placeholder="Reason for rejection"
            />
            <Button variant="secondary">Reject render</Button>
          </form>
        </div>
      ) : null}
    </SurfaceCard>
  )
}
