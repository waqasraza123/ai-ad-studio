import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { getMessages } from "@/lib/i18n/catalog"
import { createTranslator } from "@/lib/i18n/translator"
import { ProjectWorkspaceMap } from "./project-workspace-map"

vi.mock("@/lib/i18n/server", () => ({
  getServerI18n: async () => {
    const locale = "en" as const
    const messages = getMessages(locale)
    return createTranslator(locale, messages)
  }
}))

describe("ProjectWorkspaceMap", () => {
  it("renders cross-studio navigation links and the settings callout", async () => {
    const ui = await ProjectWorkspaceMap({
      projectName: "HydraGlow Launch"
    })

    render(ui)

    expect(
      screen.getByText("Stay oriented while this project is in motion")
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard"
    )
    expect(screen.getByRole("link", { name: "Analytics" })).toHaveAttribute(
      "href",
      "/dashboard/analytics"
    )
    expect(screen.getByRole("link", { name: "Exports" })).toHaveAttribute(
      "href",
      "/dashboard/exports"
    )
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/dashboard/settings"
    )
    expect(
      screen.getByRole("link", { name: "Open workspace administration" })
    ).toHaveAttribute("href", "/dashboard/settings")
  })
})
