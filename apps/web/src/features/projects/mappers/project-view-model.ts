import type {
  AssetRecord,
  ProjectInputRecord,
  ProjectRecord
} from "@/server/database/types"

type DateFormatter = (value: string) => string

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(new Date(value))
}

export function toProjectCardViewModel(
  project: ProjectRecord,
  formatDateValue: DateFormatter = formatTimestamp
) {
  return {
    createdAtLabel: formatDateValue(project.created_at),
    href: `/dashboard/projects/${project.id}`,
    id: project.id,
    name: project.name,
    status: project.status
  }
}

export function toProjectDetailSummary(input: {
  assets: AssetRecord[]
  formatDate?: DateFormatter
  project: ProjectRecord
  projectInput: ProjectInputRecord | null
}) {
  return {
    assetCount: input.assets.length,
    createdAtLabel: (input.formatDate ?? formatTimestamp)(input.project.created_at),
    durationLabel: `${input.projectInput?.duration_seconds ?? 10}s`,
    hasBrief:
      Boolean(input.projectInput?.product_name) ||
      Boolean(input.projectInput?.product_description) ||
      Boolean(input.projectInput?.offer_text),
    projectName: input.project.name,
    projectStatus: input.project.status
  }
}
