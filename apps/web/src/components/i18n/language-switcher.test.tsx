import { screen, within } from "@testing-library/react"
import { createElement } from "react"
import { describe, expect, it, vi } from "vitest"
import { renderWithAppProviders } from "@/test/render"

vi.mock("@/app/actions", () => ({
  changeLocaleAction: vi.fn()
}))

describe("LanguageSwitcher", () => {
  it("renders both locales and marks the active locale", async () => {
    const { LanguageSwitcher } = await import("./language-switcher")
    const { container } = renderWithAppProviders(createElement(LanguageSwitcher, {
      compact: true
    }), {
      locale: "ar",
      pathname: "/login"
    })

    const switcher = screen.getByRole("group", { name: "تغيير اللغة" })
    expect(within(switcher).getByRole("button", { name: "العربية" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    expect(within(switcher).getByRole("button", { name: "English" })).toHaveAttribute(
      "aria-pressed",
      "false"
    )

    const returnToInputs = container.querySelectorAll('input[name="returnTo"]')
    expect(returnToInputs).toHaveLength(2)
    expect([...returnToInputs].every((input) => input.getAttribute("value") === "/login")).toBe(
      true
    )
  })

  it("preserves the current path and query string in form submissions", async () => {
    const { LanguageSwitcher } = await import("./language-switcher")
    const { container } = renderWithAppProviders(createElement(LanguageSwitcher), {
      locale: "en",
      pathname: "/showcase",
      searchParams: {
        aspectRatio: "9:16",
        platformPreset: "instagram_reels"
      }
    })

    const switcher = screen.getByRole("group", { name: "Switch language" })
    expect(within(switcher).getByRole("button", { name: "English" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )

    const returnToInputs = [...container.querySelectorAll('input[name="returnTo"]')]
    expect(returnToInputs).toHaveLength(2)
    expect(returnToInputs[0]).toHaveValue(
      "/showcase?aspectRatio=9%3A16&platformPreset=instagram_reels"
    )
    expect(returnToInputs[1]).toHaveValue(
      "/showcase?aspectRatio=9%3A16&platformPreset=instagram_reels"
    )
  })
})
