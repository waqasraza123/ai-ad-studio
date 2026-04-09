import { describe, expect, it } from "vitest"
import { resolveRequestLocale } from "./resolve-locale"

describe("resolveRequestLocale", () => {
  it("prefers a valid cookie locale over request headers", () => {
    expect(
      resolveRequestLocale({
        acceptLanguage: "ar-SA,ar;q=0.9,en;q=0.8",
        cookieLocale: "en"
      })
    ).toBe("en")
  })

  it("falls back to the first supported accept-language token", () => {
    expect(
      resolveRequestLocale({
        acceptLanguage: "fr-FR, ar-SA;q=0.9, en-US;q=0.8",
        cookieLocale: null
      })
    ).toBe("ar")
  })

  it("falls back to english when cookie and header are unsupported", () => {
    expect(
      resolveRequestLocale({
        acceptLanguage: "fr-FR, de-DE;q=0.9",
        cookieLocale: "fa"
      })
    ).toBe("en")
  })
})
