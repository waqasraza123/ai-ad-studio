import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { getMessages } from "@/lib/i18n/catalog"
import { createTranslator } from "@/lib/i18n/translator"
import { PricingSnapshotSection } from "./pricing-snapshot-section"

vi.mock("@/lib/i18n/server", () => ({
  getServerI18n: async () => {
    const locale = "en" as const
    const messages = getMessages(locale)
    return createTranslator(locale, messages)
  }
}))

describe("PricingSnapshotSection", () => {
  it("renders a pricing unavailable state when no plans are available", async () => {
    const ui = await PricingSnapshotSection({
      plans: []
    })

    render(ui)

    expect(
      screen.getByText("Pricing data is temporarily unavailable")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Live catalog unavailable")
    ).toBeInTheDocument()
  })
})
