import Link from "next/link"
import type {
  ExportAspectRatio,
  ExportRecord
} from "@/server/database/types"
import { SurfaceCard } from "@/components/primitives/surface-card"

type ProjectExportsPanelProps = {
  exports: ExportRecord[]
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

function getLatestByAspectRatio(exports: ExportRecord[]) {
  const latest = new Map<ExportAspectRatio, ExportRecord>()

  exports.forEach((exportRecord) => {
    if (!latest.has(exportRecord.aspect_ratio)) {
      latest.set(exportRecord.aspect_ratio, exportRecord)
    }
  })

  return latest
}

export function ProjectExportsPanel({ exports }: ProjectExportsPanelProps) {
  const latestByAspectRatio = getLatestByAspectRatio(exports)

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Project exports
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        Export history and format shortcuts
      </h2>

      {exports.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
          No exports for this project yet. Render the project to create downloadable outputs.
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            {Array.from(latestByAspectRatio.values()).map((exportRecord) => (
              <Link
                key={exportRecord.id}
                href={`/dashboard/exports/${exportRecord.id}`}
                className="inline-flex h-10 items-center justify-center rounded-full border border-amber-400/20 bg-amber-500/10 px-4 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
              >
                Latest {exportRecord.aspect_ratio}
              </Link>
            ))}
          </div>

          <div className="space-y-3">
            {exports.map((exportRecord) => (
              <Link
                key={exportRecord.id}
                href={`/dashboard/exports/${exportRecord.id}`}
                className="block rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {exportRecord.aspect_ratio} · {exportRecord.platform_preset}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {formatTimestamp(exportRecord.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                      {exportRecord.variant_key}
                    </span>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">
                      {exportRecord.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </SurfaceCard>
  )
}
