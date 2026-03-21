type PublicBatchReviewStatus = "active" | "closed" | "revoked" | string

type PublicBatchReviewWriteStateInput = {
  batchIsFinalized: boolean
  reviewLinkStatus: PublicBatchReviewStatus
}

type PublicBatchReviewWriteState =
  | {
      isLocked: false
      reason: "writable"
    }
  | {
      isLocked: true
      reason: "finalized" | "link_inactive"
    }

export function getPublicBatchReviewWriteState(
  input: PublicBatchReviewWriteStateInput
): PublicBatchReviewWriteState {
  if (input.batchIsFinalized) {
    return {
      isLocked: true,
      reason: "finalized"
    }
  }

  if (input.reviewLinkStatus !== "active") {
    return {
      isLocked: true,
      reason: "link_inactive"
    }
  }

  return {
    isLocked: false,
    reason: "writable"
  }
}

export function getPublicBatchReviewLockMessage(input: {
  finalizationNote: string | null
  writeState: PublicBatchReviewWriteState
}) {
  if (!input.writeState.isLocked) {
    return null
  }

  if (input.writeState.reason === "finalized") {
    return input.finalizationNote
      ? `This review is closed. The owner finalized the batch and further public review is frozen. ${input.finalizationNote}`
      : "This review is closed. The owner finalized the batch and further public review is frozen."
  }

  return "This review is closed because this review link is no longer active."
}
