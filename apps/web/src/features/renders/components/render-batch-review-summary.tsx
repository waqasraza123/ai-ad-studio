import Link from "next/link"
import { SurfaceCard } from "@/components/primitives/surface-card"
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

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Pending"
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

export function RenderBatchReviewSummary({
  batch,
  exports,
  projectName,
  reviewLinks
}: RenderBatchReviewSummaryProps) {
  const winner =
    exports.find((exportRecord) => exportRecord.id === batch.winner_export_id) ?? null
  const finalizedExport =
    exports.find((exportRecord) => exportRecord.id === batch.finalized_export_id) ?? null

  const approvedCount = reviewLinks.filter((link) => link.response_status === "approved").length
  const rejectedCount = reviewLinks.filter((link) => link.response_status === "rejected").length
  const pendingCount = reviewLinks.filter((link) => link.response_status === "pending" && link.status === "active").length
  const closedCount = reviewLinks.filter((link) => link.status === "closed").length

  return (
    <SurfaceCard className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Batch review
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
            Compare outputs and choose a winner
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Review all outputs from this controlled batch side by side, store a decision note, and mark one export as the winner.
          </p>
        </div>

        <Link
          href={`/dashboard/projects/${batch.project_id}`}
          className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
        >
          Back to project
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-5">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Project</p>
          <p className="mt-2 text-sm font-medium text-white">{projectName}</p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Status</p>
          <p className="mt-2 text-sm font-medium text-white">{batch.status}</p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Preset</p>
          <p className="mt-2 text-sm font-medium text-white">{batch.platform_preset}</p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Outputs</p>
          <p className="mt-2 text-sm font-medium text-white">{exports.length}</p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Reviewed</p>
          <p className="mt-2 text-sm font-medium text-white">
            {formatTimestamp(batch.decided_at)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-5">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Current winner</p>
          <p className="mt-2 text-sm font-medium text-white">
            {winner
              ? `${winner.variant_key} · ${winner.aspect_ratio}`
              : "No winner selected yet"}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Canonical export</p>
          <p className="mt-2 text-sm font-medium text-white">
            {finalizedExport
              ? `${finalizedExport.variant_key} · ${finalizedExport.aspect_ratio}`
              : "Not finalized"}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-100">Approved</p>
          <p className="mt-2 text-sm font-medium text-white">{approvedCount}</p>
        </div>

        <div className="rounded-[1.5rem] border border-rose-400/20 bg-rose-500/10 p-4">
          <p className="text-sm text-rose-100">Rejected</p>
          <p className="mt-2 text-sm font-medium text-white">{rejectedCount}</p>
        </div>

        <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-100">Pending links</p>
          <p className="mt-2 text-sm font-medium text-white">{pendingCount}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Decision note</p>
          <p className="mt-2 text-sm leading-7 text-white">
            {batch.review_note ?? "No decision note yet."}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Final decision</p>
          <p className="mt-2 text-sm leading-7 text-white">
            {batch.finalization_note ?? "Batch is not finalized yet."}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
            finalized {formatTimestamp(batch.finalized_at)} · closed links {closedCount}
          </p>
        </div>
      </div>
    </SurfaceCard>
  )
}
