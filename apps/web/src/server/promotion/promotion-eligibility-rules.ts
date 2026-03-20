export type PromotionEligibilityResult =
  | {
      eligible: true
      batchId: string
      jobId: string
      projectId: string
    }
  | {
      eligible: false
      reason: string
    }

type EvaluatePromotionEligibilityInput = {
  batchFinalizedAt: string | null
  batchFinalizedExportId: string | null
  batchId: string | null
  batchIsFinalized: boolean
  batchJobId: string | null
  batchProjectId: string | null
  exportId: string
  exportProjectId: string
  projectCanonicalExportId: string | null
  projectId: string | null
}

export function evaluatePromotionEligibility(
  input: EvaluatePromotionEligibilityInput
): PromotionEligibilityResult {
  if (!input.batchId) {
    return {
      eligible: false,
      reason: "Only finalized canonical exports can be promoted publicly."
    }
  }

  if (!input.batchProjectId || !input.batchJobId) {
    return {
      eligible: false,
      reason: "The review batch for this export was not found."
    }
  }

  if (!input.projectId) {
    return {
      eligible: false,
      reason: "The project for this export was not found."
    }
  }

  if (input.batchProjectId !== input.exportProjectId) {
    return {
      eligible: false,
      reason: "The review batch for this export does not belong to this project."
    }
  }

  if (
    !input.batchIsFinalized ||
    !input.batchFinalizedAt ||
    !input.batchFinalizedExportId
  ) {
    return {
      eligible: false,
      reason: "Finalize the reviewed winner before promoting it publicly."
    }
  }

  if (input.batchFinalizedExportId !== input.exportId) {
    return {
      eligible: false,
      reason: "Only the finalized canonical export can be promoted publicly."
    }
  }

  if (input.projectCanonicalExportId !== input.exportId) {
    return {
      eligible: false,
      reason: "Only the current canonical export can be promoted publicly."
    }
  }

  return {
    batchId: input.batchId,
    eligible: true,
    jobId: input.batchJobId,
    projectId: input.batchProjectId
  }
}
