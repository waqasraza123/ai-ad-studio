import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { ConfigurationRequired } from "@/components/auth/configuration-required"
import { AppShell } from "@/components/layout/app-shell"
import { hasSupabaseAuthConfiguration } from "@/lib/env"
import { getServerI18n } from "@/lib/i18n/server"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"

type DashboardLayoutProps = {
  children: ReactNode
}

export default async function DashboardLayout({
  children
}: DashboardLayoutProps) {
  const { t } = await getServerI18n()

  if (!hasSupabaseAuthConfiguration()) {
    return (
      <AppShell>
        <ConfigurationRequired
          title={t("auth.configuration.dashboardTitle")}
          description={t("auth.configuration.dashboardDescription")}
        />
      </AppShell>
    )
  }

  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <AppShell userEmail={user.email ?? t("header.app.signedInFallback")}>
      {children}
    </AppShell>
  )
}
