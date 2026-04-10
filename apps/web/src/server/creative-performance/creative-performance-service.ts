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

export type ManualCreativePerformanceRowInput = {
  channel: ActivationChannel
  exportId: string
  metricDate: string
  impressions: number
  clicks: number
  spendUsd: number
  conversions: number
  conversionValueUsd: number
  activationPackageId?: string | null
}

export type ManualCreativePerformanceBatchInput = {
  ownerId: string
  source: "manual_owner" | "manual_operator"
  externalAccountLabel: string | null
  notes: string | null
  submittedByUserId: string | null
  operatorLabel: string | null
  rows: ManualCreativePerformanceRowInput[]
  client?: SupabaseClient
}

export type ManualCreativePerformanceInput = ManualCreativePerformanceBatchInput &
  ManualCreativePerformanceRowInput

async function createPerformanceRecordForRow(input: {
  batchId: string
  client: SupabaseClient
  ownerId: string
  source: "manual_owner" | "manual_operator"
  row: ManualCreativePerformanceRowInput
}) {
  const supabase = await resolveClient(input.client)
  const lineage = await resolveExportCreativeLineage({
    exportId: input.row.exportId,
    ownerId: input.ownerId,
    client: supabase
  })

  if (!lineage || !lineage.project) {
    throw new CreativePerformanceError("creative_performance_export_not_found")
  }

  let activationPackageId: string | null = null

  if (input.row.activationPackageId) {
    const packageRecord = await getActivationPackageByIdForOwner(
      input.row.activationPackageId,
      input.ownerId,
      supabase
    )

    if (!packageRecord || packageRecord.export_id !== lineage.exportRecord.id) {
      throw new CreativePerformanceError("creative_performance_package_not_found")
    }

    activationPackageId = packageRecord.id
  }

  const derived = deriveMetrics({
    clicks: input.row.clicks,
    conversionValueUsd: input.row.conversionValueUsd,
    conversions: input.row.conversions,
    impressions: input.row.impressions,
    spendUsd: input.row.spendUsd
  })

  return createCreativePerformanceRecord({
    activationPackageId,
    angle: lineage.concept?.angle ?? null,
    aspectRatio: lineage.exportRecord.aspect_ratio,
    brandTone: lineage.projectInput?.brand_tone ?? null,
    callToAction: lineage.projectInput?.call_to_action ?? null,
    canonicalExportId: lineage.project.canonical_export_id,
    channel: input.row.channel,
    clicks: input.row.clicks,
    client: supabase,
    conceptId: lineage.exportRecord.concept_id,
    conversionValueUsd: input.row.conversionValueUsd,
    conversions: input.row.conversions,
    cpa: derived.cpa,
    cpc: derived.cpc,
    ctr: derived.ctr,
    exportId: lineage.exportRecord.id,
    hook: lineage.concept?.hook ?? null,
    impressions: input.row.impressions,
    ingestionBatchId: input.batchId,
    metadataJson: {
      source: input.source
    },
    metricDate: input.row.metricDate,
    offerText: lineage.projectInput?.offer_text ?? null,
    ownerId: input.ownerId,
    platformPreset: lineage.exportRecord.platform_preset,
    previewAssetId: lineage.previewAsset?.id ?? lineage.exportRecord.preview_asset_id,
    projectId: lineage.project.id,
    renderBatchId: lineage.renderBatch?.id ?? null,
    roas: derived.roas,
    spendUsd: input.row.spendUsd,
    targetAudience: lineage.projectInput?.target_audience ?? null,
    variantKey: lineage.exportRecord.variant_key
  })
}

export async function ingestManualCreativePerformanceBatch(
  input: ManualCreativePerformanceBatchInput
) {
  const supabase = await resolveClient(input.client)
  if (input.rows.length === 0) {
    throw new CreativePerformanceError("creative_performance_invalid")
  }

  const records = []
  const batchIdsByChannel = new Map<ActivationChannel, string>()

  for (const row of input.rows) {
    let batchId = batchIdsByChannel.get(row.channel)

    if (!batchId) {
      const batch = await createCreativePerformanceIngestionBatch({
        channel: row.channel,
        client: supabase,
        externalAccountLabel: input.externalAccountLabel,
        notes: input.notes,
        operatorLabel: input.operatorLabel,
        ownerId: input.ownerId,
        source: input.source,
        submittedByUserId: input.submittedByUserId
      })

      batchId = batch.id
      batchIdsByChannel.set(row.channel, batchId)
    }

    const record = await createPerformanceRecordForRow({
      batchId,
      client: supabase,
      ownerId: input.ownerId,
      row,
      source: input.source
    })

    records.push(record)
  }

  return records
}

