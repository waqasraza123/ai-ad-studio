import { describe, expect, it, vi } from "vitest"
vi.mock("server-only", () => ({}))
import { activationServiceInternals } from "./activation-service"

describe("activation service", () => {
  it("flags non-ready or non-finalized exports as blocked", () => {
    expect(
      activationServiceInternals.buildReadinessAssessment({
        canonicalExportId: "export-2",
        exportAssetExists: false,
        exportId: "export-1",
        hasProject: true,
        hasRenderBatch: true,
        exportStatus: "rendering",
        isBatchFinalized: false
      })
    ).toEqual({
      isEligible: false,
      issues: [
        "export_not_ready",
        "export_asset_missing",
        "render_batch_not_finalized",
        "export_not_canonical"
      ],
      status: "blocked"
    })
  })

  it("marks finalized canonical exports as ready", () => {
    expect(
      activationServiceInternals.buildReadinessAssessment({
        canonicalExportId: "export-1",
        exportAssetExists: true,
        exportId: "export-1",
        hasProject: true,
        hasRenderBatch: true,
        exportStatus: "ready",
        isBatchFinalized: true
      })
    ).toEqual({
      isEligible: true,
      issues: [],
      status: "ready"
    })
  })

  it("distinguishes missing canonical and render-batch lineage", () => {
    expect(
      activationServiceInternals.buildReadinessAssessment({
        canonicalExportId: null,
        exportAssetExists: true,
        exportId: "export-1",
        hasProject: true,
        hasRenderBatch: false,
        exportStatus: "ready",
        isBatchFinalized: false
      })
    ).toEqual({
      isEligible: false,
      issues: ["render_batch_missing", "canonical_export_missing"],
      status: "blocked"
    })
  })
})
