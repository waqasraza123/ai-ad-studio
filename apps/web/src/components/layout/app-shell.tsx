import Link from "next/link"
import type { ReactNode } from "react"
import { LayoutDashboard, LogOut, PlusSquare, Sparkles, Video } from "lucide-react"
import { signOut } from "@/app/(app)/actions"
import { RunwayBrandPanel } from "@/components/branding/runway-brand-panel"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { RuntimeSetupLauncher } from "@/components/runtime/runtime-setup-launcher"
import { ThemePalettePicker } from "@/components/theme/theme-palette-picker"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard"
  },
  {
    href: "/dashboard/projects/new",
    icon: PlusSquare,
    label: "New project"
  },
  {
    href: "/dashboard/concepts",
    icon: Sparkles,
    label: "Concepts"
  },
  {
    href: "/dashboard/exports",
    icon: Video,
    label: "Exports"
  }
]

type AppShellProps = {
  children: ReactNode
  userEmail?: string
}

export function AppShell({ children, userEmail }: AppShellProps) {
  return (
    <div className="theme-page-shell min-h-screen text-[var(--foreground)]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6 lg:py-6">
        <aside className="theme-sidebar-shell rounded-[1.75rem] border p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold tracking-tight text-white">
              AI Ad Studio
            </Link>
          </div>

          <div className="theme-soft-panel mt-8 rounded-2xl border p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
              Workspace
            </p>
            <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
              Studio mode
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Structured AI ad generation with a focused workflow.
            </p>
          </div>

          <nav className="mt-8 flex flex-col gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm text-[var(--muted-foreground)] transition hover:border-[var(--border)] hover:bg-[var(--background-strong)] hover:text-[var(--foreground)]"
                  )}
                >
                  <Icon className="h-4 w-4 text-[var(--muted-foreground)] transition group-hover:text-[rgb(var(--accent-rgb))]" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <ThemePalettePicker />
          <RuntimeSetupLauncher context="dashboard" triggerLabel="API & GPU setup" />

          <div className="theme-accent-panel mt-10 rounded-[1.25rem] border p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[rgb(var(--accent-tertiary-rgb))]">
              Render profile
            </p>
            <p className="mt-2 text-sm font-medium text-white">10s vertical ads</p>
            <p className="mt-1 text-sm text-[color:var(--soft-foreground)] opacity-80">
              3 concepts, 1 preview frame each, 1 final export.
            </p>
          </div>

          <RunwayBrandPanel
            className="mt-6"
            eyebrow="Motion provider"
            title="Hosted provider path"
            description="Runway remains the fastest full-capability option. Use the runtime setup panel for hybrid and local HTTP guidance."
            compact
          />
        </aside>

        <div className="theme-main-shell flex min-h-full flex-col rounded-[1.75rem] border backdrop-blur-xl">
          <header className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                Studio
              </p>
              <h1 className="mt-2 text-xl font-semibold tracking-tight text-white">
                Production workspace
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {userEmail ? (
                <div className="theme-soft-panel hidden rounded-full border px-4 py-2 text-sm text-[var(--soft-foreground)] md:block">
                  {userEmail}
                </div>
              ) : (
                <div className="theme-soft-panel hidden rounded-full border px-4 py-2 text-sm text-[var(--soft-foreground)] md:block">
                  Auth not configured
                </div>
              )}

              {userEmail ? (
                <form action={signOut}>
                  <FormSubmitButton
                    variant="secondary"
                    size="sm"
                    pendingLabel="Signing out…"
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
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
