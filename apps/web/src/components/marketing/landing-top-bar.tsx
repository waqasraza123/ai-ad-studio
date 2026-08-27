import Link from "next/link"
import { ArrowUpRight, Github } from "lucide-react"
import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { PublicSectionFrame } from "@/components/layout/page-frame"
import { ThemeColorModeSwitch } from "@/components/theme/theme-color-mode-switch"
import { getServerI18n } from "@/lib/i18n/server"
import { AI_AD_STUDIO_REPOSITORY_URL } from "./marketing-links"

export async function LandingTopBar() {
  const { t } = await getServerI18n()

  return (
    <header className="landing-top-bar-glow theme-top-bar sticky top-0 z-40 relative overflow-hidden border-b backdrop-blur-md">
      <div
        className="landing-top-bar-sheen pointer-events-none absolute inset-x-0 top-0 z-10"
        aria-hidden
      />
      <PublicSectionFrame className="relative z-[1] flex flex-col gap-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link
            href="/"
            className="group flex flex-col text-[var(--foreground)] transition hover:text-[rgb(var(--accent-rgb))]"
          >
            <span className="text-lg font-semibold tracking-[-0.03em]">
              {t("app.name")}
            </span>
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[var(--muted-foreground)] transition group-hover:text-[rgb(var(--accent-rgb))]">
              {t("marketing.brand.starterKit")}
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <a
              href="#foundation"
              className="theme-marketing-nav-link rounded-full px-3 py-2"
            >
              {t("header.marketing.foundation")}
            </a>
            <a
              href="#workflow"
              className="theme-marketing-nav-link rounded-full px-3 py-2"
            >
              {t("header.marketing.referenceApp")}
            </a>
            <a
              href="#samples"
              className="theme-marketing-nav-link rounded-full px-3 py-2"
            >
              {t("header.marketing.samples")}
            </a>
            <a
              href="#stack"
              className="theme-marketing-nav-link rounded-full px-3 py-2"
            >
              {t("header.marketing.stack")}
            </a>
            <a
              href="#faq"
              className="theme-marketing-nav-link rounded-full px-3 py-2"
            >
              {t("header.marketing.faq")}
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher compact />
            <ThemeColorModeSwitch compact />
            <Link
              href={AI_AD_STUDIO_REPOSITORY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-button-primary inline-flex h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium"
            >
              <Github className="h-4 w-4" />
              {t("marketing.actions.viewGithub")}
              <ArrowUpRight className="theme-directional-icon h-4 w-4" />
            </Link>
          </div>
        </div>
      </PublicSectionFrame>
    </header>
  )
}
