"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useI18n } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"
import {
  isSettingsNavigationItemActive,
  settingsNavigationItems
} from "@/features/settings/lib/settings-navigation"

export function SettingsSubnav() {
  const pathname = usePathname()
  const { t } = useI18n()

  return (
    <nav
      aria-label={t("settings.nav.label")}
      className="flex flex-wrap gap-3"
    >
      {settingsNavigationItems.map((item) => {
        const active = isSettingsNavigationItemActive(pathname, item)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition",
              active
                ? "border-[rgb(var(--accent-rgb)_/_0.28)] bg-[rgb(var(--accent-rgb)_/_0.12)] text-[var(--foreground)]"
                : "border-white/10 bg-white/[0.03] text-[var(--muted-foreground)] hover:border-white/20 hover:bg-white/[0.06] hover:text-[var(--foreground)]"
            )}
          >
            {t(item.labelKey)}
          </Link>
        )
      })}
    </nav>
  )
}
