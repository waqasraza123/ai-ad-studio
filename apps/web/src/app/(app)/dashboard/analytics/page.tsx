import { AnalyticsOverview } from "@/features/analytics/components/analytics-overview"
import { ProjectUsageBreakdown } from "@/features/analytics/components/project-usage-breakdown"
import { ProviderCostBreakdown } from "@/features/analytics/components/provider-cost-breakdown"
import { UsageEventsTable } from "@/features/analytics/components/usage-events-table"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { listUsageEventsByOwner } from "@/server/analytics/usage-event-repository"
import { listProjectsByOwner } from "@/server/projects/project-repository"

export default async function AnalyticsPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return null
  }

  const [usageEvents, projects] = await Promise.all([
    listUsageEventsByOwner(user.id),
    listProjectsByOwner(user.id)
  ])

  const projectsById = new Map(projects.map((project) => [project.id, project]))

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          Analytics
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
          Provider usage and cost tracking
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Track estimated provider cost per project and export, inspect usage events,
          and see which providers are driving spend.
        </p>
      </section>

      <AnalyticsOverview usageEvents={usageEvents} />
      <ProviderCostBreakdown usageEvents={usageEvents} />
      <ProjectUsageBreakdown projectsById={projectsById} usageEvents={usageEvents} />
      <UsageEventsTable usageEvents={usageEvents} />
    </div>
  )
}
