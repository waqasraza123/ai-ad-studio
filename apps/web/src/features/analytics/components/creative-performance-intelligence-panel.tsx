import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { updateActivationTrackingAction } from "@/features/activation/actions/update-activation-tracking"
import { CreativePerformanceIngestionPanel } from "@/features/analytics/components/creative-performance-ingestion-panel"
import { getServerI18n } from "@/lib/i18n/server"
import type {
  CreativeActivationTrackingRow,
  CreativePerformanceDimensionKey,
  CreativePerformanceInsight,
  CreativePerformanceIntelligence,
  CreativePerformanceRollup
} from "@/server/creative-performance/performance-intelligence"

type CreativePerformanceTargetOption = {
  activationPackageId: string | null
  exportId: string
  id: string
  label: string
}

type CreativePerformanceIntelligencePanelProps = {
  analyticsEnabled: boolean
  ingestionEnabled: boolean
  intelligence: CreativePerformanceIntelligence
  projectId: string
  targetOptions: CreativePerformanceTargetOption[]
}

function statusKey(status: CreativeActivationTrackingRow["status"]) {
  if (status === "active")
    return "analytics.intelligence.status.active" as const
  if (status === "historical")
    return "analytics.intelligence.status.historical" as const
  if (status === "tracking_ready")
    return "analytics.intelligence.status.trackingReady" as const
  return "analytics.intelligence.status.notTracked" as const
}

function dataStateKey(state: CreativeActivationTrackingRow["dataState"]) {
  if (state === "tracked")
    return "analytics.intelligence.dataState.tracked" as const
  if (state === "low_signal")
    return "analytics.intelligence.dataState.lowSignal" as const
  return "analytics.intelligence.dataState.noData" as const
}

function dimensionKey(dimension: CreativePerformanceDimensionKey) {
  if (dimension === "angle")
    return "analytics.intelligence.dimension.angle" as const
  if (dimension === "aspect_ratio")
    return "analytics.intelligence.dimension.aspectRatio" as const
  if (dimension === "brand_tone")
    return "analytics.intelligence.dimension.brandTone" as const
  if (dimension === "call_to_action")
    return "analytics.intelligence.dimension.callToAction" as const
  return "analytics.intelligence.dimension.concept" as const
}

function insightTitleKey(insight: CreativePerformanceInsight) {
  if (insight.type === "best_ctr")
    return "analytics.intelligence.insight.bestCtr.title" as const
  if (insight.type === "best_conversion_rate") {
    return "analytics.intelligence.insight.bestConversionRate.title" as const
  }
  if (insight.type === "high_spend_low_conversion") {
    return "analytics.intelligence.insight.highSpendLowConversion.title" as const
  }
  if (insight.type === "low_signal")
    return "analytics.intelligence.insight.lowSignal.title" as const
  if (insight.type === "retest_candidate") {
    return "analytics.intelligence.insight.retestCandidate.title" as const
  }
  return "analytics.intelligence.insight.fatigueRisk.title" as const
}

function insightBodyKey(insight: CreativePerformanceInsight) {
  if (insight.type === "best_ctr")
    return "analytics.intelligence.insight.bestCtr.body" as const
  if (insight.type === "best_conversion_rate") {
    return "analytics.intelligence.insight.bestConversionRate.body" as const
  }
  if (insight.type === "high_spend_low_conversion") {
    return "analytics.intelligence.insight.highSpendLowConversion.body" as const
  }
  if (insight.type === "low_signal")
    return "analytics.intelligence.insight.lowSignal.body" as const
  if (insight.type === "retest_candidate") {
    return "analytics.intelligence.insight.retestCandidate.body" as const
  }
  return "analytics.intelligence.insight.fatigueRisk.body" as const
}

function insightActionKey(insight: CreativePerformanceInsight) {
  if (insight.action === "promote")
    return "analytics.intelligence.action.promote" as const
  if (insight.action === "iterate")
    return "analytics.intelligence.action.iterate" as const
  if (insight.action === "pause")
    return "analytics.intelligence.action.pause" as const
  if (insight.action === "retest")
    return "analytics.intelligence.action.retest" as const
  return "analytics.intelligence.action.collect_data" as const
}

