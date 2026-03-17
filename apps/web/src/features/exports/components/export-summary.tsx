import { SurfaceCard } from "@/components/primitives/surface-card"

type ExportSummaryProps = {
  createdAtLabel: string
  downloadHref: string | null
  projectName: string
  previewDataUrl: string | null
  status: string
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
  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Export detail
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
        {projectName}
      </h2>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04]">
        {videoSrc ? (
          <video
            className="aspect-video w-full bg-slate-950"
            controls
            playsInline
            preload="metadata"
            src={videoSrc}
          />
        ) : previewDataUrl ? (
          <img
            alt={`${projectName} export preview`}
            className="aspect-video w-full object-cover"
            src={previewDataUrl}
          />
        ) : (
          <div className="grid aspect-video place-items-center text-sm text-slate-400">
            Export preview not available yet
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Status</p>
          <p className="mt-2 text-sm font-medium text-white">{status}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Created</p>
          <p className="mt-2 text-sm font-medium text-white">{createdAtLabel}</p>
        </div>
      </div>

      {downloadHref ? (
        <div className="mt-6">
          <a
            className="inline-flex h-11 items-center justify-center rounded-full border border-indigo-400/20 bg-indigo-500/10 px-5 text-sm font-medium text-indigo-100 transition hover:bg-indigo-500/20"
            href={downloadHref}
          >
            Open video asset
          </a>
        </div>
      ) : null}
    </SurfaceCard>
  )
}
