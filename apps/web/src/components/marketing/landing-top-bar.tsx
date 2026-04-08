import Link from "next/link"
import { ArrowRight, LogIn } from "lucide-react"
import { Button } from "@/components/primitives/button"
import { ThemeColorModeSwitch } from "@/components/theme/theme-color-mode-switch"

export function LandingTopBar() {
  return (
    <header className="landing-top-bar-glow theme-top-bar sticky top-0 z-40 relative overflow-hidden border-b backdrop-blur-md">
      <div
        className="landing-top-bar-sheen pointer-events-none absolute inset-x-0 top-0 z-10"
        aria-hidden
      />
      <div className="relative z-[1] mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-[-0.03em] text-[var(--foreground)] transition hover:text-[rgb(var(--accent-rgb))]"
          >
            AI Ad Studio
          </Link>

          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <a
              href="#workflow"
              className="theme-marketing-nav-link rounded-full px-3 py-2"
            >
              Workflow
            </a>
            <a
              href="#samples"
              className="theme-marketing-nav-link rounded-full px-3 py-2"
            >
              Samples
            </a>
            <a
              href="#plans"
              className="theme-marketing-nav-link rounded-full px-3 py-2"
            >
              Plans
            </a>
            <a
              href="#faq"
              className="theme-marketing-nav-link rounded-full px-3 py-2"
            >
              FAQ
            </a>
            <Link
              href="/showcase"
              className="theme-marketing-nav-link rounded-full px-3 py-2"
            >
              Showcase
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeColorModeSwitch compact />
            <Link
              href="/login"
              className="theme-inline-secondary-button inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium"
            >
              <LogIn className="h-4 w-4" />
              <span className="ml-2">Sign in</span>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="gap-2">
                Enter dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
