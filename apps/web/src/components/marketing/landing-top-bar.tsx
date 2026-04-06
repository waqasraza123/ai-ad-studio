import Link from "next/link"
import { LogIn } from "lucide-react"
import { Button } from "@/components/primitives/button"
import { RuntimeSetupLauncher } from "@/components/runtime/runtime-setup-launcher"
import { ThemeColorModeSwitch } from "@/components/theme/theme-color-mode-switch"

const ADMIN_DEMO_EMAIL = "admin@gmail.com"

const adminLoginHref = `/login?email=${encodeURIComponent(ADMIN_DEMO_EMAIL)}`

export function LandingTopBar() {
  const demoSubtext = process.env.NEXT_PUBLIC_HOME_DEMO_SIGNIN_SUBTEXT?.trim()

  return (
    <header className="landing-top-bar-glow theme-top-bar relative overflow-hidden border-b backdrop-blur-md">
      <div
        className="landing-top-bar-sheen pointer-events-none absolute inset-x-0 top-0 z-10"
        aria-hidden
      />
      <div className="relative z-[1] mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-[var(--foreground)] transition hover:text-[rgb(var(--accent-rgb))]"
          >
            AI Ad Studio
          </Link>
          <div className="min-w-0 border-l-0 border-[var(--border)] sm:border-l sm:pl-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              Administrator sign-in
            </p>
            <p className="mt-0.5 truncate font-mono text-sm text-[var(--soft-foreground)]">
              {ADMIN_DEMO_EMAIL}
            </p>
            {demoSubtext ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{demoSubtext}</p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeColorModeSwitch compact />
          <RuntimeSetupLauncher context="homepage" triggerLabel="Runtime setup" />
          <Link href={adminLoginHref}>
            <Button size="sm" className="gap-2">
              <LogIn className="h-4 w-4" />
              Sign in as admin
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
