import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createElement } from "react"
import { describe, expect, it } from "vitest"
import { renderWithAppProviders } from "@/test/render"
import { ThemeColorModeSwitch } from "./theme-color-mode-switch"

describe("ThemeColorModeSwitch", () => {
  it("toggles color mode and updates localized labels", async () => {
    const user = userEvent.setup()

    renderWithAppProviders(createElement(ThemeColorModeSwitch, {
      compact: true
    }), {
      locale: "ar"
    })

    const button = screen.getByRole("button", {
      name: "التبديل إلى الوضع الداكن"
    })

    expect(button).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("الوضع الفاتح")).toBeInTheDocument()

    await user.click(button)

    expect(
      screen.getByRole("button", { name: "التبديل إلى الوضع الفاتح" })
    ).toHaveAttribute("aria-pressed", "false")
    expect(screen.getByText("الوضع الداكن")).toBeInTheDocument()
  })
})
