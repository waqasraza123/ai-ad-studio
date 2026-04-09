import { describe, expect, it } from "vitest"
import {
  defaultLocale,
  getLocaleDirection,
  isSupportedLocale,
  LOCALE_COOKIE_NAME,
  supportedLocales
} from "./config"

describe("i18n config", () => {
  it("exposes the supported locales and default locale", () => {
    expect(LOCALE_COOKIE_NAME).toBe("ai_ad_studio_locale")
    expect(supportedLocales).toEqual(["en", "ar"])
    expect(defaultLocale).toBe("en")
  })

  it("recognizes supported locales only", () => {
    expect(isSupportedLocale("en")).toBe(true)
    expect(isSupportedLocale("ar")).toBe(true)
    expect(isSupportedLocale("fr")).toBe(false)
    expect(isSupportedLocale("")).toBe(false)
    expect(isSupportedLocale(null)).toBe(false)
    expect(isSupportedLocale(undefined)).toBe(false)
  })

  it("maps locale direction correctly", () => {
    expect(getLocaleDirection("en")).toBe("ltr")
    expect(getLocaleDirection("ar")).toBe("rtl")
  })
})
