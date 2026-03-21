export type RenderBatchFinalizationEffectsPlan = {
  archiveDeliveryWorkspaces: {
    changes: {
      status: "archived"
      updated_at: string
    }
    excludeCanonicalExportId: string
    match: {
      owner_id: string
      project_id: string
      status: "active"
    }
  }
  archiveShareCampaigns: {
    changes: {
      status: "archived"
      updated_at: string
    }
    excludeExportId: string
    match: {
      owner_id: string
      project_id: string
      status: "active"
    }
  }
  closeReviewLinks: {
    changes: {
      status: "closed"
      updated_at: string
    }
    match: {
      owner_id: string
      render_batch_id: string
      status: "active"
    }
  }
  unpublishShowcaseItems: {
    changes: {
      is_published: false
      updated_at: string
    }
    excludeExportId: string
    match: {
      owner_id: string
      project_id: string
    }
  }
}

type PlanRenderBatchFinalizationEffectsInput = {
  finalizedAt: string
  ownerId: string
  projectId: string
  winningExportId: string
  renderBatchId: string
}

export function planRenderBatchFinalizationEffects(
  input: PlanRenderBatchFinalizationEffectsInput
): RenderBatchFinalizationEffectsPlan {
  return {
    archiveDeliveryWorkspaces: {
      changes: {
        status: "archived",
        updated_at: input.finalizedAt
      },
      excludeCanonicalExportId: input.winningExportId,
      match: {
        owner_id: input.ownerId,
        project_id: input.projectId,
        status: "active"
      }
    },
    archiveShareCampaigns: {
      changes: {
        status: "archived",
        updated_at: input.finalizedAt
      },
      excludeExportId: input.winningExportId,
      match: {
        owner_id: input.ownerId,
        project_id: input.projectId,
        status: "active"
      }
    },
    closeReviewLinks: {
      changes: {
        status: "closed",
        updated_at: input.finalizedAt
      },
      match: {
        owner_id: input.ownerId,
        render_batch_id: input.renderBatchId,
        status: "active"
      }
    },
    unpublishShowcaseItems: {
      changes: {
        is_published: false,
        updated_at: input.finalizedAt
      },
      excludeExportId: input.winningExportId,
      match: {
        owner_id: input.ownerId,
        project_id: input.projectId
      }
    }
  }
}
