import { describe, expect, it } from "vitest"
import type { ExportRecord } from "@/server/database/types"
import {
  buildDeliveryApprovalSummary,
  resolveDeliveryWorkspaceExports
} from "./delivery-workspace-rules"

function createExportRecord(id: string): ExportRecord {
  return {
    id,
    project_id: "project-1",
    concept_id: null,
    owner_id: "owner-1",
    asset_id: null,
    status: "ready",
    version: 1,
    variant_key: "default",
    aspect_ratio: "9:16",
    platform_preset: "default",
    render_metadata: {
      batchId: "batch-1"
    },
    created_at: "2026-03-21T00:00:00.000Z",
    updated_at: "2026-03-21T00:00:00.000Z"
  }
}

describe("buildDeliveryApprovalSummary", () => {
  it("counts approved, rejected, and only active pending links", () => {
    const summary = buildDeliveryApprovalSummary({
      batchFinalizationNote: "Final winner approved for delivery.",
      batchReviewLinks: [
        {
          response_status: "approved",
          status: "active"
        },
        {
          response_status: "approved",
          status: "closed"
        },
        {
          response_status: "rejected",
          status: "active"
        },
        {
          response_status: "pending",
          status: "active"
        },
        {
          response_status: "pending",
          status: "closed"
        }
      ],
      batchReviewNote: "Strong signal from reviewers.",
      decidedAt: "2026-03-21T01:00:00.000Z",
      finalizedAt: "2026-03-21T02:00:00.000Z"
    })

    expect(summary).toEqual({
      approved_count: 2,
      decided_at: "2026-03-21T01:00:00.000Z",
      finalization_note: "Final winner approved for delivery.",
      finalized_at: "2026-03-21T02:00:00.000Z",
      pending_count: 1,
      rejected_count: 1,
      responded_count: 3,
      review_note: "Strong signal from reviewers."
    })
  })
})

describe("resolveDeliveryWorkspaceExports", () => {
  it("always includes the canonical export even when no exports are selected", () => {
    const canonicalExport = createExportRecord("export-canonical")

    const result = resolveDeliveryWorkspaceExports({
      batchExports: [canonicalExport, createExportRecord("export-alt-1")],
      canonicalExport,
      selectedExportIds: []
    })

    expect(result.map((exportRecord) => exportRecord.id)).toEqual([
      "export-canonical"
    ])
  })

  it("keeps the canonical export first and appends valid selected exports in submitted order", () => {
    const canonicalExport = createExportRecord("export-canonical")
    const secondExport = createExportRecord("export-alt-1")
    const thirdExport = createExportRecord("export-alt-2")

    const result = resolveDeliveryWorkspaceExports({
      batchExports: [canonicalExport, secondExport, thirdExport],
      canonicalExport,
      selectedExportIds: ["export-alt-2", "export-alt-1"]
    })

    expect(result.map((exportRecord) => exportRecord.id)).toEqual([
      "export-canonical",
      "export-alt-2",
      "export-alt-1"
    ])
  })

  it("ignores invalid ids and duplicate selections", () => {
    const canonicalExport = createExportRecord("export-canonical")
    const secondExport = createExportRecord("export-alt-1")

    const result = resolveDeliveryWorkspaceExports({
      batchExports: [canonicalExport, secondExport],
      canonicalExport,
      selectedExportIds: [
        "export-canonical",
        "export-alt-1",
        "missing-export",
        "export-alt-1"
      ]
    })

    expect(result.map((exportRecord) => exportRecord.id)).toEqual([
      "export-canonical",
      "export-alt-1"
    ])
  })
})
