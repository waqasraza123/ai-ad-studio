import Link from "next/link"
import type { ReactNode } from "react"
import { LayoutDashboard, PlusSquare, Sparkles, Video } from "lucide-react"
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
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_24rem),linear-gradient(180deg,#050816_0%,#0f172a_100%)] text-slate-50">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6 lg:py-6">
        <aside className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold tracking-tight text-white">
              AI Ad Studio
            </Link>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-200">
              Phase 2
            </span>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              Workspace
            </p>
            <p className="mt-2 text-sm font-medium text-slate-100">
              Portfolio mode
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Premium AI ad generation with a constrained workflow.
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
                  <Icon className="h-4 w-4 text-slate-400 transition group-hover:text-indigo-300" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-10 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-indigo-200/80">
              Render profile
            </p>
            <p className="mt-2 text-sm font-medium text-white">10s vertical ads</p>
            <p className="mt-1 text-sm text-indigo-100/75">
              3 concepts, 1 preview frame each, 1 final export.
            </p>
          </div>
        </aside>

        <div className="flex min-h-full flex-col rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Product shell
              </p>
              <h1 className="mt-2 text-xl font-semibold tracking-tight text-white">
                Premium frontend foundation
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 md:block">
                Single-user portfolio mode
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-semibold text-white">
                WR
              </div>
            </div>
          </header>

          <main className="flex-1 p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
