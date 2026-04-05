import Link from "next/link"
import type { ReactNode } from "react"
import { LayoutDashboard, LogOut, PlusSquare, Sparkles, Video } from "lucide-react"
import { signOut } from "@/app/(app)/actions"
import { RunwayBrandPanel } from "@/components/branding/runway-brand-panel"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.14),transparent_28rem),linear-gradient(180deg,#050816_0%,#0b1224_100%)] text-slate-50">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6 lg:py-6">
        <aside className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.36)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold tracking-tight text-white">
              AI Ad Studio
            </Link>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              Workspace
            </p>
            <p className="mt-2 text-sm font-medium text-slate-100">
              Studio mode
            </p>
            <p className="mt-1 text-sm text-slate-400">
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
                    "group flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm text-slate-300 transition hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4 text-slate-400 transition group-hover:text-amber-200" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-10 rounded-[1.25rem] border border-amber-400/20 bg-amber-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-amber-200/80">
              Render profile
            </p>
            <p className="mt-2 text-sm font-medium text-white">10s vertical ads</p>
            <p className="mt-1 text-sm text-amber-100/75">
              3 concepts, 1 preview frame each, 1 final export.
            </p>
          </div>

          <RunwayBrandPanel
            className="mt-6"
            eyebrow="Motion provider"
            title="Runway-backed generation"
            description="Dashboard execution expects a paid Runway subscription for preview and scene-video jobs."
            compact
          />
        </aside>

        <div className="flex min-h-full flex-col rounded-[1.75rem] border border-white/10 bg-white/[0.032] shadow-[0_28px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Studio
              </p>
              <h1 className="mt-2 text-xl font-semibold tracking-tight text-white">
                Production workspace
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {userEmail ? (
                <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 md:block">
                  {userEmail}
                </div>
              ) : (
                <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 md:block">
                  Auth not configured
                </div>
              )}

              {userEmail ? (
                <form action={signOut}>
                  <FormSubmitButton
                    variant="secondary"
                    size="sm"
                    pendingLabel="Signing out…"
                    className="gap-2 border-white/10 bg-white/[0.05] hover:bg-white/[0.08]"
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
