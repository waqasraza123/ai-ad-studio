import { expect, test } from "@playwright/test"
import {
  expectArabicDocument,
  expectEnglishDocument,
  switchToArabic
} from "../helpers/locale"
import { gotoReady } from "../helpers/navigation"

test.describe("homepage public chrome", () => {
  test("@smoke renders the homepage in English and opens the runtime setup modal", async ({
    page
  }) => {
    await gotoReady(page, "/")

    await expectEnglishDocument(page)
    await expect(
      page.getByRole("heading", {
        name: /Start with a complete AI SaaS\. Make the workflow yours\./i
      })
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: /View on GitHub/i }).first()
    ).toHaveAttribute("href", "https://github.com/waqasraza123/ai-ad-studio")
    await expect(
      page.getByRole("link", { name: /Open reference app/i }).first()
    ).toHaveAttribute("href", "/dashboard")
    await expect(page.getByRole("link", { name: "Plans" })).toHaveCount(0)
    await expect(page.locator("#plans")).toHaveCount(0)
    await expect(
      page.getByRole("button", { name: /Runtime setup/i })
    ).toBeVisible()

    await page.getByRole("button", { name: /Runtime setup/i }).click()
    await expect(
      page.getByRole("heading", { name: /Runtime setup/i })
    ).toBeVisible()
    await expect(page.getByText(/API, GPU, and env guidance/i)).toBeVisible()
  })

  test("@smoke switches the homepage to Arabic and preserves document direction", async ({
    page,
    browser
  }) => {
    const context = await browser.newContext({
      locale: "ar-SA"
    })
    const localizedPage = await context.newPage()

    await gotoReady(localizedPage, "/")
    await expectArabicDocument(localizedPage)
    await expect(
      localizedPage.getByRole("heading", {
        name: /ابدأ بمنصة SaaS للذكاء الاصطناعي مكتملة/
      })
    ).toBeVisible()
    await expect(
      localizedPage.getByRole("link", { name: /عرض على GitHub/ }).first()
    ).toBeVisible()
    await expect(
      localizedPage.getByRole("group", { name: "تغيير اللغة" })
    ).toBeVisible()

    await context.close()

    await gotoReady(page, "/")
    await switchToArabic(page)
    await page.reload()
    await expectArabicDocument(page)
  })
})
