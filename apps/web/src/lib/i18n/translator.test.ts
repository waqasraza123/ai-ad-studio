import { describe, expect, it } from "vitest"
import { createTranslator } from "./translator"

describe("createTranslator", () => {
  it("returns translated strings with interpolation", () => {
    const translator = createTranslator("en", {
      greeting: "Hello {{name}}"
    })

    expect(translator.t("greeting", { name: "Waqas" })).toBe("Hello Waqas")
  })

  it("returns the key when a translation is missing", () => {
    const translator = createTranslator("en", {
      greeting: "Hello"
    })

    expect(translator.t("missing" as never)).toBe("missing")
  })

  it("supports locale-aware plural categories for Arabic", () => {
    const translator = createTranslator("ar", {
      items: {
        zero: "لا عناصر",
        one: "عنصر واحد",
        two: "عنصران",
        few: "{{count}} عناصر",
        many: "{{count}} عنصرًا",
        other: "{{count}} عنصر"
      }
    })

    expect(translator.t("items", { count: 0 })).toBe("لا عناصر")
    expect(translator.t("items", { count: 1 })).toBe("عنصر واحد")
    expect(translator.t("items", { count: 2 })).toBe("عنصران")
    expect(translator.t("items", { count: 3 })).toBe("3 عناصر")
    expect(translator.t("items", { count: 11 })).toBe("11 عنصرًا")
    expect(translator.t("items", { count: 100 })).toBe("100 عنصر")
  })

  it("formats numbers, dates, and currency using the active locale", () => {
    const english = createTranslator("en", {
      label: "Label"
    })
    const arabic = createTranslator("ar", {
      label: "تصنيف"
    })

    expect(english.formatCurrency(42)).toContain("$42.00")
    expect(arabic.formatNumber(2026)).toBe(new Intl.NumberFormat("ar").format(2026))
    expect(english.formatDate("2026-04-09T00:00:00.000Z")).toBeTruthy()
    expect(arabic.formatDateTime("2026-04-09T00:00:00.000Z")).toBeTruthy()
  })
})
