import { describe, expect, it } from "vitest"
import { planRenderBatchFinalizationEffects } from "./finalization-rules"

describe("planRenderBatchFinalizationEffects", () => {
  it("creates the expected side-effect plan for a finalized winner", () => {
    const finalizedAt = "2026-03-21T12:00:00.000Z"

    const result = planRenderBatchFinalizationEffects({
      finalizedAt,
      ownerId: "owner-1",
      projectId: "project-1",
      renderBatchId: "batch-1",
      winningExportId: "export-1"
    })

    expect(result).toEqual({
      archiveDeliveryWorkspaces: {
        changes: {
          status: "archived",
          updated_at: finalizedAt
        },
        excludeCanonicalExportId: "export-1",
        match: {
          owner_id: "owner-1",
          project_id: "project-1",
          status: "active"
        }
      },
      archiveShareCampaigns: {
        changes: {
          status: "archived",
          updated_at: finalizedAt
        },
        excludeExportId: "export-1",
        match: {
          owner_id: "owner-1",
          project_id: "project-1",
          status: "active"
        }
      },
      closeReviewLinks: {
        changes: {
          status: "closed",
          updated_at: finalizedAt
        },
        match: {
          owner_id: "owner-1",
          render_batch_id: "batch-1",
          status: "active"
        }
      },
      unpublishShowcaseItems: {
        changes: {
          is_published: false,
          updated_at: finalizedAt
        },
        excludeExportId: "export-1",
        match: {
          owner_id: "owner-1",
          project_id: "project-1"
        }
      }
    })
  })

  it("uses the same finalized timestamp for every side effect", () => {
    const finalizedAt = "2026-03-21T18:45:00.000Z"

    const result = planRenderBatchFinalizationEffects({
      finalizedAt,
      ownerId: "owner-9",
      projectId: "project-9",
      renderBatchId: "batch-9",
      winningExportId: "export-9"
    })

    expect(result.closeReviewLinks.changes.updated_at).toBe(finalizedAt)
    expect(result.unpublishShowcaseItems.changes.updated_at).toBe(finalizedAt)
    expect(result.archiveShareCampaigns.changes.updated_at).toBe(finalizedAt)
    expect(result.archiveDeliveryWorkspaces.changes.updated_at).toBe(finalizedAt)
  })

  it("always excludes the winning export from project-level archive targets", () => {
    const result = planRenderBatchFinalizationEffects({
      finalizedAt: "2026-03-21T20:00:00.000Z",
      ownerId: "owner-2",
      projectId: "project-2",
      renderBatchId: "batch-2",
      winningExportId: "export-winning"
    })

    expect(result.unpublishShowcaseItems.excludeExportId).toBe("export-winning")
    expect(result.archiveShareCampaigns.excludeExportId).toBe("export-winning")
    expect(result.archiveDeliveryWorkspaces.excludeCanonicalExportId).toBe(
      "export-winning"
    )
  })
})
