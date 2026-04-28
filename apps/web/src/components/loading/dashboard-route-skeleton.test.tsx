import { screen } from "@testing-library/react"
import { createElement } from "react"
import { describe, expect, it } from "vitest"
import { DashboardRouteSkeleton } from "@/components/loading/dashboard-route-skeleton"
import { renderWithAppProviders } from "@/test/render"

describe("DashboardRouteSkeleton", () => {
  it("uses the shared i18n loading label by default", () => {
    renderWithAppProviders(createElement(DashboardRouteSkeleton), {
      locale: "ar"
    })

    expect(
      screen.getByRole("status", { name: "جارٍ تحميل مساحة العمل" })
    ).toBeInTheDocument()
  })
})