export async function ingestManualCreativePerformance(
  input: ManualCreativePerformanceInput
) {
  const [record] = await ingestManualCreativePerformanceBatch({
    client: input.client,
    externalAccountLabel: input.externalAccountLabel,
    notes: input.notes,
    operatorLabel: input.operatorLabel,
    ownerId: input.ownerId,
    rows: [
      {
        activationPackageId: input.activationPackageId,
        channel: input.channel,
        clicks: input.clicks,
        conversionValueUsd: input.conversionValueUsd,
        conversions: input.conversions,
        exportId: input.exportId,
        impressions: input.impressions,
        metricDate: input.metricDate,
        spendUsd: input.spendUsd
      }
    ],
    source: input.source,
    submittedByUserId: input.submittedByUserId
  })

  if (!record) {
    throw new CreativePerformanceError("creative_performance_invalid")
  }

  return record
}

function normalizePerformanceRow(input: {
  activationPackageId: unknown
  channel: unknown
  clicks: unknown
  conversionValueUsd: unknown
  conversions: unknown
  exportId: unknown
  impressions: unknown
  metricDate: unknown
  spendUsd: unknown
}) {
  const rawValues = [
    input.activationPackageId,
    input.channel,
    input.clicks,
    input.conversionValueUsd,
    input.conversions,
    input.exportId,
    input.impressions,
    input.metricDate,
    input.spendUsd
  ]

  if (rawValues.every((value) => String(value ?? "").trim().length === 0)) {
    return null
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
    impressions: normalizeWholeNumber(input.impressions),
    metricDate: normalizeMetricDate(String(input.metricDate ?? "")),
    spendUsd: normalizeDecimal(input.spendUsd)
  } satisfies ManualCreativePerformanceRowInput
}

export function parseManualCreativePerformanceBatchInput(input: {
  ownerId: string
  source: "manual_owner" | "manual_operator"
  channels: unknown[]
  exportIds: unknown[]
  metricDates: unknown[]
  impressions: unknown[]
  clicks: unknown[]
  spendUsd: unknown[]
  conversions: unknown[]
  conversionValueUsd: unknown[]
  externalAccountLabel: unknown
  notes: unknown
  submittedByUserId: string | null
  operatorLabel: string | null
  activationPackageIds?: unknown[]
}): ManualCreativePerformanceBatchInput {
  const ownerId = input.ownerId.trim()

  if (!ownerId) {
    throw new CreativePerformanceError("creative_performance_invalid")
  }

  const rowCount = input.exportIds.length

  if (
    rowCount === 0 ||
    rowCount !== input.channels.length ||
    rowCount !== input.metricDates.length ||
    rowCount !== input.impressions.length ||
    rowCount !== input.clicks.length ||
    rowCount !== input.spendUsd.length ||
    rowCount !== input.conversions.length ||
    rowCount !== input.conversionValueUsd.length ||
    rowCount !== (input.activationPackageIds?.length ?? rowCount)
  ) {
    throw new CreativePerformanceError("creative_performance_invalid")
  }

  if (rowCount > 25) {
    throw new CreativePerformanceError("creative_performance_invalid")
  }

  const rows = []

  for (let index = 0; index < rowCount; index += 1) {
    const row = normalizePerformanceRow({
      activationPackageId: input.activationPackageIds?.[index],
      channel: input.channels[index],
      clicks: input.clicks[index],
      conversionValueUsd: input.conversionValueUsd[index],
      conversions: input.conversions[index],
      exportId: input.exportIds[index],
      impressions: input.impressions[index],
      metricDate: input.metricDates[index],
      spendUsd: input.spendUsd[index]
    })

    if (row) {
      rows.push(row)
    }
  }

  if (rows.length === 0) {
    throw new CreativePerformanceError("creative_performance_invalid")
  }

  return {
    externalAccountLabel: normalizeOptionalText(input.externalAccountLabel),
    notes: normalizeOptionalText(input.notes),
    operatorLabel: input.operatorLabel,
    ownerId,
    rows,
    source: input.source,
    submittedByUserId: input.submittedByUserId
  }
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
  const batch = parseManualCreativePerformanceBatchInput({
    activationPackageIds: [input.activationPackageId],
    channels: [input.channel],
    clicks: [input.clicks],
    conversionValueUsd: [input.conversionValueUsd],
    conversions: [input.conversions],
    exportIds: [input.exportId],
    externalAccountLabel: input.externalAccountLabel,
    impressions: [input.impressions],
    metricDates: [input.metricDate],
    notes: input.notes,
    operatorLabel: input.operatorLabel,
    ownerId: input.ownerId,
    source: input.source,
    spendUsd: [input.spendUsd],
    submittedByUserId: input.submittedByUserId
  })

  const row = batch.rows[0]

  if (!row) {
    throw new CreativePerformanceError("creative_performance_invalid")
  }

  return {
    ...batch,
    activationPackageId: row.activationPackageId,
    channel: row.channel,
    clicks: row.clicks,
    conversionValueUsd: row.conversionValueUsd,
    conversions: row.conversions,
    exportId: row.exportId,
    impressions: row.impressions,
    metricDate: row.metricDate,
    spendUsd: row.spendUsd
  }
}

export const creativePerformanceServiceInternals = {
  deriveMetrics,
  normalizePerformanceRow
}
