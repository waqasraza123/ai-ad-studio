import { screen, within } from "@testing-library/react"
import { createElement } from "react"
import { describe, expect, it } from "vitest"
import { renderWithAppProviders } from "@/test/render"
import { DashboardSidebarNav } from "./dashboard-sidebar-nav"

describe("DashboardSidebarNav", () => {
  it("renders grouped navigation and highlights settings routes", () => {
    renderWithAppProviders(createElement(DashboardSidebarNav), {
      locale: "en",
      pathname: "/dashboard/settings/brand"
    })

    expect(screen.getByText("Administration")).toBeInTheDocument()
    expect(screen.getByText("Operations")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute(
      "aria-current"
    )
  })

  it("localizes section and item labels", () => {
    renderWithAppProviders(createElement(DashboardSidebarNav), {
      locale: "ar",
      pathname: "/dashboard/notifications"
    })

    expect(screen.getByText("الإدارة")).toBeInTheDocument()
    expect(screen.getByText("العمليات")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "الإشعارات" })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(
      within(screen.getByRole("navigation")).getByRole("link", {
        name: "الإعدادات"
      })
    ).toBeInTheDocument()
  })
})
