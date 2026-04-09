"use client"

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode
} from "react"
import type { AppDirection, AppLocale } from "./config"
import { createTranslator, type MessageCatalog } from "./translator"

type I18nContextValue = ReturnType<typeof createTranslator> & {
  direction: AppDirection
  messages: MessageCatalog
}

const I18nContext = createContext<I18nContextValue | null>(null)

type I18nProviderProps = {
  children: ReactNode
  direction: AppDirection
  locale: AppLocale
  messages: MessageCatalog
}

export function I18nProvider({
  children,
  direction,
  locale,
  messages
}: I18nProviderProps) {
  const value = useMemo(
    () => ({
      direction,
      messages,
      ...createTranslator(locale, messages)
    }),
    [direction, locale, messages]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const value = useContext(I18nContext)

  if (!value) {
    throw new Error("useI18n must be used within I18nProvider.")
  }

  return value
}
