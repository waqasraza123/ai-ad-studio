export type ProjectStatus =
  | "draft"
  | "generating_concepts"
  | "concepts_ready"
  | "rendering"
  | "export_ready"
  | "failed"

export type ConceptStatus =
  | "planned"
  | "preview_generating"
  | "preview_ready"
  | "selected"
  | "render_queued"
  | "rendered"
  | "failed"

export type JobStatus =
  | "queued"
  | "running"
  | "waiting_provider"
  | "succeeded"
  | "failed"
  | "cancelled"

export type JobType =
  | "generate_concepts"
  | "generate_concept_preview"
  | "render_final_ad"
  | "cleanup_assets"

export type ProjectRecord = {
  id: string
  owner_id: string
  name: string
  status: ProjectStatus
  selected_concept_id: string | null
  created_at: string
  updated_at: string
}
