import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { getMessages } from "@/lib/i18n/catalog"
import { createTranslator } from "@/lib/i18n/translator"
import { BillingPlanCatalogError } from "@/server/billing/billing-plan-catalog"

const {
  listBillingPlans,
  listPublishedShowcaseItems,
  pricingSnapshotSection
} = vi.hoisted(() => ({
  listBillingPlans: vi.fn(),
  listPublishedShowcaseItems: vi.fn(),
  pricingSnapshotSection: vi.fn(({ plans }: { plans: unknown[] }) => (
    <div data-testid="pricing-snapshot">{plans.length}</div>
  ))
}))

vi.mock("@/server/billing/billing-service", () => ({
  listBillingPlans
}))

vi.mock("@/server/showcase/showcase-repository", () => ({
  listPublishedShowcaseItems
}))

vi.mock("@/lib/i18n/server", () => ({
  getServerI18n: async () => {
    const locale = "en" as const
    const messages = getMessages(locale)
    return createTranslator(locale, messages)
  }
}))

vi.mock("@/components/marketing/faq-cta-section", () => ({
  FaqCtaSection: () => <div>faq</div>
}))

vi.mock("@/components/marketing/feature-grid", () => ({
  FeatureGrid: () => <div>features</div>
}))

vi.mock("@/components/marketing/featured-showcase-section", () => ({
  FeaturedShowcaseSection: () => <div>showcase</div>
}))

vi.mock("@/components/marketing/hero-section", () => ({
  HeroSection: () => <div>hero</div>
}))

vi.mock("@/components/marketing/landing-top-bar", () => ({
  LandingTopBar: () => <div>topbar</div>
}))

vi.mock("@/components/marketing/pricing-snapshot-section", () => ({
  PricingSnapshotSection: pricingSnapshotSection
}))

vi.mock("@/components/marketing/demo-strip", () => ({
  WorkflowStrip: () => <div>workflow</div>
}))

describe("HomePage", () => {
  it("keeps rendering when billing plans fail to load", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)

    listBillingPlans.mockRejectedValue(
      new BillingPlanCatalogError({
        code: "schema_drift",
        message: "Failed to list billing plans.",
        postgresCode: "42703"
      })
    )
    listPublishedShowcaseItems.mockResolvedValue([])

    const { default: HomePage } = await import("./page")
    const ui = await HomePage()
    render(ui)

    expect(screen.getByTestId("pricing-snapshot")).toHaveTextContent("0")
    expect(pricingSnapshotSection.mock.calls[0]?.[0]).toEqual({
      plans: []
    })
    expect(consoleError).toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it("rethrows Next dynamic server usage errors", async () => {
    listBillingPlans.mockRejectedValue(
      Object.assign(new Error("Dynamic server usage: cookies"), {
        digest: "DYNAMIC_SERVER_USAGE"
      })
    )
    listPublishedShowcaseItems.mockResolvedValue([])

    const { default: HomePage } = await import("./page")

    await expect(HomePage()).rejects.toMatchObject({
      digest: "DYNAMIC_SERVER_USAGE"
    })
  })
})
