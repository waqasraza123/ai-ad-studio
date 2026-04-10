import type { ReactNode } from "react"
import { PageIntro } from "@/components/layout/page-frame"
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
        <PageIntro
          eyebrow={t("settings.section.eyebrow")}
          title={t("settings.section.title")}
          description={t("settings.section.description")}
        />

        <div className="mt-6">
          <SettingsSubnav />
        </div>
      </section>

      {children}
    </div>
  )
}
