import { PlusSquare } from "lucide-react"
import Link from "next/link"
import { RunwayBrandPanel } from "@/components/branding/runway-brand-panel"
import { ProjectList } from "@/features/projects/components/project-list"
import { WorkspaceAdministrationPanel } from "@/features/settings/components/workspace-administration-panel"
import { toProjectCardViewModel } from "@/features/projects/mappers/project-view-model"
import { getServerI18n } from "@/lib/i18n/server"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getEffectiveOwnerLimits } from "@/server/billing/billing-service"
import { getDefaultBrandKitForOwner } from "@/server/brand-kits/brand-kit-repository"
import { listProjectsByOwner } from "@/server/projects/project-repository"
import { getOwnerGuardrails } from "@/server/settings/owner-guardrails-repository"

export default async function DashboardPage() {
  const { formatDate, t } = await getServerI18n()
  const user = await getAuthenticatedUser()

  if (!user) {
    return null
  }

  let projectsLoadFailed = false
  let viewModels: ReturnType<typeof toProjectCardViewModel>[] = []
  let administrationUnavailable = false
  let brandKit = null
  let guardrails = null
  let billingLimits = null

  try {
    const projects = await listProjectsByOwner(user.id)
    viewModels = projects.map((project) =>
      toProjectCardViewModel(project, (value) => formatDate(value))
    )
  } catch (error) {
    projectsLoadFailed = true

    console.error("DashboardPage failed to load projects", {
      error,
      ownerId: user.id
    })
  }

  try {
    ;[brandKit, guardrails, billingLimits] = await Promise.all([
      getDefaultBrandKitForOwner(user.id),
      getOwnerGuardrails(user.id),
      getEffectiveOwnerLimits(user.id)
    ])
  } catch (error) {
    administrationUnavailable = true

    console.error("DashboardPage failed to load workspace administration", {
      error,
      ownerId: user.id
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px] xl:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
              {t("dashboard.home.eyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
              {t("dashboard.home.title")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              {t("dashboard.home.description")}
            </p>

            <div className="mt-5">
              <Link
                href="/dashboard/projects/new"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-5 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
              >
                <PlusSquare className="h-4 w-4" />
                <span>{t("dashboard.home.newProject")}</span>
              </Link>
            </div>
          </div>

          <RunwayBrandPanel
            eyebrow={t("dashboard.home.providerEyebrow")}
            title={t("dashboard.home.providerTitle")}
            description={t("dashboard.home.providerDescription")}
          />
        </div>
      </section>

      <WorkspaceAdministrationPanel
        brandKit={brandKit}
        guardrails={guardrails}
        limits={billingLimits}
        unavailable={administrationUnavailable}
      />

      <ProjectList
        projects={viewModels}
        projectsLoadFailed={projectsLoadFailed}
      />
    </div>
  )
}
