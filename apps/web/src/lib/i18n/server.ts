import { cookies, headers } from "next/headers"
import { getMessages } from "./catalog"
import { getLocaleDirection, LOCALE_COOKIE_NAME, type AppLocale } from "./config"
import { resolveRequestLocale } from "./resolve-locale"
import { createTranslator } from "./translator"

export async function getRequestLocale(): Promise<AppLocale> {
  const cookieStore = await cookies()
  const headerStore = await headers()

  return resolveRequestLocale({
    acceptLanguage: headerStore.get("accept-language"),
    cookieLocale: cookieStore.get(LOCALE_COOKIE_NAME)?.value ?? null
  })
}

export async function getServerI18n() {
  const locale = await getRequestLocale()
  const messages = getMessages(locale)

  return {
    direction: getLocaleDirection(locale),
    messages,
    ...createTranslator(locale, messages)
  }
}
