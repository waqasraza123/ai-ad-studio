import { getMessages } from "@/lib/i18n/catalog"
import {
  getLocaleDirection,
  type AppDirection,
  type AppLocale
} from "@/lib/i18n/config"

export function getI18nFixture(locale: AppLocale): {
  direction: AppDirection
  locale: AppLocale
  messages: ReturnType<typeof getMessages>
} {
  return {
    direction: getLocaleDirection(locale),
    locale,
    messages: getMessages(locale)
  }
}
