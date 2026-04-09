import { describe, expect, it } from "vitest"
import { getMessages } from "./catalog"
import { defaultLocale } from "./config"
import { ar } from "./messages/ar"
import { en } from "./messages/en"

describe("i18n catalogs", () => {
  it("keeps the Arabic catalog in parity with the English catalog", () => {
    expect(Object.keys(ar).sort()).toEqual(Object.keys(en).sort())
  })

  it("returns the correct messages for supported locales", () => {
    expect(getMessages("en")).toBe(en)
    expect(getMessages("ar")).toBe(ar)
    expect(getMessages(defaultLocale)).toBe(en)
  })
})
