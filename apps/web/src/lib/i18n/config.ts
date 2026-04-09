export const LOCALE_COOKIE_NAME = "ai_ad_studio_locale"

export const supportedLocales = ["en", "ar"] as const

export type AppLocale = (typeof supportedLocales)[number]
export type AppDirection = "ltr" | "rtl"

export const defaultLocale: AppLocale = "en"

const rtlLocales = new Set<AppLocale>(["ar"])

export function isSupportedLocale(value: string | null | undefined): value is AppLocale {
  return supportedLocales.includes(value as AppLocale)
}

export function getLocaleDirection(locale: AppLocale): AppDirection {
  return rtlLocales.has(locale) ? "rtl" : "ltr"
}

