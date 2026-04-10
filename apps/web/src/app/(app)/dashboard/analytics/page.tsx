import { getFormErrorMessage } from "@/lib/form-error-messages"
import { AnalyticsOverview } from "@/features/analytics/components/analytics-overview"
import { CreativePerformanceBreakdown } from "@/features/analytics/components/creative-performance-breakdown"
import { CreativePerformanceIngestionPanel } from "@/features/analytics/components/creative-performance-ingestion-panel"
import { CreativePerformanceOverview } from "@/features/analytics/components/creative-performance-overview"
import { buildCreativePerformanceSummary } from "@/features/analytics/lib/creative-performance-summary"
import { ProjectUsageBreakdown } from "@/features/analytics/components/project-usage-breakdown"
import { ProviderCostBreakdown } from "@/features/analytics/components/provider-cost-breakdown"
import { UsageEventsTable } from "@/features/analytics/components/usage-events-table"
import { getServerI18n } from "@/lib/i18n/server"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { listUsageEventsByOwner } from "@/server/analytics/usage-event-repository"
import { listCreativePerformanceRecordsByOwner } from "@/server/creative-performance/creative-performance-repository"
import { getEffectiveOwnerLimits } from "@/server/billing/billing-service"
import { listAllExportsByOwner } from "@/server/exports/export-repository"
import { listProjectsByOwner } from "@/server/projects/project-repository"

type AnalyticsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function readSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key]
  return Array.isArray(value) ? value[0] : value
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const { t } = await getServerI18n()
  const user = await getAuthenticatedUser()

  if (!user) {
    return null
  }

  const resolvedSearchParams = await searchParams
  const formErrorMessage = getFormErrorMessage(
    readSearchParam(resolvedSearchParams, "error"),
    t
  )
  const creativePerformanceSaved =
    readSearchParam(resolvedSearchParams, "creative_performance") === "recorded"

  const [usageEvents, creativePerformanceRecords, projects, billingLimits, exports] =
    await Promise.all([
    listUsageEventsByOwner(user.id),
    listCreativePerformanceRecordsByOwner(user.id),
    listProjectsByOwner(user.id),
    getEffectiveOwnerLimits(user.id),
    listAllExportsByOwner(user.id)
  ])

  const projectsById = new Map(projects.map((project) => [project.id, project]))
  const creativePerformanceSummary =
    buildCreativePerformanceSummary(creativePerformanceRecords)
  const exportOptions = exports.map((exportRecord) => ({
    id: exportRecord.id,
    label: [
      projectsById.get(exportRecord.project_id)?.name ?? t("common.words.unknownProject"),
      exportRecord.variant_key,
      exportRecord.aspect_ratio
    ].join(" · ")
  }))

  return (
    <div className="space-y-6">
      {formErrorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {formErrorMessage}
        </div>
      ) : null}

      {creativePerformanceSaved ? (
        <div className="rounded-[1.5rem] border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {t("analytics.creative.ingestion.success")}
        </div>
      ) : null}

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          {t("analytics.eyebrow")}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
          {t("analytics.title")}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          {t("analytics.description")}
        </p>
      </section>

      <AnalyticsOverview usageEvents={usageEvents} />
      <ProviderCostBreakdown usageEvents={usageEvents} />
      <ProjectUsageBreakdown projectsById={projectsById} usageEvents={usageEvents} />
      <UsageEventsTable usageEvents={usageEvents} />

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          {t("analytics.creative.eyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
          {t("analytics.creative.title")}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          {t("analytics.creative.description")}
        </p>
      </section>

      {billingLimits.featureAccess.allowCreativePerformanceAnalytics ? (
        <>
          <CreativePerformanceOverview summary={creativePerformanceSummary} />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <CreativePerformanceBreakdown
              projectsById={projectsById}
              summary={creativePerformanceSummary}
            />
            <CreativePerformanceIngestionPanel
              exportOptions={exportOptions}
              ingestionEnabled={
                billingLimits.featureAccess.allowCreativePerformanceIngestion
              }
            />
          </div>
        </>
      ) : (
        <section className="rounded-[2rem] border border-amber-400/20 bg-amber-500/10 p-6 text-sm text-amber-100">
          {t("analytics.creative.upgradeRequired")}
        </section>
      )}
    </div>
  )
}
