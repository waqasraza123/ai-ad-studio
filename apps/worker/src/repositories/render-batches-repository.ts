import type { SupabaseClient } from "@supabase/supabase-js"

type ExportAspectRatio = "9:16" | "1:1" | "16:9"
type PlatformPresetKey =
  | "default"
  | "instagram_reels"
  | "instagram_feed"
  | "youtube_shorts"
  | "youtube_landscape"
type RenderVariantKey = "default" | "caption_heavy" | "cta_heavy"

export type WorkerRenderBatchRecord = {
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
  created_at: string
  updated_at: string
}

const renderBatchSelection =
  "id, owner_id, project_id, concept_id, job_id, status, platform_preset, aspect_ratios, variant_keys, export_count, created_at, updated_at"

function normalizeRenderBatch(
  record: Omit<WorkerRenderBatchRecord, "aspect_ratios" | "variant_keys"> & {
    aspect_ratios: unknown
    variant_keys: unknown
  }
) {
  return {
    ...record,
    aspect_ratios: Array.isArray(record.aspect_ratios)
      ? (record.aspect_ratios as ExportAspectRatio[])
      : ["9:16"],
    variant_keys: Array.isArray(record.variant_keys)
      ? (record.variant_keys as RenderVariantKey[])
      : ["default"]
  } as WorkerRenderBatchRecord
}

export async function getRenderBatchByJobId(
  supabase: SupabaseClient,
  jobId: string
) {
  const { data, error } = await supabase
    .from("render_batches")
    .select(renderBatchSelection)
    .eq("job_id", jobId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load render batch")
  }

  if (!data) {
    return null
  }

  return normalizeRenderBatch(
    data as WorkerRenderBatchRecord & {
      aspect_ratios: unknown
      variant_keys: unknown
    }
  )
}

export async function markRenderBatchRunning(
  supabase: SupabaseClient,
  batchId: string
) {
  const { error } = await supabase
    .from("render_batches")
    .update({
      status: "rendering",
      updated_at: new Date().toISOString()
    })
    .eq("id", batchId)

  if (error) {
    throw new Error("Failed to mark render batch as rendering")
  }
}

export async function markRenderBatchReady(
  supabase: SupabaseClient,
  input: {
    batchId: string
    exportCount: number
  }
) {
  const { error } = await supabase
    .from("render_batches")
    .update({
      export_count: input.exportCount,
      status: "ready",
      updated_at: new Date().toISOString()
    })
    .eq("id", input.batchId)

  if (error) {
    throw new Error("Failed to mark render batch as ready")
  }
}

export async function markRenderBatchFailed(
  supabase: SupabaseClient,
  batchId: string
) {
  const { error } = await supabase
    .from("render_batches")
    .update({
      status: "failed",
      updated_at: new Date().toISOString()
    })
    .eq("id", batchId)

  if (error) {
    throw new Error("Failed to mark render batch as failed")
  }
}
