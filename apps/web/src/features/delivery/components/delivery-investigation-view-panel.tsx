import Link from "next/link"
import { DeliveryInvestigationViewCopyButton } from "@/features/delivery/components/delivery-investigation-view-copy-button"
import {
  buildDeliveryInvestigationBaseHref,
  buildDeliveryInvestigationViewHref,
  hasPinnedDeliveryInvestigationContext,
  summarizeDeliveryInvestigationViewState,
  type DeliveryInvestigationViewState
} from "@/features/delivery/lib/delivery-investigation-view"

type DeliveryInvestigationViewPanelProps = {
  state: DeliveryInvestigationViewState
}

export function DeliveryInvestigationViewPanel({
  state
}: DeliveryInvestigationViewPanelProps) {
  const shareHref = buildDeliveryInvestigationViewHref(state)
  const clearHref = buildDeliveryInvestigationBaseHref(state)
  const summaryLabels = summarizeDeliveryInvestigationViewState(state)
  const hasPinnedContext = hasPinnedDeliveryInvestigationContext(state)

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-white">
            Investigation view
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Save or share this exact support investigation state as a single
            delivery dashboard URL.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200 transition hover:border-cyan-300/40 hover:bg-cyan-500/15"
            href={shareHref}
          >
            Open shareable view
          </Link>

          <DeliveryInvestigationViewCopyButton
            className="inline-flex items-center rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-200 transition hover:border-violet-300/40 hover:bg-violet-500/15"
            href={shareHref}
          />

          {hasPinnedContext ? (
            <Link
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06]"
              href={clearHref}
            >
              Clear pinned context
            </Link>
          ) : null}
        </div>
      </div>

      {summaryLabels.length === 0 ? (
        <div className="mt-4 rounded-[1rem] border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-400">
          No pinned investigation context yet. Apply support filters or focus a
          workspace to generate a shareable investigation view.
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {summaryLabels.map((label) => (
            <span
              key={label}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
