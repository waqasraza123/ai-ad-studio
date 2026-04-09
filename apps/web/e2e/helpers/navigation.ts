import { expect, type Page } from "@playwright/test"

export async function gotoReady(page: Page, pathname: string) {
  await page.goto(pathname)
  await expect(page.locator("html")).toBeVisible()
}
