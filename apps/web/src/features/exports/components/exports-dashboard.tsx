import { ExportCard } from "./export-card"
import type {
  ExportAspectRatio,
  ExportRecord,
  ProjectRecord,
  PlatformPresetKey,
  RenderVariantKey
} from "@/server/database/types"

type ExportsDashboardProps = {
  exports: ExportRecord[]
  projectsById: Map<string, ProjectRecord>
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

function groupByProject(exports: ExportRecord[]) {
  const grouped = new Map<string, ExportRecord[]>()

  exports.forEach((exportRecord) => {
    const existing = grouped.get(exportRecord.project_id) ?? []
    existing.push(exportRecord)
    grouped.set(exportRecord.project_id, existing)
  })

  return grouped
}

function getLatestPerFormat(exports: ExportRecord[]) {
  const latest = new Map<ExportAspectRatio, ExportRecord>()

  exports.forEach((exportRecord) => {
    if (!latest.has(exportRecord.aspect_ratio)) {
      latest.set(exportRecord.aspect_ratio, exportRecord)
    }
  })

  return latest
}

export function ExportsDashboard({
  exports,
  projectsById
}: ExportsDashboardProps) {
  if (exports.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-sm text-slate-400">
        No exports yet. Render a project to start building export history.
      </div>
    )
  }

  const grouped = groupByProject(exports)

  return (
    <div className="space-y-8">
      {Array.from(grouped.entries()).map(([projectId, projectExports]) => {
        const project = projectsById.get(projectId)
        const latestPerFormat = getLatestPerFormat(projectExports)

        return (
          <section
            key={projectId}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                  Project exports
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
                  {project?.name ?? "Unknown project"}
                </h2>
                <p className="mt-3 text-sm text-slate-400">
                  {projectExports.length} export
                  {projectExports.length === 1 ? "" : "s"} generated
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {Array.from(latestPerFormat.values()).map((exportRecord) => (
                  <a
                    key={exportRecord.id}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 text-sm font-medium text-indigo-100 transition hover:bg-indigo-500/20"
                    href={`/dashboard/exports/${exportRecord.id}`}
                  >
                    Latest {exportRecord.aspect_ratio}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              {projectExports.map((exportRecord) => (
                <ExportCard
                  key={exportRecord.id}
                  aspectRatio={exportRecord.aspect_ratio as ExportAspectRatio}
                  createdAtLabel={formatTimestamp(exportRecord.created_at)}
                  exportId={exportRecord.id}
                  platformPreset={exportRecord.platform_preset as PlatformPresetKey}
                  projectName={project?.name ?? "Unknown project"}
                  variantKey={exportRecord.variant_key as RenderVariantKey}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
