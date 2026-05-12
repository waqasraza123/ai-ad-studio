import type {
  ActivationChannel,
  ActivationPackageRecord,
  ActivationTrackingStatus,
  CreativePerformanceRecord,
  ExportRecord,
  ProjectRecord,
  RenderBatchRecord
} from "@/server/database/types"

export type CreativePerformanceMetrics = {
  impressions: number
  clicks: number
  spendUsd: number
  conversions: number
  conversionValueUsd: number
  ctr: number
  cpc: number
  conversionRate: number
  cpa: number
  roas: number
}

export type CreativePerformanceRollup = CreativePerformanceMetrics & {
  id: string
  label: string
  recordCount: number
}

export type CreativeActivationTrackingState =
  | "not_tracked"
  | "tracking_ready"
  | "active"
  | "historical"

export type CreativePerformanceDataState =
  | "no_performance_data"
  | "low_signal"
  | "tracked"

export type CreativeActivationTrackingRow = {
  id: string
  exportId: string
  activationPackageId: string | null
  channel: ActivationChannel | null
  label: string
  status: CreativeActivationTrackingState
  dataState: CreativePerformanceDataState
  createdAt: string
  activatedAt: string | null
  historicalAt: string | null
  metrics: CreativePerformanceMetrics
  recordCount: number
  lastMetricDate: string | null
}

export type CreativePerformanceDimensionKey =
  | "angle"
  | "aspect_ratio"
  | "brand_tone"
  | "call_to_action"
  | "concept"

export type CreativePerformanceDimensionRollup = CreativePerformanceRollup & {
  dimension: CreativePerformanceDimensionKey
}

export type CreativePerformanceInsightType =
  | "best_ctr"
  | "best_conversion_rate"
  | "high_spend_low_conversion"
  | "low_signal"
  | "retest_candidate"
  | "fatigue_risk"

export type CreativePerformanceInsight = {
  id: string
  type: CreativePerformanceInsightType
  severity: "positive" | "warning" | "neutral"
  action: "promote" | "iterate" | "pause" | "retest" | "collect_data"
  targetLabel: string | null
  payload: Record<string, string | number | null>
}

export type CreativePerformanceIntelligence = {
  totals: CreativePerformanceMetrics
  trackingRows: CreativeActivationTrackingRow[]
  topCreatives: CreativePerformanceRollup[]
  weakCreatives: CreativePerformanceRollup[]
  dimensions: Record<
    CreativePerformanceDimensionKey,
    CreativePerformanceDimensionRollup[]
  >
  insights: CreativePerformanceInsight[]
}

function round(value: number, digits: number) {
  return Number(value.toFixed(digits))
}

function emptyMetrics(): CreativePerformanceMetrics {
  return {
    clicks: 0,
    conversionRate: 0,
    conversionValueUsd: 0,
    conversions: 0,
    cpa: 0,
    cpc: 0,
    ctr: 0,
    impressions: 0,
    roas: 0,
    spendUsd: 0
  }
}

function deriveMetrics(metrics: CreativePerformanceMetrics) {
  return {
    ...metrics,
    conversionRate:
      metrics.clicks > 0 ? round(metrics.conversions / metrics.clicks, 6) : 0,
    cpa:
      metrics.conversions > 0
        ? round(metrics.spendUsd / metrics.conversions, 4)
        : 0,
    cpc: metrics.clicks > 0 ? round(metrics.spendUsd / metrics.clicks, 4) : 0,
    ctr:
      metrics.impressions > 0
        ? round(metrics.clicks / metrics.impressions, 6)
        : 0,
    roas:
      metrics.spendUsd > 0
        ? round(metrics.conversionValueUsd / metrics.spendUsd, 6)
        : 0
  }
}

function addRecord(
  metrics: CreativePerformanceMetrics,
  record: CreativePerformanceRecord
) {
  metrics.clicks += record.clicks
  metrics.conversionValueUsd += record.conversion_value_usd
  metrics.conversions += record.conversions
  metrics.impressions += record.impressions
  metrics.spendUsd += record.spend_usd
}

function summarizeRecords(records: CreativePerformanceRecord[]) {
  const metrics = emptyMetrics()

  for (const record of records) {
    addRecord(metrics, record)
  }

  return deriveMetrics(metrics)
}

