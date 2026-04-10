import type { AppMessageKey } from "@/lib/i18n/messages/en"

export type PromotionEligibilityResult =
  | {
      eligible: true
      batchId: string
      jobId: string
      projectId: string
    }
  | {
      eligible: false
      reason: AppMessageKey
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
      reason: "promotion.eligibility.finalizedCanonicalOnly"
    }
  }

  if (!input.batchProjectId || !input.batchJobId) {
    return {
      eligible: false,
      reason: "promotion.eligibility.batchNotFound"
    }
  }

  if (!input.projectId) {
    return {
      eligible: false,
      reason: "promotion.eligibility.projectNotFound"
    }
  }

  if (input.batchProjectId !== input.exportProjectId) {
    return {
      eligible: false,
      reason: "promotion.eligibility.batchProjectMismatch"
    }
  }

  if (
    !input.batchIsFinalized ||
    !input.batchFinalizedAt ||
    !input.batchFinalizedExportId
  ) {
    return {
      eligible: false,
      reason: "promotion.eligibility.finalizeWinnerFirst"
    }
  }

  if (input.batchFinalizedExportId !== input.exportId) {
    return {
      eligible: false,
      reason: "promotion.eligibility.notFinalizedCanonical"
    }
  }

  if (input.projectCanonicalExportId !== input.exportId) {
    return {
      eligible: false,
      reason: "promotion.eligibility.notCurrentCanonical"
    }
  }

  return {
    batchId: input.batchId,
    eligible: true,
    jobId: input.batchJobId,
    projectId: input.batchProjectId
  }
}
