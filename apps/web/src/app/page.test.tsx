import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { getMessages } from "@/lib/i18n/catalog"
import { createTranslator } from "@/lib/i18n/translator"

const { featuredShowcaseSection, listPublishedShowcaseItems } = vi.hoisted(
  () => ({
    featuredShowcaseSection: vi.fn(({ items }: { items: unknown[] }) => (
      <div data-testid="featured-showcase">{items.length}</div>
    )),
    listPublishedShowcaseItems: vi.fn()
  })
)

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
  FeatureGrid: () => <div>foundation</div>
}))

vi.mock("@/components/marketing/featured-showcase-section", () => ({
  FeaturedShowcaseSection: featuredShowcaseSection
}))

vi.mock("@/components/marketing/hero-section", () => ({
  HeroSection: () => <div>hero</div>
}))

vi.mock("@/components/marketing/landing-top-bar", () => ({
  LandingTopBar: () => <div>topbar</div>
}))

vi.mock("@/components/marketing/starter-stack-section", () => ({
  StarterStackSection: () => <div>stack</div>
}))

vi.mock("@/components/marketing/demo-strip", () => ({
  WorkflowStrip: () => <div>workflow</div>
}))

describe("HomePage", () => {
  it("renders the starter homepage around mapped reference output", async () => {
    listPublishedShowcaseItems.mockResolvedValue([
      {
        created_at: "2026-04-08T00:00:00.000Z",
        export_id: "export-1",
        id: "showcase-1",
        is_published: true,
        owner_id: "owner-1",
        project_id: "project-1",
        render_batch_id: "batch-1",
        sort_order: 0,
        summary: "Reference output",
        title: "Launch creative",
        updated_at: "2026-04-08T00:00:00.000Z"
      }
    ])

    const { default: HomePage } = await import("./page")
    const ui = await HomePage()
    render(ui)

    expect(screen.getByText("foundation")).toBeInTheDocument()
    expect(screen.getByText("workflow")).toBeInTheDocument()
    expect(screen.getByText("stack")).toBeInTheDocument()
    expect(screen.getByTestId("featured-showcase")).toHaveTextContent("1")
    expect(featuredShowcaseSection.mock.calls[0]?.[0]).toMatchObject({
      items: [
        expect.objectContaining({
          id: "showcase-1",
          title: "Launch creative"
        })
      ]
    })
  })

  it("exposes starter-kit metadata for the public homepage", async () => {
    const { generateMetadata } = await import("./page")

    await expect(generateMetadata()).resolves.toMatchObject({
      description:
        "Production SaaS starter kit for building AI-powered ad creative workflows with Next.js, Supabase, Stripe, R2, OpenAI, and pluggable media providers.",
      title: "AI Ad Studio — Production SaaS Starter Kit"
    })
  })
})
