"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { changeLocaleAction } from "@/app/actions"
import { supportedLocales } from "@/lib/i18n/config"
import { useI18n } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"

type LanguageSwitcherProps = {
  compact?: boolean
}

export function LanguageSwitcher({
  compact = false
}: LanguageSwitcherProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { locale, t } = useI18n()
  const query = searchParams.toString()
  const returnTo = query ? `${pathname}?${query}` : pathname

  return (
    <div
      className={cn(
        "theme-language-switcher inline-flex items-center gap-1 rounded-full border p-1",
        compact ? "h-10" : "h-11"
      )}
      aria-label={t("common.language.switcherLabel")}
      role="group"
    >
      {supportedLocales.map((item) => {
        const isActive = item === locale

        return (
          <form action={changeLocaleAction} key={item}>
            <input name="locale" type="hidden" value={item} />
            <input name="returnTo" type="hidden" value={returnTo} />
            <button
              type="submit"
              aria-pressed={isActive}
              className={cn(
                "theme-focus-ring inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--soft-foreground)] hover:bg-[var(--background-strong)] hover:text-[var(--foreground)]"
              )}
            >
              {item === "ar"
                ? t("common.language.arabic")
                : t("common.language.english")}
            </button>
          </form>
        )
      })}
    </div>
  )
}

