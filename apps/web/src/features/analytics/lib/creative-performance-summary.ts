import type { CreativePerformanceRecord } from "@/server/database/types"

export type CreativePerformanceTotals = {
  impressions: number
  clicks: number
  spendUsd: number
  conversions: number
  conversionValueUsd: number
  ctr: number
  cpc: number
  cpa: number
  roas: number
}

export type CreativePerformanceBreakdownRow = CreativePerformanceTotals & {
  label: string
  recordCount: number
}

export type TopCreativePerformanceRow = CreativePerformanceTotals & {
  exportId: string | null
  canonicalExportId: string | null
  projectId: string
  label: string
  recordCount: number
  channel: string
  aspectRatio: string | null
}

export type CreativePerformanceSummary = {
  totals: CreativePerformanceTotals
  topExports: TopCreativePerformanceRow[]
  byHook: CreativePerformanceBreakdownRow[]
  byCallToAction: CreativePerformanceBreakdownRow[]
  byAspectRatio: CreativePerformanceBreakdownRow[]
}

function round(value: number, digits: number) {
  return Number(value.toFixed(digits))
}

function emptyTotals(): CreativePerformanceTotals {
  return {
    clicks: 0,
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

function withDerivedMetrics(input: {
  clicks: number
  conversionValueUsd: number
  conversions: number
  impressions: number
  spendUsd: number
}): CreativePerformanceTotals {
  const ctr = input.impressions > 0 ? input.clicks / input.impressions : 0
  const cpc = input.clicks > 0 ? input.spendUsd / input.clicks : 0
  const cpa = input.conversions > 0 ? input.spendUsd / input.conversions : 0
  const roas = input.spendUsd > 0 ? input.conversionValueUsd / input.spendUsd : 0

  return {
    clicks: input.clicks,
    conversionValueUsd: input.conversionValueUsd,
    conversions: input.conversions,
    cpa: round(cpa, 4),
    cpc: round(cpc, 4),
    ctr: round(ctr, 6),
    impressions: input.impressions,
    roas: round(roas, 6),
    spendUsd: input.spendUsd
  }
}

function accumulate(target: CreativePerformanceTotals, record: CreativePerformanceRecord) {
  target.clicks += Number(record.clicks ?? 0)
  target.conversionValueUsd += Number(record.conversion_value_usd ?? 0)
  target.conversions += Number(record.conversions ?? 0)
  target.impressions += Number(record.impressions ?? 0)
  target.spendUsd += Number(record.spend_usd ?? 0)
}

function finalizeTotals(totals: CreativePerformanceTotals) {
  return withDerivedMetrics(totals)
}

function buildBreakdown(
  records: CreativePerformanceRecord[],
  resolver: (record: CreativePerformanceRecord) => string | null
) {
  const groups = new Map<string, CreativePerformanceTotals & { recordCount: number }>()

  for (const record of records) {
    const label = resolver(record) ?? "Unknown"
    const current = groups.get(label) ?? {
      ...emptyTotals(),
      recordCount: 0
    }

    accumulate(current, record)
    current.recordCount += 1
    groups.set(label, current)
  }

  return [...groups.entries()]
    .map(([label, totals]) => ({
      label,
      recordCount: totals.recordCount,
      ...finalizeTotals(totals)
    }))
    .sort((left, right) => {
      if (right.roas !== left.roas) {
        return right.roas - left.roas
      }

      return right.spendUsd - left.spendUsd
    })
    .slice(0, 6)
}

export function buildCreativePerformanceSummary(
  records: CreativePerformanceRecord[]
): CreativePerformanceSummary {
  const totals = emptyTotals()

  for (const record of records) {
    accumulate(totals, record)
  }

  const topExportMap = new Map<
    string,
    TopCreativePerformanceRow & {
      clicks: number
      conversionValueUsd: number
      conversions: number
      impressions: number
      spendUsd: number
    }
  >()

  for (const record of records) {
    const key = record.canonical_export_id ?? record.export_id ?? `${record.project_id}:${record.channel}`
    const label =
      record.hook ?? record.call_to_action ?? record.aspect_ratio ?? record.export_id ?? "Creative"
    const current = topExportMap.get(key) ?? {
      ...emptyTotals(),
      aspectRatio: record.aspect_ratio,
      canonicalExportId: record.canonical_export_id,
      channel: record.channel,
      exportId: record.export_id,
      label,
      projectId: record.project_id,
      recordCount: 0
    }

    accumulate(current, record)
    current.recordCount += 1
    topExportMap.set(key, current)
  }

  return {
    byAspectRatio: buildBreakdown(records, (record) => record.aspect_ratio),
    byCallToAction: buildBreakdown(records, (record) => record.call_to_action),
    byHook: buildBreakdown(records, (record) => record.hook),
    topExports: [...topExportMap.values()]
      .map((row) => ({
        ...row,
        ...finalizeTotals(row)
      }))
      .sort((left, right) => {
        if (right.conversionValueUsd !== left.conversionValueUsd) {
          return right.conversionValueUsd - left.conversionValueUsd
        }

        return right.roas - left.roas
      })
      .slice(0, 6),
    totals: finalizeTotals(totals)
  }
}
