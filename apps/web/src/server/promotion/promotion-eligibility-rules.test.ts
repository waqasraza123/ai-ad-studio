import { describe, expect, it } from "vitest"
import { evaluatePromotionEligibility } from "./promotion-eligibility-rules"

describe("evaluatePromotionEligibility", () => {
  it("returns eligible for the current canonical finalized export", () => {
    const result = evaluatePromotionEligibility({
      batchFinalizedAt: "2026-03-20T00:00:00.000Z",
      batchFinalizedExportId: "export-1",
      batchId: "batch-1",
      batchIsFinalized: true,
      batchJobId: "job-1",
      batchProjectId: "project-1",
      exportId: "export-1",
      exportProjectId: "project-1",
      projectCanonicalExportId: "export-1",
      projectId: "project-1"
    })

    expect(result).toEqual({
      eligible: true,
      batchId: "batch-1",
      jobId: "job-1",
      projectId: "project-1"
    })
  })

  it("returns ineligible when the export is finalized in its batch but is no longer the project canonical export", () => {
    const result = evaluatePromotionEligibility({
      batchFinalizedAt: "2026-03-20T00:00:00.000Z",
      batchFinalizedExportId: "export-1",
      batchId: "batch-1",
      batchIsFinalized: true,
      batchJobId: "job-1",
      batchProjectId: "project-1",
      exportId: "export-1",
      exportProjectId: "project-1",
      projectCanonicalExportId: "export-2",
      projectId: "project-1"
    })

    expect(result).toEqual({
      eligible: false,
      reason: "Only the current canonical export can be promoted publicly."
    })
  })

  it("returns ineligible when the export has no batch id", () => {
    const result = evaluatePromotionEligibility({
      batchFinalizedAt: null,
      batchFinalizedExportId: null,
      batchId: null,
      batchIsFinalized: false,
      batchJobId: null,
      batchProjectId: null,
      exportId: "export-1",
      exportProjectId: "project-1",
      projectCanonicalExportId: "export-1",
      projectId: "project-1"
    })

    expect(result).toEqual({
      eligible: false,
      reason: "Only finalized canonical exports can be promoted publicly."
    })
  })

  it("returns ineligible when the batch is not finalized", () => {
    const result = evaluatePromotionEligibility({
      batchFinalizedAt: null,
      batchFinalizedExportId: null,
      batchId: "batch-1",
      batchIsFinalized: false,
      batchJobId: "job-1",
      batchProjectId: "project-1",
      exportId: "export-1",
      exportProjectId: "project-1",
      projectCanonicalExportId: "export-1",
      projectId: "project-1"
    })

    expect(result).toEqual({
      eligible: false,
      reason: "Finalize the reviewed winner before promoting it publicly."
    })
  })

  it("returns ineligible when the batch project does not match the export project", () => {
    const result = evaluatePromotionEligibility({
      batchFinalizedAt: "2026-03-20T00:00:00.000Z",
      batchFinalizedExportId: "export-1",
      batchId: "batch-1",
      batchIsFinalized: true,
      batchJobId: "job-1",
      batchProjectId: "project-2",
      exportId: "export-1",
      exportProjectId: "project-1",
      projectCanonicalExportId: "export-1",
      projectId: "project-1"
    })

    expect(result).toEqual({
      eligible: false,
      reason: "The review batch for this export does not belong to this project."
    })
  })
})
