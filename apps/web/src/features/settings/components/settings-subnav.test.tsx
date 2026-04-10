import { screen } from "@testing-library/react"
import { createElement } from "react"
import { describe, expect, it } from "vitest"
import { renderWithAppProviders } from "@/test/render"
import { SettingsSubnav } from "./settings-subnav"

describe("SettingsSubnav", () => {
  it("marks the matching settings section as active", () => {
    renderWithAppProviders(createElement(SettingsSubnav), {
      locale: "en",
      pathname: "/dashboard/settings/billing"
    })

    expect(
      screen.getByRole("navigation", { name: "Settings sections" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Billing" })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute(
      "aria-current"
    )
  })

  it("supports localized labels and nested brand routes", () => {
    renderWithAppProviders(createElement(SettingsSubnav), {
      locale: "ar",
      pathname: "/dashboard/settings/brand"
    })

    expect(
      screen.getByRole("navigation", { name: "أقسام الإعدادات" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "مجموعة العلامة" })).toHaveAttribute(
      "aria-current",
      "page"
    )
  })
})
