import type {
  AssetRecord,
  ProjectInputRecord,
  ProjectRecord
} from "@/server/database/types"

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(new Date(value))
}

export function toProjectCardViewModel(project: ProjectRecord) {
  return {
    createdAtLabel: formatTimestamp(project.created_at),
    href: `/dashboard/projects/${project.id}`,
    id: project.id,
    name: project.name,
    status: project.status
  }
}

export function toProjectDetailSummary(input: {
  assets: AssetRecord[]
  project: ProjectRecord
  projectInput: ProjectInputRecord | null
}) {
  return {
    assetCount: input.assets.length,
    createdAtLabel: formatTimestamp(input.project.created_at),
    durationLabel: `${input.projectInput?.duration_seconds ?? 10}s`,
    hasBrief:
      Boolean(input.projectInput?.product_name) ||
      Boolean(input.projectInput?.product_description) ||
      Boolean(input.projectInput?.offer_text),
    projectName: input.project.name,
    projectStatus: input.project.status
  }
}
