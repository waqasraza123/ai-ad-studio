import Link from "next/link"
import { Button } from "@/components/primitives/button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { finalizeRenderBatchAction } from "@/features/renders/actions/finalize-render-batch"
import type {
  ExportRecord,
  RenderBatchRecord
} from "@/server/database/types"

type FinalizeRenderBatchPanelProps = {
  batch: RenderBatchRecord
  exports: ExportRecord[]
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

export function FinalizeRenderBatchPanel({
  batch,
  exports
}: FinalizeRenderBatchPanelProps) {
  const action = finalizeRenderBatchAction.bind(null, batch.id)
  const winner =
    exports.find((exportRecord) => exportRecord.id === batch.winner_export_id) ?? null
  const finalizedExport =
    exports.find((exportRecord) => exportRecord.id === batch.finalized_export_id) ?? null

  if (batch.is_finalized) {
    return (
      <SurfaceCard className="p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          Final decision
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
          Canonical export locked
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          This batch is finalized. External review is frozen and the canonical export is now used for future public promotion.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4">
            <p className="text-sm text-emerald-100">Finalized export</p>
            <p className="mt-2 text-sm font-medium text-white">
              {finalizedExport
                ? `${finalizedExport.variant_key} · ${finalizedExport.aspect_ratio}`
                : "Unknown export"}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-slate-400">Finalized at</p>
            <p className="mt-2 text-sm font-medium text-white">
              {formatTimestamp(batch.finalized_at)}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-slate-400">Review state</p>
            <p className="mt-2 text-sm font-medium text-white">Locked</p>
          </div>
        </div>

        <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Finalization note</p>
          <p className="mt-2 text-sm leading-7 text-white">
            {batch.finalization_note ?? "No finalization note was added."}
          </p>
        </div>

        {finalizedExport ? (
          <div className="mt-4">
            <Link
              href={`/dashboard/exports/${finalizedExport.id}`}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
            >
              Open canonical export
            </Link>
          </div>
        ) : null}
      </SurfaceCard>
    )
  }

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Final decision
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        Lock reviewed winner
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">
        Finalizing this batch freezes public review and marks the winning export as the canonical asset for campaigns and showcase.
      </p>

      <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-slate-400">Selected winner</p>
        <p className="mt-2 text-sm font-medium text-white">
          {winner ? `${winner.variant_key} · ${winner.aspect_ratio}` : "Choose a winner first"}
        </p>
      </div>

      <form action={action} className="mt-6 space-y-4">
        <textarea
          className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
          name="finalization_note"
          placeholder="Why this export is the final canonical decision"
        />
        <Button disabled={!winner}>Finalize canonical export</Button>
      </form>
    </SurfaceCard>
  )
}
