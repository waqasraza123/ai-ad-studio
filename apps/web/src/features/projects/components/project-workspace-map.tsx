import Link from "next/link"
import {
  ArrowUpRight,
  BarChart3,
  LayoutDashboard,
  PlusSquare,
  Settings2,
  Video
} from "lucide-react"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getServerI18n } from "@/lib/i18n/server"

type ProjectWorkspaceMapProps = {
  projectName: string
}

const workspaceLinks = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    labelKey: "header.app.nav.dashboard"
  },
  {
    href: "/dashboard/analytics",
    icon: BarChart3,
    labelKey: "header.app.nav.analytics"
  },
  {
    href: "/dashboard/exports",
    icon: Video,
    labelKey: "header.app.nav.exports"
  },
  {
    href: "/dashboard/projects/new",
    icon: PlusSquare,
    labelKey: "header.app.nav.newProject"
  },
  {
    href: "/dashboard/settings",
    icon: Settings2,
    labelKey: "header.app.nav.settings"
  }
] as const

export async function ProjectWorkspaceMap({
  projectName
}: ProjectWorkspaceMapProps) {
  const { t } = await getServerI18n()

  return (
    <SurfaceCard className="overflow-hidden p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            {t("projects.workspaceMap.eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
            {t("projects.workspaceMap.title")}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            {t("projects.workspaceMap.description", { value: projectName })}
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              {t("projects.workspaceMap.stageBrief")}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              {t("projects.workspaceMap.stageConcepts")}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              {t("projects.workspaceMap.stageRender")}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              {t("projects.workspaceMap.stageExport")}
            </span>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
              {t("projects.workspaceMap.jumpLabel")}
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {workspaceLinks.map((item) => {
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-amber-200 transition group-hover:text-amber-100" />
                      <span>{t(item.labelKey)}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:text-slate-200" />
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            <p className="font-medium text-amber-50">
              {t("projects.workspaceMap.adminTitle")}
            </p>
            <p className="mt-2 leading-7 text-amber-100/85">
              {t("projects.workspaceMap.adminDescription")}
            </p>
            <Link
              href="/dashboard/settings"
              className="mt-3 inline-flex items-center gap-2 font-medium text-amber-50 transition hover:text-white"
            >
              <span>{t("projects.workspaceMap.adminAction")}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </SurfaceCard>
  )
}
