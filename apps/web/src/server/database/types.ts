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

export type AssetKind =
  | "product_image"
  | "logo"
  | "concept_preview"
  | "storyboard_frame"
  | "scene_video"
  | "voiceover_audio"
  | "export_video"

export type ProjectRecord = {
  id: string
  owner_id: string
  name: string
  status: ProjectStatus
  selected_concept_id: string | null
  created_at: string
  updated_at: string
}

export type ProjectInputRecord = {
  project_id: string
  owner_id: string
  product_name: string | null
  product_description: string | null
  offer_text: string | null
  call_to_action: string | null
  target_audience: string | null
  brand_tone: string | null
  visual_style: string | null
  duration_seconds: number
  aspect_ratio: string
  created_at: string
  updated_at: string
}

export type AssetRecord = {
  id: string
  project_id: string
  owner_id: string
  kind: AssetKind
  storage_key: string
  mime_type: string
  width: number | null
  height: number | null
  duration_ms: number | null
  metadata: Record<string, unknown>
  created_at: string
}
