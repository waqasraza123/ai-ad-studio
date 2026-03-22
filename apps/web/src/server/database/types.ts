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

export type NotificationSeverity = "info" | "success" | "warning" | "error"
export type ApprovalStatus = "pending" | "approved" | "rejected"
export type ReviewerRole = "client" | "stakeholder" | "internal_reviewer"
export type ExternalReviewStatus = "pending" | "approved" | "rejected"

export type TemplateScenePackItem = {
  purpose: "opener" | "product_emphasis" | "cta_close"
  motion_style: string
  visual_style: string
  caption_tone: string
}

export type TemplateCtaPreset = {
  headline_prefix: string
  subheadline_text: string
  emphasis_style: "clean" | "bold" | "minimal"
}

export type BrandKitPalette = {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
}

export type BrandKitTypography = {
  heading_family: string
  body_family: string
  headline_weight: string
  body_weight: string
  letter_spacing: string
}

export type RenderSafeZone = {
  top: number
  right: number
  bottom: number
  left: number
}

export type CaptionLayoutPreset = {
  box_width: number
  box_height: number
  x: number
  y: number
  font_size: number
}

export type CtaTimingPreset = {
  cta_card_seconds: number
  cta_start_seconds: number
}

export type DeliveryApprovalSummary = {
  approved_count: number
  rejected_count: number
  pending_count: number
  responded_count: number
  review_note: string | null
  finalization_note: string | null
  decided_at: string | null
  finalized_at: string | null
}

export type DeliveryFollowUpStatus =
  | "none"
  | "needs_follow_up"
  | "reminder_scheduled"
  | "waiting_on_client"
  | "resolved"


export type ProjectRecord = {
  id: string
  owner_id: string
  name: string
  status: ProjectStatus
  selected_concept_id: string | null
  template_id: string | null
  brand_kit_id: string | null
  canonical_export_id: string | null
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
  next_attempt_at: string
  cancel_requested_at: string | null
  cancel_reason: string | null
  started_at: string | null
  finished_at: string | null
  heartbeat_at: string | null
  created_at: string
  updated_at: string
}

