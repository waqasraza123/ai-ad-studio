import { render, screen } from "@testing-library/react"
import { createElement } from "react"
import { describe, expect, it } from "vitest"
import { LoadingInline } from "@/components/loading/loading-inline"
import { LoadingOverlay } from "@/components/loading/loading-overlay"
import { LoadingSpinner } from "@/components/loading/loading-spinner"

describe("loading indicators", () => {
  it("renders an accessible spinner when a label is provided", () => {
    render(createElement(LoadingSpinner, {
      label: "Loading content"
    }))

    expect(screen.getByRole("img", { name: "Loading content" })).toBeInTheDocument()
  })

  it("renders an inline spinner with visible label text", () => {
    render(createElement(LoadingInline, {
      label: "Saving changes"
    }))

    expect(screen.getByText("Saving changes")).toBeInTheDocument()
  })

  it("renders a blocking overlay as a live status region", () => {
    render(createElement(LoadingOverlay, {
      label: "Switching language..."
    }))

    const status = screen.getByRole("status")
    expect(status).toHaveAttribute("aria-busy", "true")
    expect(status).toHaveTextContent("Switching language...")
  })
})
