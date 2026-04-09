import { expect, type Page } from "@playwright/test"
import { resolveE2EBaseUrl } from "../setup/paths"

const localeCookieName = "ai_ad_studio_locale"

export async function expectEnglishDocument(page: Page) {
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr")
}

export async function expectArabicDocument(page: Page) {
  await expect(page.locator("html")).toHaveAttribute("lang", "ar")
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl")
}

export async function switchToArabic(page: Page) {
  await page.getByRole("button", { name: /Arabic|العربية/ }).click()
  await expectArabicDocument(page)
}

export async function switchToEnglish(page: Page) {
  await page.getByRole("button", { name: /English|الإنجليزية/ }).click()
  await expectEnglishDocument(page)
}

export async function setLocaleCookie(page: Page, locale: "en" | "ar") {
  await page.context().addCookies([
    {
      name: localeCookieName,
      path: "/",
      sameSite: "Lax",
      url: resolveE2EBaseUrl(),
      value: locale
    }
  ])
}
