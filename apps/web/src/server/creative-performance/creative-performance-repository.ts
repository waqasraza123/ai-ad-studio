import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  CreativePerformanceIngestionBatchRecord,
  CreativePerformanceRecord
} from "@/server/database/types"

const creativePerformanceBatchSelection =
  "id, owner_id, source, channel, external_account_label, notes, submitted_by_user_id, operator_label, created_at, updated_at"

const creativePerformanceRecordSelection =
  "id, owner_id, project_id, concept_id, preview_asset_id, render_batch_id, export_id, canonical_export_id, activation_package_id, ingestion_batch_id, channel, metric_date, impressions, clicks, ctr, spend_usd, cpc, conversions, cpa, conversion_value_usd, roas, hook, angle, brand_tone, call_to_action, target_audience, offer_text, aspect_ratio, platform_preset, variant_key, metadata_json, created_at"

async function resolveClient(client?: SupabaseClient) {
  return client ?? createSupabaseServerClient()
}

function toNumber(value: unknown) {
  const numeric = Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}

function normalizeCreativePerformanceRecord(
  record: CreativePerformanceRecord & { metadata_json: unknown }
) {
  return {
    ...record,
    clicks: toNumber(record.clicks),
    conversion_value_usd: toNumber(record.conversion_value_usd),
    conversions: toNumber(record.conversions),
    cpa: toNumber(record.cpa),
    cpc: toNumber(record.cpc),
    ctr: toNumber(record.ctr),
    impressions: toNumber(record.impressions),
    metadata_json:
      record.metadata_json && typeof record.metadata_json === "object"
        ? (record.metadata_json as Record<string, unknown>)
        : {},
    roas: toNumber(record.roas),
    spend_usd: toNumber(record.spend_usd)
  } satisfies CreativePerformanceRecord
}

export async function createCreativePerformanceIngestionBatch(input: {
  ownerId: string
  source: CreativePerformanceIngestionBatchRecord["source"]
  channel: CreativePerformanceIngestionBatchRecord["channel"]
  externalAccountLabel: string | null
  notes: string | null
  submittedByUserId: string | null
  operatorLabel: string | null
  client?: SupabaseClient
}) {
  const supabase = await resolveClient(input.client)
  const { data, error } = await supabase
    .from("creative_performance_ingestion_batches")
    .insert({
      channel: input.channel,
      external_account_label: input.externalAccountLabel,
      notes: input.notes,
      operator_label: input.operatorLabel,
      owner_id: input.ownerId,
      source: input.source,
      submitted_by_user_id: input.submittedByUserId
    })
    .select(creativePerformanceBatchSelection)
    .single()

  if (error) {
    throw new Error("Failed to create creative performance ingestion batch")
  }

  return data as CreativePerformanceIngestionBatchRecord
}

export async function createCreativePerformanceRecord(input: {
  ownerId: string
  projectId: string
  conceptId: string | null
  previewAssetId: string | null
  renderBatchId: string | null
  exportId: string | null
  canonicalExportId: string | null
  activationPackageId: string | null
  ingestionBatchId: string
  channel: CreativePerformanceRecord["channel"]
  metricDate: string
  impressions: number
  clicks: number
  ctr: number
  spendUsd: number
  cpc: number
  conversions: number
  cpa: number
  conversionValueUsd: number
  roas: number
  hook: string | null
  angle: string | null
  brandTone: string | null
  callToAction: string | null
  targetAudience: string | null
  offerText: string | null
  aspectRatio: string | null
  platformPreset: string | null
  variantKey: string | null
  metadataJson: Record<string, unknown>
  client?: SupabaseClient
}) {
  const supabase = await resolveClient(input.client)
  const { data, error } = await supabase
    .from("creative_performance_records")
    .insert({
      activation_package_id: input.activationPackageId,
      angle: input.angle,
      aspect_ratio: input.aspectRatio,
      brand_tone: input.brandTone,
      call_to_action: input.callToAction,
      canonical_export_id: input.canonicalExportId,
      channel: input.channel,
      clicks: input.clicks,
      concept_id: input.conceptId,
      conversion_value_usd: input.conversionValueUsd,
      conversions: input.conversions,
      cpa: input.cpa,
      cpc: input.cpc,
      ctr: input.ctr,
      export_id: input.exportId,
      hook: input.hook,
      impressions: input.impressions,
      ingestion_batch_id: input.ingestionBatchId,
      metadata_json: input.metadataJson,
      metric_date: input.metricDate,
      offer_text: input.offerText,
      owner_id: input.ownerId,
      platform_preset: input.platformPreset,
      preview_asset_id: input.previewAssetId,
      project_id: input.projectId,
      render_batch_id: input.renderBatchId,
      roas: input.roas,
      spend_usd: input.spendUsd,
      target_audience: input.targetAudience,
      variant_key: input.variantKey
    })
    .select(creativePerformanceRecordSelection)
    .single()

  if (error) {
    throw new Error("Failed to create creative performance record")
  }

  return normalizeCreativePerformanceRecord(
    data as CreativePerformanceRecord & { metadata_json: unknown }
  )
}

export async function listCreativePerformanceRecordsByOwner(
  ownerId: string,
  client?: SupabaseClient
) {
  const supabase = await resolveClient(client)
  const { data, error } = await supabase
    .from("creative_performance_records")
    .select(creativePerformanceRecordSelection)
    .eq("owner_id", ownerId)
    .order("metric_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list creative performance records")
  }

  return (data ?? []).map((record) =>
    normalizeCreativePerformanceRecord(
      record as CreativePerformanceRecord & { metadata_json: unknown }
    )
  )
}
