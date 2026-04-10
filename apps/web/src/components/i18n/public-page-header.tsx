import Link from "next/link"
import { ThemeColorModeSwitch } from "@/components/theme/theme-color-mode-switch"
import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { PublicSectionFrame } from "@/components/layout/page-frame"
import { getServerI18n } from "@/lib/i18n/server"

export async function PublicPageHeader() {
  const { t } = await getServerI18n()

  return (
    <header className="theme-top-bar sticky top-0 z-30 border-b backdrop-blur-md">
      <PublicSectionFrame className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-lg font-semibold tracking-[-0.03em] text-[var(--foreground)] transition hover:text-[rgb(var(--accent-rgb))]"
          >
            {t("app.name")}
          </Link>
          <Link
            href="/dashboard"
            className="theme-marketing-nav-link rounded-full px-3 py-2 text-sm"
          >
            {t("public.header.dashboard")}
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <LanguageSwitcher compact />
          <ThemeColorModeSwitch compact />
        </div>
      </PublicSectionFrame>
    </header>
  )
}
