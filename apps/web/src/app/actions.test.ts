import { beforeEach, describe, expect, it, vi } from "vitest"
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/config"

const cookies = vi.fn()
const redirect = vi.fn()

vi.mock("next/headers", () => ({
  cookies
}))

vi.mock("next/navigation", () => ({
  redirect
}))

describe("changeLocaleAction", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it("writes a validated locale cookie and redirects back to the current path", async () => {
    const set = vi.fn()
    cookies.mockResolvedValue({ set })
    const { changeLocaleAction } = await import("./actions")
    const formData = new FormData()
    formData.set("locale", "ar")
    formData.set("returnTo", "/login?next=%2Fdashboard")

    await changeLocaleAction(formData)

    expect(set).toHaveBeenCalledWith(
      LOCALE_COOKIE_NAME,
      "ar",
      expect.objectContaining({
        httpOnly: false,
        path: "/",
        sameSite: "lax"
      })
    )
    expect(redirect).toHaveBeenCalledWith("/login?next=%2Fdashboard")
  })

  it("falls back to the default locale and root path for invalid input", async () => {
    const set = vi.fn()
    cookies.mockResolvedValue({ set })
    const { changeLocaleAction } = await import("./actions")
    const formData = new FormData()
    formData.set("locale", "fr")
    formData.set("returnTo", "https://evil.example.com")

    await changeLocaleAction(formData)

    expect(set).toHaveBeenCalledWith(
      LOCALE_COOKIE_NAME,
      "en",
      expect.any(Object)
    )
    expect(redirect).toHaveBeenCalledWith("/")
  })
})
