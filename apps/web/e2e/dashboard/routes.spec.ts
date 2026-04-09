import { expect, test } from "@playwright/test"
import { readFixtureManifest } from "../helpers/manifest"
import {
  e2eDashboardStorageStatePath
} from "../setup/paths"
import { expectArabicDocument, setLocaleCookie } from "../helpers/locale"
import { gotoReady } from "../helpers/navigation"

let manifest: ReturnType<typeof readFixtureManifest>

test.use({
  storageState: e2eDashboardStorageStatePath
})

test.describe("authenticated dashboard routes", () => {
  test.beforeAll(() => {
    manifest = readFixtureManifest()
  })

  test("@smoke loads the dashboard shell and opens the lazy runtime modal", async ({
    page
  }) => {
    await gotoReady(page, "/dashboard")

    await expect(page.getByText(/Seeded Sparkling Water Launch/i).first()).toBeVisible()
    await expect(
      page.getByRole("button", { name: /API & GPU setup/i })
    ).toBeVisible()

    await page.getByRole("button", { name: /API & GPU setup/i }).click()
    await expect(
      page.getByRole("heading", { name: /Runtime setup/i })
    ).toBeVisible()
  })

  test("@smoke loads the project detail page without redirect loops", async ({
    page
  }) => {
    await gotoReady(page, `/dashboard/projects/${manifest.projectId}`)

    await expect(
      page.getByRole("heading", { name: /Seeded Sparkling Water Launch/i })
    ).toBeVisible()
    await expect(page.getByText(/Project detail/i)).toBeVisible()
  })

  test("@smoke loads analytics with the seeded usage ledger", async ({ page }) => {
    await gotoReady(page, "/dashboard/analytics")

    await expect(
      page.getByRole("heading", { name: /Provider usage and cost tracking/i })
    ).toBeVisible()
    await expect(page.getByTestId("usage-events-table")).toBeVisible()
    await expect(page.getByText(/openai/i)).toBeVisible()
    await expect(page.getByText(/runway/i)).toBeVisible()
  })

  test("@smoke loads exports and the seeded export detail page", async ({
    page
  }) => {
    await gotoReady(page, "/dashboard/exports")
    await expect(
      page.getByRole("heading", { name: /Multi-format export management/i })
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: /Latest 9:16/i })
    ).toBeVisible()

    await gotoReady(page, `/dashboard/exports/${manifest.exportId}`)
    await expect(page.getByText(/Selected concept/i)).toBeVisible()
    await expect(page.getByText(/Estimated cost/i)).toBeVisible()
  })

  test("@smoke loads settings, notifications, campaigns, showcase, and concepts", async ({
    page
  }) => {
    await gotoReady(page, "/dashboard/projects/new")
    await expect(page.getByText(/Create the first working project flow/i)).toBeVisible()

    await gotoReady(page, "/dashboard/settings")
    await expect(
      page.getByRole("heading", { name: /Billing, personal caps, and brand system/i })
    ).toBeVisible()

    await gotoReady(page, "/dashboard/notifications")
    await expect(
      page.getByRole("heading", { name: /Alerts for exports, failures, and queue health/i })
    ).toBeVisible()
    await expect(page.getByText(/Seeded export ready/i)).toBeVisible()

    await gotoReady(page, "/dashboard/campaigns")
    await expect(
      page.getByRole("heading", { name: /Winner-only share campaigns/i })
    ).toBeVisible()

    await gotoReady(page, "/dashboard/showcase")
    await expect(
      page.getByRole("heading", { name: /Public demo gallery manager/i })
    ).toBeVisible()

    await gotoReady(page, "/dashboard/concepts")
    await expect(page.getByText(/Seeded Sparkling Water Launch/i).first()).toBeVisible()
  })

  test("@smoke loads the delivery dashboard chunking controls", async ({ page }) => {
    await gotoReady(page, "/dashboard/delivery")

    await expect(page.getByTestId("delivery-workspace-list")).toBeVisible()
    await expect(page.getByText(/Showing 8 of 10 delivery workspaces./i)).toBeVisible()
    await expect(page.getByRole("link", { name: /Show 2 more/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /Show all/i })).toBeVisible()

    await page.getByRole("link", { name: /Show all/i }).click()
    await page.waitForURL(/workspace_limit=10/)
    await expect(page.getByText(/Showing 10 of 10 delivery workspaces./i)).toBeVisible()
    await expect(page.getByRole("link", { name: /Collapse list/i })).toBeVisible()
  })

  test("renders analytics in Arabic for the authenticated shell", async ({ page }) => {
    await setLocaleCookie(page, "ar")
    await gotoReady(page, "/dashboard/analytics")

    await expectArabicDocument(page)
    await expect(page.getByTestId("usage-events-table")).toBeVisible()
  })
})