export type JobTraceRecord = {
  id: string
  job_id: string
  project_id: string
  owner_id: string
  trace_type: string
  stage: string
  payload: Record<string, unknown>
  created_at: string
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

export type ShareLinkRecord = {
  id: string
  project_id: string
  export_id: string
  owner_id: string
  token: string
  is_active: boolean
  created_at: string
}

export type UsageEventRecord = {
  id: string
  owner_id: string
  project_id: string
  export_id: string | null
  provider: string
  event_type: string
  units: number
  estimated_cost_usd: number
  metadata: Record<string, unknown>
  created_at: string
}

export type NotificationRecord = {
  id: string
  owner_id: string
  project_id: string | null
  export_id: string | null
  job_id: string | null
  kind: string
  title: string
  body: string
  severity: NotificationSeverity
  action_url: string | null
  metadata: Record<string, unknown>
  read_at: string | null
  created_at: string
}

export type OwnerGuardrailsRecord = {
  owner_id: string
  monthly_total_budget_usd: number
  monthly_openai_budget_usd: number
  monthly_runway_budget_usd: number
  max_concurrent_render_jobs: number
  max_concurrent_preview_jobs: number
  auto_block_on_budget: boolean
  updated_at: string
  created_at: string
}

export type ApprovalRecord = {
  id: string
  owner_id: string
  project_id: string
  job_id: string
  concept_id: string | null
  status: ApprovalStatus
  decision_note: string | null
  requested_at: string
  decided_at: string | null
  created_at: string
}

export type AdTemplateRecord = {
  id: string
  owner_id: string
  name: string
  style_key: string
  description: string
  scene_pack: TemplateScenePackItem[]
  cta_preset: TemplateCtaPreset
  is_default: boolean
  created_at: string
  updated_at: string
}

export type ShowcaseItemRecord = {
  id: string
  owner_id: string
  project_id: string
  export_id: string
  render_batch_id: string | null
  title: string
  summary: string
  is_published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type BrandKitRecord = {
  id: string
  owner_id: string
  name: string
  logo_asset_id: string | null
  palette: BrandKitPalette
  typography: BrandKitTypography
  is_default: boolean
  created_at: string
  updated_at: string
}

export type PlatformRenderPackRecord = {
  id: string
  owner_id: string
  name: string
  platform_preset: PlatformPresetKey
  aspect_ratio: ExportAspectRatio
  safe_zone: RenderSafeZone
  caption_layout: CaptionLayoutPreset
  cta_timing: CtaTimingPreset
  is_default: boolean
  created_at: string
  updated_at: string
}

export type RenderBatchRecord = {
  id: string
  owner_id: string
  project_id: string
  concept_id: string
  job_id: string
  status: "queued" | "rendering" | "ready" | "failed"
  platform_preset: PlatformPresetKey
  aspect_ratios: ExportAspectRatio[]
  variant_keys: RenderVariantKey[]
  export_count: number
  winner_export_id: string | null
  review_note: string | null
  decided_at: string | null
  is_finalized: boolean
  finalized_export_id: string | null
  finalization_note: string | null
  finalized_at: string | null
  finalized_by_owner_id: string | null
  created_at: string
  updated_at: string
}

export type ShareCampaignRecord = {
  id: string
  owner_id: string
  project_id: string
  render_batch_id: string | null
  export_id: string
  title: string
  message: string
  token: string
  status: "active" | "archived"
  created_at: string
  updated_at: string
}

export type BatchReviewLinkRecord = {
  id: string
  owner_id: string
  project_id: string
  render_batch_id: string
  reviewer_name: string
  reviewer_email: string | null
  reviewer_role: ReviewerRole
  message: string
  token: string
  status: "active" | "closed" | "revoked"
  response_status: ExternalReviewStatus
  response_note: string | null
  responded_at: string | null
  created_at: string
  updated_at: string
}

export type BatchReviewCommentRecord = {
  id: string
  owner_id: string
  project_id: string
  render_batch_id: string
  review_link_id: string | null
  export_id: string | null
  author_label: string
  reviewer_role: ReviewerRole | null
  body: string
  created_at: string
}

export type PublicBatchReviewContext = {
  review_link_id: string
  render_batch_id: string
  project_id: string
  job_id: string
  project_name: string
  reviewer_name: string
  reviewer_role: ReviewerRole
  review_message: string
  review_link_status: "active" | "closed"
  response_status: ExternalReviewStatus
  response_note: string | null
  responded_at: string | null
  batch_is_finalized: boolean
  finalized_at: string | null
  finalization_note: string | null
}

export type PublicBatchReviewExport = {
  export_id: string
  aspect_ratio: ExportAspectRatio
  platform_preset: PlatformPresetKey
  variant_key: RenderVariantKey
  template_name: string
  preview_data_url: string
  created_at: string
  is_winner: boolean
}

export type DeliveryWorkspaceRecord = {
  id: string
  owner_id: string
  project_id: string
  render_batch_id: string
  canonical_export_id: string
  title: string
  summary: string
  handoff_notes: string
  approval_summary: DeliveryApprovalSummary
  token: string
  status: "active" | "archived"
  follow_up_status: DeliveryFollowUpStatus
  follow_up_note: string | null
  follow_up_updated_at: string | null
  created_at: string
  updated_at: string
}

export type DeliveryWorkspaceExportRecord = {
  id: string
  delivery_workspace_id: string
  owner_id: string
  project_id: string
  export_id: string
  label: string
  sort_order: number
  created_at: string
}

export type DeliveryWorkspaceEventType =
  | "delivered"
  | "viewed"
  | "downloaded"
  | "acknowledged"

export type DeliveryWorkspaceEventRecord = {
  id: string
  delivery_workspace_id: string
  owner_id: string
  project_id: string
  export_id: string | null
  event_type: DeliveryWorkspaceEventType
  actor_label: string | null
  metadata: Record<string, unknown>
  created_at: string
}
