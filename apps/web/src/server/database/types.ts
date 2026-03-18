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

export type RenderVariantKey = "default" | "caption_heavy" | "cta_heavy"
export type ExportAspectRatio = "9:16" | "1:1" | "16:9"
export type PlatformPresetKey =
  | "default"
  | "instagram_reels"
  | "instagram_feed"
  | "youtube_shorts"
  | "youtube_landscape"

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

export type ConceptRecord = {
  id: string
  project_id: string
  owner_id: string
  title: string
  angle: string
  hook: string
  script: string
  caption_style: string | null
  visual_direction: string | null
  status: ConceptStatus
  sort_order: number
  risk_flags: string[]
  safety_notes: string | null
  was_safety_modified: boolean
  created_at: string
  updated_at: string
}

export type JobRecord = {
  id: string
  project_id: string
  owner_id: string
  type: JobType
  status: JobStatus
  provider: string | null
  provider_job_id: string | null
  payload: Record<string, unknown>
  result: Record<string, unknown>
  error: Record<string, unknown>
  attempts: number
  max_attempts: number
  scheduled_at: string
  started_at: string | null
  finished_at: string | null
  heartbeat_at: string | null
  created_at: string
  updated_at: string
}

export type ExportRecord = {
  id: string
  project_id: string
  concept_id: string | null
  owner_id: string
  asset_id: string | null
  status: "queued" | "rendering" | "ready" | "failed"
  version: number
  variant_key: RenderVariantKey
  aspect_ratio: ExportAspectRatio
  platform_preset: PlatformPresetKey
  render_metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}
