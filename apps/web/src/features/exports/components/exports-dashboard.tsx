import { ExportCard } from "./export-card"
import { getServerI18n } from "@/lib/i18n/server"
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

export async function ExportsDashboard({
  exports,
  projectsById
}: ExportsDashboardProps) {
  const { formatDateTime, t } = await getServerI18n()
  if (exports.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-sm text-slate-400">
        {t("exports.dashboard.empty")}
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
                  {t("exports.dashboard.eyebrow")}
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
                  {project?.name ?? t("exports.dashboard.unknownProject")}
                </h2>
                <p className="mt-3 text-sm text-slate-400">
                  {t("exports.dashboard.generatedCount", {
                    count: projectExports.length
                  })}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {Array.from(latestPerFormat.values()).map((exportRecord) => (
                  <a
                    key={exportRecord.id}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-amber-400/20 bg-amber-500/10 px-4 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
                    href={`/dashboard/exports/${exportRecord.id}`}
                  >
                    {t("exports.dashboard.latestAspectRatio", {
                      value: exportRecord.aspect_ratio
                    })}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              {projectExports.map((exportRecord) => (
                <ExportCard
                  key={exportRecord.id}
                  aspectRatio={exportRecord.aspect_ratio as ExportAspectRatio}
                  createdAtLabel={formatDateTime(exportRecord.created_at, {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })}
                  exportId={exportRecord.id}
                  platformPreset={exportRecord.platform_preset as PlatformPresetKey}
                  projectName={project?.name ?? t("exports.dashboard.unknownProject")}
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