async function MetricSummary({
  intelligence
}: {
  intelligence: CreativePerformanceIntelligence
}) {
  const { formatCurrency, formatNumber, t } = await getServerI18n()

  return (
    <div className="grid gap-3 md:grid-cols-5">
      <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          {t("common.words.impressions")}
        </p>
        <p className="mt-2 text-xl font-semibold text-white">
          {formatNumber(intelligence.totals.impressions)}
        </p>
      </div>
      <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          {t("common.words.clicks")}
        </p>
        <p className="mt-2 text-xl font-semibold text-white">
          {formatNumber(intelligence.totals.clicks)}
        </p>
      </div>
      <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          {t("common.words.spend")}
        </p>
        <p className="mt-2 text-xl font-semibold text-white">
          {formatCurrency(intelligence.totals.spendUsd, "USD")}
        </p>
      </div>
      <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          {t("common.words.conversions")}
        </p>
        <p className="mt-2 text-xl font-semibold text-white">
          {formatNumber(intelligence.totals.conversions)}
        </p>
      </div>
      <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          {t("common.words.roas")}
        </p>
        <p className="mt-2 text-xl font-semibold text-white">
          {formatNumber(intelligence.totals.roas, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          })}
        </p>
      </div>
    </div>
  )
}

async function TrackingTable({
  projectId,
  rows
}: {
  projectId: string
  rows: CreativeActivationTrackingRow[]
}) {
  const { formatCurrency, formatDate, formatNumber, t } = await getServerI18n()

  return (
    <SurfaceCard className="p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("analytics.intelligence.tracking.title")}
      </p>
      {rows.length === 0 ? (
        <div className="mt-4 rounded-[1rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
          {t("analytics.intelligence.tracking.empty")}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{row.label}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {row.channel ??
                      t("analytics.intelligence.tracking.canonical")}{" "}
                    ·{" "}
                    {row.lastMetricDate
                      ? t("analytics.intelligence.lastMetric", {
                          value: formatDate(row.lastMetricDate)
                        })
                      : t("analytics.intelligence.noMetricDate")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-slate-200">
                    {t(statusKey(row.status))}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-slate-200">
                    {t(dataStateKey(row.dataState))}
                  </span>
                </div>
              </div>

              <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-4">
                <span>
                  {t("common.words.ctr")}:{" "}
                  {formatNumber(row.metrics.ctr, {
                    maximumFractionDigits: 2,
                    style: "percent"
                  })}
                </span>
                <span>
                  {t("common.words.conversionRate")}:{" "}
                  {formatNumber(row.metrics.conversionRate, {
                    maximumFractionDigits: 2,
                    style: "percent"
                  })}
                </span>
                <span>
                  {t("common.words.cpa")}:{" "}
                  {formatCurrency(row.metrics.cpa, "USD")}
                </span>
                <span>
                  {t("common.words.roas")}:{" "}
                  {formatNumber(row.metrics.roas, {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  })}
                </span>
              </div>

              {row.activationPackageId ? (
                <form
                  action={updateActivationTrackingAction.bind(
                    null,
                    projectId,
                    row.activationPackageId
                  )}
                  className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <input
                    className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
                    name="tracking_notes"
                    placeholder={t("analytics.intelligence.tracking.notes")}
                  />
                  <div className="flex flex-wrap gap-2">
                    <FormSubmitButton
                      name="tracking_status"
                      pendingLabel={t(
                        "analytics.intelligence.tracking.pending"
                      )}
                      value="tracking_ready"
                      variant="secondary"
                    >
                      {t("analytics.intelligence.tracking.markReady")}
                    </FormSubmitButton>
                    <FormSubmitButton
                      name="tracking_status"
                      pendingLabel={t(
                        "analytics.intelligence.tracking.pending"
                      )}
                      value="active"
                    >
                      {t("analytics.intelligence.tracking.markActive")}
                    </FormSubmitButton>
                    <FormSubmitButton
                      name="tracking_status"
                      pendingLabel={t(
                        "analytics.intelligence.tracking.pending"
                      )}
                      value="historical"
                      variant="secondary"
                    >
                      {t("analytics.intelligence.tracking.markHistorical")}
                    </FormSubmitButton>
                  </div>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </SurfaceCard>
  )
}

async function RollupList({
  rows,
  title
}: {
  rows: CreativePerformanceRollup[]
  title: string
}) {
  const { formatCurrency, formatNumber, t } = await getServerI18n()

  return (
    <SurfaceCard className="p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {title}
      </p>
      {rows.length === 0 ? (
        <div className="mt-4 rounded-[1rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
          {t("analytics.creative.empty")}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="text-sm font-medium text-white">{row.label}</p>
                <p className="text-xs text-slate-500">
                  {t("analytics.creative.recordCount", {
                    count: row.recordCount
                  })}
                </p>
              </div>
              <div className="mt-2 grid gap-2 text-xs text-slate-300 sm:grid-cols-3">
                <span>
                  {t("common.words.roas")}:{" "}
                  {formatNumber(row.roas, {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  })}
                </span>
                <span>
                  {t("common.words.ctr")}:{" "}
                  {formatNumber(row.ctr, {
                    maximumFractionDigits: 2,
                    style: "percent"
                  })}
                </span>
                <span>
                  {t("common.words.spend")}:{" "}
                  {formatCurrency(row.spendUsd, "USD")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </SurfaceCard>
  )
}

async function InsightCards({
  insights
}: {
  insights: CreativePerformanceInsight[]
}) {
  const { formatCurrency, formatNumber, t } = await getServerI18n()

  function formatPayloadValue(value: string | number | null) {
    if (typeof value !== "number") {
      return value ?? ""
    }

    return formatNumber(value, {
      maximumFractionDigits: 2
    })
  }

  return (
    <SurfaceCard className="p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("analytics.intelligence.insights.title")}
      </p>
      {insights.length === 0 ? (
        <div className="mt-4 rounded-[1rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
          {t("analytics.intelligence.insights.empty")}
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={
                insight.severity === "warning"
                  ? "rounded-[1.25rem] border border-amber-400/20 bg-amber-500/10 p-4"
                  : insight.severity === "positive"
                    ? "rounded-[1.25rem] border border-emerald-400/20 bg-emerald-500/10 p-4"
                    : "rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4"
              }
            >
              <p className="text-sm font-medium text-white">
                {t(insightTitleKey(insight))}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {t(insightBodyKey(insight), {
                  cpa: formatCurrency(Number(insight.payload.cpa ?? 0), "USD"),
                  ctr: formatNumber(Number(insight.payload.ctr ?? 0), {
                    maximumFractionDigits: 2,
                    style: "percent"
                  }),
                  target: insight.targetLabel,
                  value: formatPayloadValue(
                    insight.payload.spendUsd ??
                      insight.payload.conversionRate ??
                      insight.payload.latestCtr ??
                      null
                  )
                })}
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                {t(insightActionKey(insight))}
              </p>
            </div>
          ))}
        </div>
      )}
    </SurfaceCard>
  )
}

async function DimensionList({
  intelligence
}: {
  intelligence: CreativePerformanceIntelligence
}) {
  const { formatNumber, t } = await getServerI18n()
  const dimensions = Object.entries(intelligence.dimensions) as [
    CreativePerformanceDimensionKey,
    CreativePerformanceRollup[]
  ][]

  return (
    <SurfaceCard className="p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("analytics.intelligence.dimensions.title")}
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {dimensions.map(([dimension, rows]) => (
          <div
            key={dimension}
            className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4"
          >
            <p className="text-sm font-medium text-white">
              {t(dimensionKey(dimension))}
            </p>
            {rows.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                {t("analytics.creative.empty")}
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {rows.slice(0, 3).map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="min-w-0 truncate text-slate-300">
                      {row.label}
                    </span>
                    <span className="shrink-0 text-slate-500">
                      {formatNumber(row.roas, {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </SurfaceCard>
  )
}

export async function CreativePerformanceIntelligencePanel({
  analyticsEnabled,
  ingestionEnabled,
  intelligence,
  projectId,
  targetOptions
}: CreativePerformanceIntelligencePanelProps) {
  const { t } = await getServerI18n()

  return (
    <section className="space-y-4">
      <SurfaceCard className="p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          {t("analytics.intelligence.eyebrow")}
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          {t("analytics.intelligence.title")}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          {t("analytics.intelligence.description")}
        </p>
      </SurfaceCard>

      {!analyticsEnabled ? (
        <section className="rounded-[2rem] border border-amber-400/20 bg-amber-500/10 p-6 text-sm text-amber-100">
          {t("analytics.creative.upgradeRequired")}
        </section>
      ) : (
        <>
          <MetricSummary intelligence={intelligence} />
          <InsightCards insights={intelligence.insights} />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
            <div className="space-y-4">
              <TrackingTable
                projectId={projectId}
                rows={intelligence.trackingRows}
              />
              <div className="grid gap-4 xl:grid-cols-2">
                <RollupList
                  rows={intelligence.topCreatives}
                  title={t("analytics.intelligence.topCreatives")}
                />
                <RollupList
                  rows={intelligence.weakCreatives}
                  title={t("analytics.intelligence.weakCreatives")}
                />
              </div>
              <DimensionList intelligence={intelligence} />
            </div>
            <CreativePerformanceIngestionPanel
              exportOptions={targetOptions}
              ingestionEnabled={ingestionEnabled}
            />
          </div>
        </>
      )}
    </section>
  )
}
