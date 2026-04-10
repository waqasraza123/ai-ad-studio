"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n/provider"
import {
  dashboardNavigationSections,
  isDashboardNavigationItemActive
} from "./dashboard-navigation"

export function DashboardSidebarNav() {
  const pathname = usePathname()
  const { t } = useI18n()

  return (
    <nav className="mt-8 space-y-6">
      {dashboardNavigationSections.map((section) => (
        <div key={section.labelKey} className="space-y-2">
          <p className="px-4 text-[11px] uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
            {t(section.labelKey)}
          </p>

          <div className="flex flex-col gap-2">
            {section.items.map((item) => {
              const Icon = item.icon
              const active = isDashboardNavigationItemActive(pathname, item)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition",
                    active
                      ? "border-[rgb(var(--accent-rgb)_/_0.28)] bg-[rgb(var(--accent-rgb)_/_0.12)] text-[var(--foreground)] shadow-[0_18px_50px_rgb(var(--accent-rgb)_/_0.14)]"
                      : "border-transparent text-[var(--muted-foreground)] hover:border-[var(--border)] hover:bg-[var(--background-strong)] hover:text-[var(--foreground)]"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 transition",
                      active
                        ? "text-[rgb(var(--accent-rgb))]"
                        : "text-[var(--muted-foreground)] group-hover:text-[rgb(var(--accent-rgb))]"
                    )}
                  />
                  <span>{t(item.labelKey)}</span>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
