import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/config"

const createServerClient = vi.fn()
const hasSupabaseAuthConfiguration = vi.fn()

vi.mock("@supabase/ssr", () => ({
  createServerClient
}))

vi.mock("@/lib/env", () => ({
  hasSupabaseAuthConfiguration
}))

describe("updateSession", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it("seeds the locale cookie from the request headers when auth is disabled", async () => {
    hasSupabaseAuthConfiguration.mockReturnValue(false)
    const { updateSession } = await import("./middleware")
    const request = new NextRequest("https://example.com/login", {
      headers: {
        "accept-language": "ar-SA,ar;q=0.9,en;q=0.8"
      }
    })

    const response = await updateSession(request)

    expect(request.cookies.get(LOCALE_COOKIE_NAME)?.value).toBe("ar")
    expect(response.cookies.get(LOCALE_COOKIE_NAME)?.value).toBe("ar")
    expect(createServerClient).not.toHaveBeenCalled()
  })

  it("preserves a valid cookie locale and refreshes auth state when configured", async () => {
    hasSupabaseAuthConfiguration.mockReturnValue(true)
    const getUser = vi.fn().mockResolvedValue({ data: { user: null } })
    createServerClient.mockReturnValue({
      auth: {
        getUser
      }
    })

    const { updateSession } = await import("./middleware")
    const request = new NextRequest("https://example.com/dashboard", {
      headers: {
        cookie: `${LOCALE_COOKIE_NAME}=en`,
        "accept-language": "ar-SA,ar;q=0.9"
      }
    })

    const response = await updateSession(request)

    expect(createServerClient).toHaveBeenCalledOnce()
    expect(getUser).toHaveBeenCalledOnce()
    expect(response.cookies.get(LOCALE_COOKIE_NAME)?.value).toBe("en")
  })
})
