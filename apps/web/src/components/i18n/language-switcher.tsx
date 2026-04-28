"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useFormStatus } from "react-dom"
import { changeLocaleAction } from "@/app/actions"
import { LoadingInline } from "@/components/loading/loading-inline"
import { LoadingOverlay } from "@/components/loading/loading-overlay"
import { supportedLocales } from "@/lib/i18n/config"
import { useI18n } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"

type LanguageSwitcherProps = {
  compact?: boolean
}

type LocaleSubmitButtonProps = {
  compact: boolean
  isActive: boolean
  label: string
  pendingLabel: string
}

function LocaleSubmitButton({
  compact,
  isActive,
  label,
  pendingLabel
}: LocaleSubmitButtonProps) {
  const { pending } = useFormStatus()
  const isDisabled = isActive || pending

  return (
    <>
      <button
        type="submit"
        aria-busy={pending}
        aria-disabled={isDisabled}
        aria-pressed={isActive}
        disabled={isDisabled}
        className={cn(
          "theme-focus-ring inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-medium transition",
          compact ? "min-h-8" : "min-h-9",
          isActive
            ? "bg-[var(--foreground)] text-[var(--background)]"
            : "text-[var(--soft-foreground)] hover:bg-[var(--background-strong)] hover:text-[var(--foreground)]",
          pending && "gap-2"
        )}
      >
        {pending ? (
          <LoadingInline label={pendingLabel} />
        ) : (
          label
        )}
      </button>
      {pending ? <LoadingOverlay label={pendingLabel} /> : null}
    </>
  )
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
            <LocaleSubmitButton
              compact={compact}
              isActive={isActive}
              label={
                item === "ar"
                  ? t("common.language.arabic")
                  : t("common.language.english")
              }
              pendingLabel={t("common.loading.switchingLanguage")}
            />
          </form>
        )
      })}
    </div>
  )
}
