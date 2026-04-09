import { defaultLocale, type AppLocale, isSupportedLocale } from "./config"

type ResolveLocaleInput = {
  acceptLanguage?: string | null
  cookieLocale?: string | null
}

function normalizeLocaleToken(value: string) {
  return value.trim().toLowerCase().split(";")[0]?.split("-")[0] ?? ""
}

export function resolveRequestLocale(input: ResolveLocaleInput): AppLocale {
  if (isSupportedLocale(input.cookieLocale)) {
    return input.cookieLocale
  }

  const accepted = input.acceptLanguage
    ?.split(",")
    .map(normalizeLocaleToken)
    .find(isSupportedLocale)

  return accepted ?? defaultLocale
}

