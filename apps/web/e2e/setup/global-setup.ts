import { chromium, type FullConfig } from "@playwright/test"
import { seedE2EFixtures } from "./seed-fixtures"
import {
  e2eDashboardStorageStatePath,
  resolveE2EBaseUrl
} from "./paths"

export default async function globalSetup(_config: FullConfig) {
  const { environment } = await seedE2EFixtures()
  const browser = await chromium.launch()
  const page = await browser.newPage({
    baseURL: resolveE2EBaseUrl()
  })

  await page.goto("/login")
  await page.locator('input[name="email"]').first().fill(environment.E2E_OWNER_EMAIL)
  await page.locator('input[name="password"]').first().fill(environment.E2E_OWNER_PASSWORD)
  await page.getByRole("button", { name: /sign in|تسجيل الدخول/i }).first().click()
  await page.waitForURL("**/dashboard")
  await page.context().storageState({
    path: e2eDashboardStorageStatePath
  })
  await browser.close()
}
