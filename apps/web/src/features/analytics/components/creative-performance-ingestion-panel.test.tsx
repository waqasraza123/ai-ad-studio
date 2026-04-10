import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { getMessages } from "@/lib/i18n/catalog"
import { createTranslator } from "@/lib/i18n/translator"
import { CreativePerformanceIngestionPanel } from "./creative-performance-ingestion-panel"

vi.mock("@/features/analytics/actions/submit-creative-performance", () => ({
  submitCreativePerformanceAction: vi.fn()
}))

vi.mock("@/lib/i18n/server", () => ({
  getServerI18n: async () => {
    const locale = "en" as const
    return createTranslator(locale, getMessages(locale))
  }
}))

describe("CreativePerformanceIngestionPanel", () => {
  it("renders the manual ingestion form when exports exist", async () => {
    const ui = await CreativePerformanceIngestionPanel({
      exportOptions: [
        {
          id: "export-1",
          label: "Project · default · 9:16"
        }
      ],
      ingestionEnabled: true
    })

    render(ui)

    expect(screen.getByRole("button", { name: /Record creative performance/i })).toBeEnabled()
    expect(screen.getByDisplayValue("Project · default · 9:16")).toBeInTheDocument()
  })

  it("shows the upgrade state when ingestion is disabled", async () => {
    const ui = await CreativePerformanceIngestionPanel({
      exportOptions: [],
      ingestionEnabled: false
    })

    render(ui)

    expect(
      screen.getByText(
        "Your current plan does not include creative performance ingestion. Upgrade in Billing and plan."
      )
    ).toBeInTheDocument()
  })
})