function hasUsefulSignal(
  metrics: CreativePerformanceMetrics,
  recordCount: number
) {
  return metrics.impressions >= 1000 || metrics.clicks >= 25 || recordCount >= 2
}

function dataState(
  metrics: CreativePerformanceMetrics,
  recordCount: number
): CreativePerformanceDataState {
  if (recordCount === 0) {
    return "no_performance_data"
  }

  return hasUsefulSignal(metrics, recordCount) ? "tracked" : "low_signal"
}

function labelForExport(exportRecord: ExportRecord, index: number) {
  return [
    `#${index + 1}`,
    exportRecord.variant_key,
    exportRecord.aspect_ratio
  ].join(" · ")
}

function labelForPackage(
  activationPackage: ActivationPackageRecord,
  exportRecord: ExportRecord | null,
  index: number
) {
  return [
    `#${index + 1}`,
    activationPackage.channel,
    exportRecord?.variant_key ?? null,
    exportRecord?.aspect_ratio ?? null
  ]
    .filter(Boolean)
    .join(" · ")
}

function toTrackingStatus(status: ActivationTrackingStatus) {
  return status
}

function finalizedExportIds(input: {
  project: ProjectRecord
  renderBatches: RenderBatchRecord[]
}) {
  const ids = new Set<string>()

  if (input.project.canonical_export_id) {
    ids.add(input.project.canonical_export_id)
  }

  for (const batch of input.renderBatches) {
    if (batch.finalized_export_id) {
      ids.add(batch.finalized_export_id)
    }
  }

  return ids
}

function buildRollups(input: {
  records: CreativePerformanceRecord[]
  key: (record: CreativePerformanceRecord) => string | null
  label: (record: CreativePerformanceRecord) => string | null
}) {
  const groups = new Map<
    string,
    {
      label: string
      records: CreativePerformanceRecord[]
    }
  >()

  for (const record of input.records) {
    const key = input.key(record)

    if (!key) {
      continue
    }

    const label = input.label(record) ?? key
    const current = groups.get(key) ?? {
      label,
      records: []
    }

    current.records.push(record)
    groups.set(key, current)
  }

  return [...groups.entries()].map(([id, group]) => ({
    id,
    label: group.label,
    recordCount: group.records.length,
    ...summarizeRecords(group.records)
  }))
}

function sortStrongest(
  left: CreativePerformanceRollup,
  right: CreativePerformanceRollup
) {
  if (right.roas !== left.roas) {
    return right.roas - left.roas
  }

  if (right.conversionRate !== left.conversionRate) {
    return right.conversionRate - left.conversionRate
  }

  return right.ctr - left.ctr
}

function sortWeakest(
  left: CreativePerformanceRollup,
  right: CreativePerformanceRollup
) {
  const leftHasSpendNoConversions = left.spendUsd > 0 && left.conversions === 0
  const rightHasSpendNoConversions =
    right.spendUsd > 0 && right.conversions === 0

  if (leftHasSpendNoConversions !== rightHasSpendNoConversions) {
    return leftHasSpendNoConversions ? -1 : 1
  }

  if (left.roas !== right.roas) {
    return left.roas - right.roas
  }

  return right.spendUsd - left.spendUsd
}

function lastMetricDate(records: CreativePerformanceRecord[]) {
  return (
    records
      .map((record) => record.metric_date)
      .sort((left, right) => right.localeCompare(left))[0] ?? null
  )
}

