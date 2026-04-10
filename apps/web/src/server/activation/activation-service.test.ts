import { describe, expect, it, vi } from "vitest"
vi.mock("server-only", () => ({}))
import { activationServiceInternals } from "./activation-service"

describe("activation service", () => {
  it("flags non-ready or non-finalized exports as blocked", () => {
    expect(
      activationServiceInternals.buildReadinessIssues({
        canonicalExportId: "export-2",
        exportAssetExists: false,
        exportId: "export-1",
        exportStatus: "rendering",
        isBatchFinalized: false
      })
    ).toEqual([
      "export_not_ready",
      "export_asset_missing",
      "export_not_finalized"
    ])
  })

  it("marks finalized canonical exports as ready", () => {
    expect(
      activationServiceInternals.buildReadinessIssues({
        canonicalExportId: "export-1",
        exportAssetExists: true,
        exportId: "export-1",
        exportStatus: "ready",
        isBatchFinalized: true
      })
    ).toEqual([])
  })
})
