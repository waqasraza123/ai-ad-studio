import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { getMessages } from "@/lib/i18n/catalog"
import { createTranslator } from "@/lib/i18n/translator"
import { HeroSection } from "./hero-section"
import { AI_AD_STUDIO_REPOSITORY_URL } from "./marketing-links"
import { StarterStackSection } from "./starter-stack-section"

vi.mock("@/lib/i18n/server", () => ({
  getServerI18n: async () => {
    const locale = "en" as const
    const messages = getMessages(locale)
    return createTranslator(locale, messages)
  }
}))

vi.mock("./hero-preview", () => ({
  HeroPreview: () => <div>reference preview</div>
}))

describe("starter homepage sections", () => {
  it("makes the repository the primary hero conversion", async () => {
    const ui = await HeroSection({ featuredSampleCount: 2 })
    render(ui)

    expect(
      screen.getByRole("heading", {
        name: "Start with a complete AI SaaS. Make the workflow yours."
      })
    ).toBeInTheDocument()

    const repositoryLink = screen.getByRole("link", { name: /View on GitHub/i })
    expect(repositoryLink).toHaveAttribute("href", AI_AD_STUDIO_REPOSITORY_URL)
    expect(repositoryLink).toHaveAttribute("target", "_blank")
    expect(repositoryLink).toHaveAttribute("rel", "noopener noreferrer")

    expect(
      screen.getByRole("link", { name: /Open reference app/i })
    ).toHaveAttribute("href", "/dashboard")
  })

  it("describes the reusable product, backend, and AI runtime layers", async () => {
    const ui = await StarterStackSection()
    render(ui)

    expect(
      screen.getByRole("heading", {
        name: "A complete shell, backend, and AI runtime"
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Product shell" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "SaaS backend" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "AI runtime" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /View on GitHub/i })
    ).toHaveAttribute("href", AI_AD_STUDIO_REPOSITORY_URL)
  })
})