function buildTrackingRows(input: {
  activationPackages: ActivationPackageRecord[]
  exports: ExportRecord[]
  project: ProjectRecord
  records: CreativePerformanceRecord[]
  renderBatches: RenderBatchRecord[]
}) {
  const finalizedIds = finalizedExportIds({
    project: input.project,
    renderBatches: input.renderBatches
  })
  const exportsById = new Map(
    input.exports.map((exportRecord) => [exportRecord.id, exportRecord])
  )
  const packageExportIds = new Set(
    input.activationPackages.map(
      (activationPackage) => activationPackage.export_id
    )
  )
  const finalizedExports = input.exports.filter(
    (exportRecord) =>
      exportRecord.status === "ready" &&
      (finalizedIds.has(exportRecord.id) ||
        packageExportIds.has(exportRecord.id))
  )
  const rows: CreativeActivationTrackingRow[] = []

  finalizedExports.forEach((exportRecord, index) => {
    const records = input.records.filter(
      (record) => record.export_id === exportRecord.id
    )
    const metrics = summarizeRecords(records)

    rows.push({
      activatedAt: null,
      activationPackageId: null,
      channel: null,
      createdAt: exportRecord.created_at,
      dataState: dataState(metrics, records.length),
      exportId: exportRecord.id,
      historicalAt: null,
      id: `export:${exportRecord.id}`,
      label: labelForExport(exportRecord, index),
      lastMetricDate: lastMetricDate(records),
      metrics,
      recordCount: records.length,
      status: records.length > 0 ? "historical" : "not_tracked"
    })
  })

  input.activationPackages.forEach((activationPackage, index) => {
    const records = input.records.filter(
      (record) => record.activation_package_id === activationPackage.id
    )
    const metrics = summarizeRecords(records)

    rows.push({
      activatedAt: activationPackage.activated_at,
      activationPackageId: activationPackage.id,
      channel: activationPackage.channel,
      createdAt: activationPackage.created_at,
      dataState: dataState(metrics, records.length),
      exportId: activationPackage.export_id,
      historicalAt: activationPackage.historical_at,
      id: `package:${activationPackage.id}`,
      label: labelForPackage(
        activationPackage,
        exportsById.get(activationPackage.export_id) ?? null,
        index
      ),
      lastMetricDate: lastMetricDate(records),
      metrics,
      recordCount: records.length,
      status: toTrackingStatus(activationPackage.tracking_status)
    })
  })

  return rows.sort((left, right) => {
    if (left.status === "active" && right.status !== "active") return -1
    if (right.status === "active" && left.status !== "active") return 1
    return right.createdAt.localeCompare(left.createdAt)
  })
}

function buildDimensionRollups(
  records: CreativePerformanceRecord[],
  dimension: CreativePerformanceDimensionKey,
  resolver: (record: CreativePerformanceRecord) => string | null
) {
  return buildRollups({
    key: resolver,
    label: resolver,
    records
  })
    .map((row) => ({
      ...row,
      dimension
    }))
    .sort(sortStrongest)
    .slice(0, 5)
}

