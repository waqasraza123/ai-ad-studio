import type { AppLocale } from "./config"
import type { AppMessageKey } from "./messages/en"

export type MessagePluralEntry = {
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string
}

export type MessageCatalog = Record<string, string | MessagePluralEntry>

export type TranslationValues = Record<
  string,
  string | number | null | undefined
> & {
  count?: number
}

function isPluralEntry(
  value: string | MessagePluralEntry
): value is MessagePluralEntry {
  return typeof value !== "string"
}

function interpolate(template: string, values?: TranslationValues) {
  if (!values) {
    return template
  }

  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const value = values[key]
    return value === null || value === undefined ? "" : String(value)
  })
}

function pickPluralTemplate(
  locale: AppLocale,
  entry: MessagePluralEntry,
  count: number
) {
  const pluralRules = new Intl.PluralRules(locale)
  const category = pluralRules.select(count)

  return entry[category] ?? entry.other
}

export function createTranslator<
  TCatalog extends Record<string, string | MessagePluralEntry>
>(locale: AppLocale, messages: TCatalog) {
  function t(key: keyof TCatalog & string, values?: TranslationValues) {
    const entry = messages[key]

    if (!entry) {
      return key
    }

    let template: string

    if (isPluralEntry(entry)) {
      template = pickPluralTemplate(locale, entry, values?.count ?? 0)
    } else {
      template = entry
    }

    return interpolate(template, values)
  }

  function formatDateTime(
    value: Date | number | string,
    options?: Intl.DateTimeFormatOptions
  ) {
    return new Intl.DateTimeFormat(locale, options).format(new Date(value))
  }

  function formatDate(
    value: Date | number | string,
    options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
  ) {
    return formatDateTime(value, options)
  }

  function formatNumber(
    value: number,
    options?: Intl.NumberFormatOptions
  ) {
    return new Intl.NumberFormat(locale, options).format(value)
  }

  function formatCurrency(
    value: number,
    currency = "USD",
    options?: Intl.NumberFormatOptions
  ) {
    return formatNumber(value, {
      currency,
      style: "currency",
      ...options
    })
  }

  return {
    formatCurrency,
    formatDate,
    formatDateTime,
    formatNumber,
    locale,
    t
  }
}

export type Translator = ReturnType<typeof createTranslator<Record<AppMessageKey, string | MessagePluralEntry>>>
