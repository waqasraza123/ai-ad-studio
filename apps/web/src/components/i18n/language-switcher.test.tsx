import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createElement } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { changeLocaleAction } from "@/app/actions"
import { renderWithAppProviders } from "@/test/render"

vi.mock("@/app/actions", () => ({
  changeLocaleAction: vi.fn()
}))

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    vi.mocked(changeLocaleAction).mockReset()
  })

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

  it("shows a blocking transition state while a locale change is pending", async () => {
    vi.mocked(changeLocaleAction).mockImplementation(
      () => new Promise<never>(() => {})
    )

    const user = userEvent.setup()
    const { LanguageSwitcher } = await import("./language-switcher")

    renderWithAppProviders(createElement(LanguageSwitcher), {
      locale: "en",
      pathname: "/dashboard"
    })

    const switcher = screen.getByRole("group", { name: "Switch language" })
    expect(within(switcher).getByRole("button", { name: "English" })).toBeDisabled()

    await user.click(within(switcher).getByRole("button", { name: "Arabic" }))

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Switching language..."
    )
    expect(
      within(switcher).getByRole("button", { name: /Switching language/i })
    ).toHaveAttribute("aria-busy", "true")
    expect(changeLocaleAction).toHaveBeenCalledTimes(1)
  })
})
