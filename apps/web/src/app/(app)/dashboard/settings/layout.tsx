import type { ReactNode } from "react"
import { SettingsSubnav } from "@/features/settings/components/settings-subnav"
import { getServerI18n } from "@/lib/i18n/server"

type DashboardSettingsLayoutProps = {
  children: ReactNode
}

export default async function DashboardSettingsLayout({
  children
}: DashboardSettingsLayoutProps) {
  const { t } = await getServerI18n()

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          {t("settings.section.eyebrow")}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
          {t("settings.section.title")}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          {t("settings.section.description")}
        </p>

        <div className="mt-6">
          <SettingsSubnav />
        </div>
      </section>

      {children}
    </div>
  )
}