function buildInsights(input: {
  trackingRows: CreativeActivationTrackingRow[]
  topCreatives: CreativePerformanceRollup[]
  weakCreatives: CreativePerformanceRollup[]
  records: CreativePerformanceRecord[]
}) {
  const insights: CreativePerformanceInsight[] = []
  const ctrCandidate = input.topCreatives
    .filter((row) => row.impressions >= 500)
    .sort((left, right) => right.ctr - left.ctr)[0]

  if (ctrCandidate) {
    insights.push({
      action: "promote",
      id: `best_ctr:${ctrCandidate.id}`,
      payload: {
        ctr: ctrCandidate.ctr,
        impressions: ctrCandidate.impressions,
        recordCount: ctrCandidate.recordCount
      },
      severity: "positive",
      targetLabel: ctrCandidate.label,
      type: "best_ctr"
    })
  }

  const conversionCandidate = input.topCreatives
    .filter((row) => row.clicks >= 20 && row.conversions > 0)
    .sort((left, right) => right.conversionRate - left.conversionRate)[0]

  if (conversionCandidate) {
    insights.push({
      action: "iterate",
      id: `best_conversion_rate:${conversionCandidate.id}`,
      payload: {
        clicks: conversionCandidate.clicks,
        conversionRate: conversionCandidate.conversionRate,
        conversions: conversionCandidate.conversions
      },
      severity: "positive",
      targetLabel: conversionCandidate.label,
      type: "best_conversion_rate"
    })
  }

  const weakCandidate = input.weakCreatives.find(
    (row) => row.spendUsd >= 50 && row.conversions === 0
  )

  if (weakCandidate) {
    insights.push({
      action: "pause",
      id: `high_spend_low_conversion:${weakCandidate.id}`,
      payload: {
        conversions: weakCandidate.conversions,
        spendUsd: weakCandidate.spendUsd
      },
      severity: "warning",
      targetLabel: weakCandidate.label,
      type: "high_spend_low_conversion"
    })
  }

  const activeWithoutData = input.trackingRows.find(
    (row) => row.status === "active" && row.recordCount === 0
  )

  if (activeWithoutData) {
    insights.push({
      action: "collect_data",
      id: `low_signal:${activeWithoutData.id}`,
      payload: {
        recordCount: activeWithoutData.recordCount
      },
      severity: "neutral",
      targetLabel: activeWithoutData.label,
      type: "low_signal"
    })
  }

  const retestCandidate = input.trackingRows.find(
    (row) =>
      row.status === "tracking_ready" && row.dataState === "no_performance_data"
  )

  if (retestCandidate) {
    insights.push({
      action: "retest",
      id: `retest_candidate:${retestCandidate.id}`,
      payload: {
        exportId: retestCandidate.exportId
      },
      severity: "neutral",
      targetLabel: retestCandidate.label,
      type: "retest_candidate"
    })
  }

  const recordsByExport = new Map<string, CreativePerformanceRecord[]>()

  for (const record of input.records) {
    if (!record.export_id) {
      continue
    }

    const records = recordsByExport.get(record.export_id) ?? []
    records.push(record)
    recordsByExport.set(record.export_id, records)
  }

  for (const [exportId, records] of recordsByExport) {
    const sorted = [...records].sort((left, right) =>
      left.metric_date.localeCompare(right.metric_date)
    )

    if (sorted.length < 3) {
      continue
    }

    const latest = sorted[sorted.length - 1]
    const prior = sorted.slice(0, -1)
    const priorMetrics = summarizeRecords(prior)
    const latestMetrics = summarizeRecords(latest ? [latest] : [])

    if (
      latestMetrics.impressions >= 500 &&
      priorMetrics.ctr > 0 &&
      latestMetrics.ctr <= priorMetrics.ctr * 0.7
    ) {
      insights.push({
        action: "iterate",
        id: `fatigue_risk:${exportId}`,
        payload: {
          latestCtr: latestMetrics.ctr,
          priorCtr: priorMetrics.ctr
        },
        severity: "warning",
        targetLabel:
          input.topCreatives.find((creative) => creative.id === exportId)
            ?.label ?? null,
        type: "fatigue_risk"
      })
      break
    }
  }

  return insights.slice(0, 6)
}

export function buildCreativePerformanceIntelligence(input: {
  activationPackages: ActivationPackageRecord[]
  exports: ExportRecord[]
  project: ProjectRecord
  records: CreativePerformanceRecord[]
  renderBatches: RenderBatchRecord[]
}): CreativePerformanceIntelligence {
  const trackingRows = buildTrackingRows(input)
  const creativeRollups = buildRollups({
    key: (record) => record.canonical_export_id ?? record.export_id,
    label: (record) =>
      record.hook ??
      record.call_to_action ??
      record.aspect_ratio ??
      record.export_id,
    records: input.records
  })
  const topCreatives = [...creativeRollups].sort(sortStrongest).slice(0, 6)
  const weakCreatives = [...creativeRollups].sort(sortWeakest).slice(0, 6)

  return {
    dimensions: {
      angle: buildDimensionRollups(
        input.records,
        "angle",
        (record) => record.angle
      ),
      aspect_ratio: buildDimensionRollups(
        input.records,
        "aspect_ratio",
        (record) => record.aspect_ratio
      ),
      brand_tone: buildDimensionRollups(
        input.records,
        "brand_tone",
        (record) => record.brand_tone
      ),
      call_to_action: buildDimensionRollups(
        input.records,
        "call_to_action",
        (record) => record.call_to_action
      ),
      concept: buildDimensionRollups(
        input.records,
        "concept",
        (record) => record.hook
      )
    },
    insights: buildInsights({
      records: input.records,
      topCreatives,
      trackingRows,
      weakCreatives
    }),
    topCreatives,
    totals: summarizeRecords(input.records),
    trackingRows,
    weakCreatives
  }
}

export const performanceIntelligenceInternals = {
  dataState,
  deriveMetrics,
  summarizeRecords
}
