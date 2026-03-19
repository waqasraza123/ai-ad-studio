import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  ExportAspectRatio,
  PlatformPresetKey,
  RenderBatchRecord,
  RenderVariantKey
} from "@/server/database/types"

const renderBatchSelection =
  "id, owner_id, project_id, concept_id, job_id, status, platform_preset, aspect_ratios, variant_keys, export_count, created_at, updated_at"

function normalizeRenderBatch(
  record: Omit<RenderBatchRecord, "aspect_ratios" | "variant_keys"> & {
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
  } as RenderBatchRecord
}

export async function listRenderBatchesByProjectIdForOwner(
  projectId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("render_batches")
    .select(renderBatchSelection)
    .eq("project_id", projectId)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list render batches")
  }

  return (data ?? []).map((record) =>
    normalizeRenderBatch(
      record as RenderBatchRecord & {
        aspect_ratios: unknown
        variant_keys: unknown
      }
    )
  )
}

export async function createRenderBatchJob(input: {
  ownerId: string
  projectId: string
  conceptId: string
  callToAction: string | null
  platformPreset: PlatformPresetKey
  aspectRatios: ExportAspectRatio[]
  variantKeys: RenderVariantKey[]
  previewAsset: Record<string, unknown>
}) {
  const supabase = await createSupabaseServerClient()
  const nowIso = new Date().toISOString()

  const payload = {
    aspectRatios: input.aspectRatios,
    batchVariantKeys: input.variantKeys,
    callToAction: input.callToAction,
    conceptId: input.conceptId,
    platformPreset: input.platformPreset,
    previewAsset: input.previewAsset,
    variantKey: input.variantKeys[0] ?? "default"
  }

  const { data: jobRecord, error: jobError } = await supabase
    .from("jobs")
    .insert({
      attempts: 0,
      error: {},
      max_attempts: 3,
      next_attempt_at: nowIso,
      owner_id: input.ownerId,
      payload,
      project_id: input.projectId,
      provider: null,
      provider_job_id: null,
      result: {},
      scheduled_at: nowIso,
      status: "queued",
      type: "render_final_ad"
    })
    .select("id")
    .single()

  if (jobError) {
    throw new Error("Failed to create render batch job")
  }

  const { data: batchRecord, error: batchError } = await supabase
    .from("render_batches")
    .insert({
      aspect_ratios: input.aspectRatios,
      concept_id: input.conceptId,
      export_count: 0,
      job_id: jobRecord.id,
      owner_id: input.ownerId,
      platform_preset: input.platformPreset,
      project_id: input.projectId,
      status: "queued",
      variant_keys: input.variantKeys
    })
    .select(renderBatchSelection)
    .single()

  if (batchError) {
    await supabase.from("jobs").delete().eq("id", jobRecord.id)
    throw new Error("Failed to create render batch")
  }

  return normalizeRenderBatch(
    batchRecord as RenderBatchRecord & {
      aspect_ratios: unknown
      variant_keys: unknown
    }
  )
}
