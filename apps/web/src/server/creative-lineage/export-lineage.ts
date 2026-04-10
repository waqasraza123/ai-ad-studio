import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  AssetRecord,
  ConceptRecord,
  ExportRecord,
  ProjectInputRecord,
  ProjectRecord,
  RenderBatchRecord
} from "@/server/database/types"

const exportSelection =
  "id, project_id, concept_id, owner_id, asset_id, preview_asset_id, status, version, variant_key, aspect_ratio, platform_preset, render_metadata, created_at, updated_at"

const projectSelection =
  "id, owner_id, name, status, selected_concept_id, template_id, brand_kit_id, canonical_export_id, created_at, updated_at"

const projectInputSelection =
  "project_id, owner_id, product_name, product_description, offer_text, call_to_action, target_audience, brand_tone, visual_style, duration_seconds, aspect_ratio, created_at, updated_at"

const conceptSelection =
  "id, project_id, owner_id, title, angle, hook, script, caption_style, visual_direction, status, sort_order, risk_flags, safety_notes, was_safety_modified, created_at, updated_at"

const assetSelection =
  "id, project_id, owner_id, kind, storage_key, mime_type, width, height, duration_ms, metadata, created_at"

const renderBatchSelection =
  "id, owner_id, project_id, concept_id, job_id, status, platform_preset, aspect_ratios, variant_keys, export_count, winner_export_id, review_note, decided_at, is_finalized, finalized_export_id, finalization_note, finalized_at, finalized_by_owner_id, created_at, updated_at"

async function resolveClient(client?: SupabaseClient) {
  return client ?? createSupabaseServerClient()
}

function normalizeConceptRecord(
  record: (ConceptRecord & { risk_flags: unknown }) | null
) {
  if (!record) {
    return null
  }

  return {
    ...record,
    risk_flags: Array.isArray(record.risk_flags)
      ? record.risk_flags.filter((value): value is string => typeof value === "string")
      : []
  } satisfies ConceptRecord
}

function readPreviewDataUrl(exportRecord: ExportRecord) {
  return typeof exportRecord.render_metadata.previewDataUrl === "string"
    ? exportRecord.render_metadata.previewDataUrl
    : null
}

function resolvePreviewAsset(input: {
  assets: AssetRecord[]
  exportRecord: ExportRecord
}) {
  const previewDataUrl = readPreviewDataUrl(input.exportRecord)

  if (input.exportRecord.preview_asset_id) {
    const directMatch =
      input.assets.find((asset) => asset.id === input.exportRecord.preview_asset_id) ?? null

    if (directMatch) {
      return directMatch
    }
  }

  if (previewDataUrl) {
    const exactMatch =
      input.assets.find(
        (asset) =>
          asset.kind === "concept_preview" &&
          typeof asset.metadata.previewDataUrl === "string" &&
          asset.metadata.previewDataUrl === previewDataUrl
      ) ?? null

    if (exactMatch) {
      return exactMatch
    }
  }

  if (!input.exportRecord.concept_id) {
    return null
  }

  const conceptMatches = input.assets.filter(
    (asset) =>
      asset.kind === "concept_preview" &&
      typeof asset.metadata.conceptId === "string" &&
      asset.metadata.conceptId === input.exportRecord.concept_id
  )

  return conceptMatches.length === 1 ? conceptMatches[0] ?? null : null
}

export type ExportCreativeLineage = {
  exportRecord: ExportRecord
  project: ProjectRecord | null
  projectInput: ProjectInputRecord | null
  concept: ConceptRecord | null
  exportAsset: AssetRecord | null
  previewAsset: AssetRecord | null
  renderBatch: RenderBatchRecord | null
  batchId: string | null
  previewDataUrl: string | null
}

export async function resolveExportCreativeLineage(input: {
  exportId?: string
  exportRecord?: ExportRecord
  ownerId: string
  client?: SupabaseClient
}): Promise<ExportCreativeLineage | null> {
  const supabase = await resolveClient(input.client)
  let exportRecord = input.exportRecord ?? null

  if (!exportRecord) {
    if (!input.exportId) {
      throw new Error("Export id or export record is required")
    }

    const { data, error } = await supabase
      .from("exports")
      .select(exportSelection)
      .eq("id", input.exportId)
      .eq("owner_id", input.ownerId)
      .maybeSingle()

    if (error) {
      throw new Error("Failed to load export lineage")
    }

    if (!data) {
      return null
    }

    exportRecord = data as ExportRecord
  }

  const batchId =
    typeof exportRecord.render_metadata.batchId === "string"
      ? exportRecord.render_metadata.batchId
      : null

  const [projectResponse, projectInputResponse, conceptResponse, assetResponse, batchResponse] =
    await Promise.all([
      supabase
        .from("projects")
        .select(projectSelection)
        .eq("id", exportRecord.project_id)
        .eq("owner_id", input.ownerId)
        .maybeSingle(),
      supabase
        .from("project_inputs")
        .select(projectInputSelection)
        .eq("project_id", exportRecord.project_id)
        .eq("owner_id", input.ownerId)
        .maybeSingle(),
      exportRecord.concept_id
        ? supabase
            .from("concepts")
            .select(conceptSelection)
            .eq("id", exportRecord.concept_id)
            .eq("owner_id", input.ownerId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabase
        .from("assets")
        .select(assetSelection)
        .eq("project_id", exportRecord.project_id)
        .eq("owner_id", input.ownerId)
        .order("created_at", { ascending: false }),
      batchId
        ? supabase
            .from("render_batches")
            .select(renderBatchSelection)
            .eq("id", batchId)
            .eq("owner_id", input.ownerId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null })
    ])

  if (
    projectResponse.error ||
    projectInputResponse.error ||
    conceptResponse.error ||
    assetResponse.error ||
    batchResponse.error
  ) {
    throw new Error("Failed to resolve export lineage")
  }

  const assets = (assetResponse.data ?? []) as AssetRecord[]
  const exportAsset = assets.find((asset) => asset.id === exportRecord.asset_id) ?? null
  const previewAsset = resolvePreviewAsset({
    assets,
    exportRecord
  })

  return {
    batchId,
    concept: normalizeConceptRecord(
      (conceptResponse.data ?? null) as (ConceptRecord & { risk_flags: unknown }) | null
    ),
    exportAsset,
    exportRecord,
    previewAsset,
    previewDataUrl: readPreviewDataUrl(exportRecord),
    project: (projectResponse.data ?? null) as ProjectRecord | null,
    projectInput: (projectInputResponse.data ?? null) as ProjectInputRecord | null,
    renderBatch: (batchResponse.data ?? null) as RenderBatchRecord | null
  }
}
