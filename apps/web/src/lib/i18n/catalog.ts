import { defaultLocale, type AppLocale } from "./config"
import { ar } from "./messages/ar"
import { en, type AppMessageCatalog } from "./messages/en"

const catalogs: Record<AppLocale, AppMessageCatalog> = {
  ar,
  en
}

export function getMessages(locale: AppLocale) {
  return catalogs[locale] ?? catalogs[defaultLocale]
}

