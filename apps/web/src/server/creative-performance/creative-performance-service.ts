import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getActivationPackageByIdForOwner } from "@/server/activation/activation-repository"
import { resolveExportCreativeLineage } from "@/server/creative-lineage/export-lineage"
import {
  createCreativePerformanceIngestionBatch,
  createCreativePerformanceRecord
} from "@/server/creative-performance/creative-performance-repository"
import type { ActivationChannel } from "@/server/database/types"

export class CreativePerformanceError extends Error {
  constructor(
    readonly code:
      | "creative_performance_export_not_found"
      | "creative_performance_invalid"
      | "creative_performance_package_not_found"
  ) {
    super(code)
  }
}

async function resolveClient(client?: SupabaseClient) {
  return client ?? createSupabaseServerClient()
}

function round(value: number, digits: number) {
  return Number(value.toFixed(digits))
}

function deriveMetrics(input: {
  impressions: number
  clicks: number
  spendUsd: number
  conversions: number
  conversionValueUsd: number
}) {
  const ctr = input.impressions > 0 ? input.clicks / input.impressions : 0
  const cpc = input.clicks > 0 ? input.spendUsd / input.clicks : 0
  const cpa = input.conversions > 0 ? input.spendUsd / input.conversions : 0
  const roas = input.spendUsd > 0 ? input.conversionValueUsd / input.spendUsd : 0

  return {
    cpa: round(cpa, 4),
    cpc: round(cpc, 4),
    ctr: round(ctr, 6),
    roas: round(roas, 6)
  }
}

function normalizeWholeNumber(value: unknown) {
  const numeric = Number(value ?? 0)

  if (!Number.isFinite(numeric) || numeric < 0) {
    throw new CreativePerformanceError("creative_performance_invalid")
  }

  return Math.round(numeric)
}

function normalizeDecimal(value: unknown) {
  const numeric = Number(value ?? 0)

  if (!Number.isFinite(numeric) || numeric < 0) {
    throw new CreativePerformanceError("creative_performance_invalid")
  }

  return round(numeric, 4)
}

function normalizeOptionalText(value: unknown) {
  const normalized = String(value ?? "").trim()
  return normalized.length > 0 ? normalized : null
}

function normalizeMetricDate(value: string) {
  const trimmed = value.trim()

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new CreativePerformanceError("creative_performance_invalid")
  }

  return trimmed
}

export type ManualCreativePerformanceInput = {
  ownerId: string
  source: "manual_owner" | "manual_operator"
  channel: ActivationChannel
  exportId: string
  metricDate: string
  impressions: number
  clicks: number
  spendUsd: number
  conversions: number
  conversionValueUsd: number
  externalAccountLabel: string | null
  notes: string | null
  submittedByUserId: string | null
  operatorLabel: string | null
  activationPackageId?: string | null
  client?: SupabaseClient
}

export async function ingestManualCreativePerformance(
  input: ManualCreativePerformanceInput
) {
  const supabase = await resolveClient(input.client)
  const lineage = await resolveExportCreativeLineage({
    exportId: input.exportId,
    ownerId: input.ownerId,
    client: supabase
  })

  if (!lineage || !lineage.project) {
    throw new CreativePerformanceError("creative_performance_export_not_found")
  }

  let activationPackageId: string | null = null

  if (input.activationPackageId) {
    const packageRecord = await getActivationPackageByIdForOwner(
      input.activationPackageId,
      input.ownerId,
      supabase
    )

    if (!packageRecord || packageRecord.export_id !== lineage.exportRecord.id) {
      throw new CreativePerformanceError("creative_performance_package_not_found")
    }

    activationPackageId = packageRecord.id
  }

  const derived = deriveMetrics({
    clicks: input.clicks,
    conversionValueUsd: input.conversionValueUsd,
    conversions: input.conversions,
    impressions: input.impressions,
    spendUsd: input.spendUsd
  })

  const batch = await createCreativePerformanceIngestionBatch({
    channel: input.channel,
    client: supabase,
    externalAccountLabel: input.externalAccountLabel,
    notes: input.notes,
    operatorLabel: input.operatorLabel,
    ownerId: input.ownerId,
    source: input.source,
    submittedByUserId: input.submittedByUserId
  })

  return createCreativePerformanceRecord({
    activationPackageId,
    angle: lineage.concept?.angle ?? null,
    aspectRatio: lineage.exportRecord.aspect_ratio,
    brandTone: lineage.projectInput?.brand_tone ?? null,
    callToAction: lineage.projectInput?.call_to_action ?? null,
    canonicalExportId: lineage.project.canonical_export_id,
    channel: input.channel,
    clicks: input.clicks,
    client: supabase,
    conceptId: lineage.exportRecord.concept_id,
    conversionValueUsd: input.conversionValueUsd,
    conversions: input.conversions,
    cpa: derived.cpa,
    cpc: derived.cpc,
    ctr: derived.ctr,
    exportId: lineage.exportRecord.id,
    hook: lineage.concept?.hook ?? null,
    impressions: input.impressions,
    ingestionBatchId: batch.id,
    metadataJson: {
      source: input.source
    },
    metricDate: input.metricDate,
    offerText: lineage.projectInput?.offer_text ?? null,
    ownerId: input.ownerId,
    platformPreset: lineage.exportRecord.platform_preset,
    previewAssetId: lineage.previewAsset?.id ?? lineage.exportRecord.preview_asset_id,
    projectId: lineage.project.id,
    renderBatchId: lineage.renderBatch?.id ?? null,
    roas: derived.roas,
    spendUsd: input.spendUsd,
    targetAudience: lineage.projectInput?.target_audience ?? null,
    variantKey: lineage.exportRecord.variant_key
  })
}

export function parseManualCreativePerformanceInput(input: {
  ownerId: string
  source: "manual_owner" | "manual_operator"
  channel: unknown
  exportId: unknown
  metricDate: unknown
  impressions: unknown
  clicks: unknown
  spendUsd: unknown
  conversions: unknown
  conversionValueUsd: unknown
  externalAccountLabel: unknown
  notes: unknown
  submittedByUserId: string | null
  operatorLabel: string | null
  activationPackageId?: unknown
}): ManualCreativePerformanceInput {
  const ownerId = input.ownerId.trim()

  if (!ownerId) {
    throw new CreativePerformanceError("creative_performance_invalid")
  }

  const channel = String(input.channel ?? "")

  if (
    channel !== "meta" &&
    channel !== "google" &&
    channel !== "tiktok" &&
    channel !== "internal_handoff"
  ) {
    throw new CreativePerformanceError("creative_performance_invalid")
  }

  const exportId = String(input.exportId ?? "").trim()

  if (!exportId) {
    throw new CreativePerformanceError("creative_performance_invalid")
  }

  return {
    activationPackageId: normalizeOptionalText(input.activationPackageId),
    channel,
    clicks: normalizeWholeNumber(input.clicks),
    conversionValueUsd: normalizeDecimal(input.conversionValueUsd),
    conversions: normalizeWholeNumber(input.conversions),
    exportId,
    externalAccountLabel: normalizeOptionalText(input.externalAccountLabel),
    impressions: normalizeWholeNumber(input.impressions),
    metricDate: normalizeMetricDate(String(input.metricDate ?? "")),
    notes: normalizeOptionalText(input.notes),
    operatorLabel: input.operatorLabel,
    ownerId,
    source: input.source,
    spendUsd: normalizeDecimal(input.spendUsd),
    submittedByUserId: input.submittedByUserId
  }
}

export const creativePerformanceServiceInternals = {
  deriveMetrics
}
