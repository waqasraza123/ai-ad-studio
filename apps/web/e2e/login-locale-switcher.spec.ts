import { expect, test } from "@playwright/test"

test.describe("login locale switching", () => {
  test("@smoke detects Arabic on a first visit and switches document direction", async ({
    browser
  }) => {
    const context = await browser.newContext({
      locale: "ar-SA"
    })
    const page = await context.newPage()

    await page.goto("/login")

    await expect(page.locator("html")).toHaveAttribute("lang", "ar")
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl")
    await expect(page.getByRole("group", { name: "تغيير اللغة" })).toBeVisible()

    await context.close()
  })

  test("@smoke persists a manual language switch on the login page", async ({
    page,
    context
  }) => {
    await page.goto("/login")

    await expect(page.locator("html")).toHaveAttribute("lang", "en")
    await page.getByRole("button", { name: /Arabic|العربية/ }).click()
    await page.waitForURL(/\/login/)

    await expect(page.locator("html")).toHaveAttribute("lang", "ar")
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl")

    await page.reload()

    await expect(page.locator("html")).toHaveAttribute("lang", "ar")
    expect(
      (await context.cookies()).find((cookie) => cookie.name === "ai_ad_studio_locale")
        ?.value
    ).toBe("ar")
  })
})
