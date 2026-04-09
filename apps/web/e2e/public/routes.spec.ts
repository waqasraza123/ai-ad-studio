import { expect, test } from "@playwright/test"
import { readFixtureManifest } from "../helpers/manifest"
import { expectArabicDocument, setLocaleCookie } from "../helpers/locale"
import { gotoReady } from "../helpers/navigation"

let manifest: ReturnType<typeof readFixtureManifest>

test.describe("public token routes", () => {
  test.beforeAll(() => {
    manifest = readFixtureManifest()
  })

  test("@smoke keeps the login invalid-auth flow stable", async ({ page }) => {
    await gotoReady(page, "/login")

    await page.locator('input[name="email"]').first().fill("nobody@example.com")
    await page.locator('input[name="password"]').first().fill("bad-password")
    await page.getByRole("button", { name: /sign in|تسجيل الدخول/i }).first().click()

    await page.waitForURL(/\/login\?/)
    await expect(page).toHaveURL(/error=auth_sign_in_failed/)
  })

  test("@smoke renders the public showcase in Arabic", async ({ page }) => {
    await setLocaleCookie(page, "ar")
    await gotoReady(page, "/showcase")

    await expectArabicDocument(page)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(
      page.getByRole("img", { name: /Seeded Sparkling Water Launch/i })
    ).toBeVisible()
    await page.getByRole("link", { name: "9:16" }).click()
    await page.waitForURL(/aspectRatio=9:16/)
  })

  test("@smoke renders the shared export page from the seeded token", async ({
    page
  }) => {
    await gotoReady(page, `/share/${manifest.shareToken}`)

    await expect(
      page.getByRole("heading", { name: /Seeded Sparkling Water Launch/i })
    ).toBeVisible()
    await expect(page.getByRole("img")).toBeVisible()
  })

  test("@smoke renders the campaign page from the seeded token", async ({
    page
  }) => {
    await gotoReady(page, `/campaign/${manifest.campaignToken}`)

    await expect(
      page.getByRole("heading", { name: /Seeded campaign launch page/i })
    ).toBeVisible()
    await expect(page.getByRole("img")).toBeVisible()
  })

  test("@smoke renders the public review page from the seeded token", async ({
    page
  }) => {
    await gotoReady(page, `/review/${manifest.reviewToken}`)

    await expect(
      page.getByRole("heading", { name: /Seeded Sparkling Water Launch/i })
    ).toBeVisible()
    await expect(page.getByTestId("public-batch-review-grid")).toBeVisible()
    await expect(
      page.getByRole("button", { name: /Comment on this output/i }).first()
    ).toBeVisible()
  })

  test("@smoke renders the delivery page from the seeded token", async ({
    page
  }) => {
    await gotoReady(page, `/delivery/${manifest.deliveryToken}`)

    await expect(
      page.getByRole("heading", { name: /Seeded delivery handoff/i })
    ).toBeVisible()
    await expect(page.getByRole("link", { name: /Download asset/i }).first()).toBeVisible()
  })

  test("submits the delivery acknowledgement flow on the dedicated seeded workspace", async ({
    page,
    browserName
  }) => {
    test.skip(browserName !== "chromium", "One mutation pass is enough for the shared seeded dataset.")

    await gotoReady(page, `/delivery/${manifest.deliveryAcknowledgementToken}`)

    await page.getByLabel(/Recipient label|المستلم/i).fill("Playwright Reviewer")
    await page.getByLabel(/Acknowledgement note|ملاحظة الاستلام/i).fill(
      "Acknowledged by Playwright."
    )
    await page.getByRole("button", { name: /submit|إرسال/i }).click()

    await page.waitForURL(/\/delivery\//)
    await expect(page.getByText(/Receipt acknowledged/i)).toBeVisible()
  })

  test("rejects an invalid shared token with the localized not-found surface", async ({
    page
  }) => {
    await gotoReady(page, "/share/not-a-valid-seeded-token")
    await expect(page.getByRole("heading", { name: /Page not found/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /Dashboard|لوحة/i })).toBeVisible()
  })

  test("@smoke redirects unauthenticated dashboard visits to login", async ({
    page
  }) => {
    await page.goto("/dashboard")
    await page.waitForURL(/\/login/)
    await expect(
      page.getByRole("button", { name: /sign in|تسجيل الدخول/i }).first()
    ).toBeVisible()
  })
})
