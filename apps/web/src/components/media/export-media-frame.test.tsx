import { screen } from "@testing-library/react"
import { createElement } from "react"
import { describe, expect, it } from "vitest"
import { ExportMediaFrame } from "@/components/media/export-media-frame"
import { renderWithAppProviders } from "@/test/render"

describe("ExportMediaFrame", () => {
  it("shows the shared loading spinner while video preview data is loading", () => {
    renderWithAppProviders(createElement(ExportMediaFrame, {
      previewDataUrl: null,
      projectName: "Launch ad",
      videoSrc: "/demo.mp4"
    }))

    expect(screen.getByRole("img", { name: "Loading video preview" })).toBeInTheDocument()
  })
})
