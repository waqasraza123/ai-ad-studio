import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  ExportAspectRatio,
  ExportRecord,
  PlatformPresetKey,
  RenderBatchRecord,
  RenderVariantKey
} from "@/server/database/types"

const renderBatchSelection =
  "id, owner_id, project_id, concept_id, job_id, status, platform_preset, aspect_ratios, variant_keys, export_count, winner_export_id, review_note, decided_at, created_at, updated_at"

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

export async function getRenderBatchByIdForOwner(
  batchId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("render_batches")
    .select(renderBatchSelection)
    .eq("id", batchId)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load render batch")
  }

  if (!data) {
    return null
  }

  return normalizeRenderBatch(
    data as RenderBatchRecord & {
      aspect_ratios: unknown
      variant_keys: unknown
    }
  )
}

export function listExportsForRenderBatch(input: {
  batchId: string
  exports: ExportRecord[]
}) {
  return input.exports
    .filter((exportRecord) => String(exportRecord.render_metadata.batchId ?? "") === input.batchId)
    .sort((left, right) => {
      const leftVariant = String(left.render_metadata.variantKey ?? left.variant_key)
      const rightVariant = String(right.render_metadata.variantKey ?? right.variant_key)

      if (leftVariant === rightVariant) {
        return left.aspect_ratio.localeCompare(right.aspect_ratio)
      }

      return leftVariant.localeCompare(rightVariant)
    })
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

export async function selectRenderBatchWinner(input: {
  batchId: string
  ownerId: string
  winnerExportId: string
  reviewNote: string | null
}) {
  const supabase = await createSupabaseServerClient()

  const existingBatch = await getRenderBatchByIdForOwner(input.batchId, input.ownerId)

  if (!existingBatch) {
    throw new Error("Render batch not found")
  }

  const decidedAt = new Date().toISOString()

  const { data, error } = await supabase
    .from("render_batches")
    .update({
      decided_at: decidedAt,
      review_note: input.reviewNote,
      updated_at: decidedAt,
      winner_export_id: input.winnerExportId
    })
    .eq("id", input.batchId)
    .eq("owner_id", input.ownerId)
    .select(renderBatchSelection)
    .single()

  if (error) {
    throw new Error("Failed to select render batch winner")
  }

  const { error: traceError } = await supabase.from("job_traces").insert({
    job_id: existingBatch.job_id,
    owner_id: input.ownerId,
    payload: {
      reviewNote: input.reviewNote,
      winnerExportId: input.winnerExportId
    },
    project_id: existingBatch.project_id,
    stage: "batch_winner_selected",
    trace_type: "review"
  })

  if (traceError) {
    throw new Error("Failed to write render batch winner trace")
  }

  const { error: notificationError } = await supabase.from("notifications").insert({
    action_url: `/dashboard/exports/${input.winnerExportId}`,
    body: "A winning export has been selected for a controlled render batch.",
    export_id: input.winnerExportId,
    job_id: existingBatch.job_id,
    kind: "render_batch_winner_selected",
    metadata: {
      batchId: existingBatch.id
    },
    owner_id: input.ownerId,
    project_id: existingBatch.project_id,
    severity: "success",
    title: "Batch winner selected"
  })

  if (notificationError) {
    throw new Error("Failed to create render batch winner notification")
  }

  return normalizeRenderBatch(
    data as RenderBatchRecord & {
      aspect_ratios: unknown
      variant_keys: unknown
    }
  )
}
