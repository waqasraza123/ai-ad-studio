import Link from "next/link"
import type { ReactNode } from "react"
import { LogOut } from "lucide-react"
import { signOut } from "@/app/(app)/actions"
import { RunwayBrandPanel } from "@/components/branding/runway-brand-panel"
import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { DashboardSidebarNav } from "@/components/layout/dashboard-sidebar-nav"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { RuntimeSetupLauncher } from "@/components/runtime/runtime-setup-launcher"
import { ThemeColorModeSwitch } from "@/components/theme/theme-color-mode-switch"
import { getServerI18n } from "@/lib/i18n/server"
import { ThemePalettePicker } from "@/components/theme/theme-palette-picker"

type AppShellProps = {
  children: ReactNode
  userEmail?: string
}

export async function AppShell({ children, userEmail }: AppShellProps) {
  const { t } = await getServerI18n()

  return (
    <div className="theme-page-shell min-h-screen text-[var(--foreground)]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6 lg:py-6">
        <aside className="theme-sidebar-shell rounded-[1.75rem] border p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-[var(--foreground)]"
            >
              {t("app.name")}
            </Link>
          </div>

          <div className="theme-soft-panel mt-8 rounded-2xl border p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
              {t("header.app.workspace")}
            </p>
            <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
              {t("header.app.studioMode")}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {t("header.app.workspaceDescription")}
            </p>
          </div>

          <DashboardSidebarNav />

          <ThemePalettePicker />
          <RuntimeSetupLauncher context="dashboard" triggerLabel={t("runtime.apiGpuSetup")} />

          <div className="theme-accent-panel mt-10 rounded-[1.25rem] border p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[rgb(var(--accent-tertiary-rgb))]">
              {t("header.app.renderProfile")}
            </p>
            <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
              {t("header.app.renderProfileTitle")}
            </p>
            <p className="mt-1 text-sm text-[color:var(--soft-foreground)] opacity-80">
              {t("header.app.renderProfileDescription")}
            </p>
          </div>

          <RunwayBrandPanel
            className="mt-6"
            eyebrow={t("header.app.providerEyebrow")}
            title={t("header.app.providerTitle")}
            description={t("header.app.providerDescription")}
            compact
          />
        </aside>

        <div className="theme-main-shell flex min-h-full flex-col rounded-[1.75rem] border backdrop-blur-xl">
          <header className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                {t("header.app.studio")}
              </p>
              <h1 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                {t("header.app.productionWorkspace")}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher compact />
              <ThemeColorModeSwitch compact />
              {userEmail ? (
                <div className="theme-soft-panel theme-bidi-isolate hidden rounded-full border px-4 py-2 text-sm text-[var(--soft-foreground)] md:block">
                  {userEmail}
                </div>
              ) : (
                <div className="theme-soft-panel hidden rounded-full border px-4 py-2 text-sm text-[var(--soft-foreground)] md:block">
                  {t("header.app.authNotConfigured")}
                </div>
              )}

              {userEmail ? (
                <form action={signOut}>
                  <FormSubmitButton
                    variant="secondary"
                    size="sm"
                    pendingLabel={t("header.app.signingOut")}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t("header.app.signOut")}</span>
                  </FormSubmitButton>
                </form>
              ) : null}
            </div>
          </header>

          <main className="flex-1 p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
