import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AppPageFrame, PageIntro, PublicPageFrame, PublicSectionFrame } from "./page-frame"

describe("page frame", () => {
  it("applies the expanded app frame variant", () => {
    const { container } = render(
      <AppPageFrame variant="expanded">Body</AppPageFrame>
    )

    expect(container.firstChild).toHaveClass("theme-app-page-frame-expanded")
  })

  it("applies the readable public frame variant", () => {
    const { container } = render(
      <PublicPageFrame variant="readable">Body</PublicPageFrame>
    )

    expect(container.firstChild).toHaveClass("theme-public-page-frame-readable")
  })

  it("applies the readable public section variant", () => {
    const { container } = render(
      <PublicSectionFrame variant="readable">Body</PublicSectionFrame>
    )

    expect(container.firstChild).toHaveClass("theme-public-section-frame-readable")
  })

  it("renders the page intro content and actions", () => {
    render(
      <PageIntro
        eyebrow="Overview"
        title="Workspace"
        description="Longer description"
        actions={<button type="button">Action</button>}
      />
    )

    expect(screen.getByText("Overview")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Workspace" })).toBeInTheDocument()
    expect(screen.getByText("Longer description")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument()
  })
})
