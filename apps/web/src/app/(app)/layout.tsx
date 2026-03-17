import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { ConfigurationRequired } from "@/components/auth/configuration-required"
import { AppShell } from "@/components/layout/app-shell"
import { hasSupabaseAuthConfiguration } from "@/lib/env"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"

type DashboardLayoutProps = {
  children: ReactNode
}

export default async function DashboardLayout({
  children
}: DashboardLayoutProps) {
  if (!hasSupabaseAuthConfiguration()) {
    return (
      <AppShell>
        <ConfigurationRequired
          title="Auth is not configured in this environment"
          description="Protected routes are wired. Add Supabase credentials locally to validate real sessions, redirects, and ownership-protected flows."
        />
      </AppShell>
    )
  }

  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/login")
  }

  return <AppShell userEmail={user.email ?? "Signed in"}>{children}</AppShell>
}
