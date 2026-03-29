import { ExportMediaFrame } from "@/components/media/export-media-frame"
import { SurfaceCard } from "@/components/primitives/surface-card"
import {
  exportStatusIsInProgress,
  formatExportStatusLabel,
  type ExportWorkflowStatus
} from "@/features/exports/lib/export-status-ui"

type ExportSummaryProps = {
  createdAtLabel: string
  downloadHref: string | null
  projectName: string
  previewDataUrl: string | null
  status: ExportWorkflowStatus
  videoSrc: string | null
}

export function ExportSummary({
  createdAtLabel,
  downloadHref,
  projectName,
  previewDataUrl,
  status,
  videoSrc
}: ExportSummaryProps) {
  const inProgress = exportStatusIsInProgress(status)

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Export detail
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
        {projectName}
      </h2>

      <div
        className={`mt-6 overflow-hidden rounded-[1.5rem] border bg-white/[0.04] ${
          inProgress
            ? "border-amber-400/35 shadow-[0_0_28px_rgba(251,146,60,0.1)]"
            : "border-white/10"
        }`}
      >
        <ExportMediaFrame
          previewDataUrl={previewDataUrl}
          projectName={projectName}
          videoSrc={videoSrc}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div
          className={`rounded-[1.5rem] border p-4 ${
            inProgress
              ? "border-amber-400/30 bg-amber-500/[0.07]"
              : "border-white/10 bg-white/[0.04]"
          }`}
        >
          <p className="text-sm text-slate-400">Status</p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-white">
            <span>{formatExportStatusLabel(status)}</span>
            {inProgress ? (
              <span className="rounded-full border border-amber-400/35 bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-100">
                Checking for updates…
              </span>
            ) : null}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Created</p>
          <p className="mt-2 text-sm font-medium text-white">{createdAtLabel}</p>
        </div>
      </div>

      {downloadHref ? (
        <div className="mt-6">
          <a
            className="inline-flex h-11 items-center justify-center rounded-full border border-amber-400/20 bg-amber-500/10 px-5 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
            href={downloadHref}
          >
            Open video asset
          </a>
        </div>
      ) : null}
    </SurfaceCard>
  )
}
