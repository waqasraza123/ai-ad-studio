import { describe, expect, it } from "vitest"
import {
  getPublicBatchReviewLockMessage,
  getPublicBatchReviewWriteState
} from "./public-batch-review-state"

describe("getPublicBatchReviewWriteState", () => {
  it("returns writable when the review link is active and the batch is not finalized", () => {
    const result = getPublicBatchReviewWriteState({
      batchIsFinalized: false,
      reviewLinkStatus: "active"
    })

    expect(result).toEqual({
      isLocked: false,
      reason: "writable"
    })
  })

  it("returns finalized lock when the batch is finalized even if the link is still active", () => {
    const result = getPublicBatchReviewWriteState({
      batchIsFinalized: true,
      reviewLinkStatus: "active"
    })

    expect(result).toEqual({
      isLocked: true,
      reason: "finalized"
    })
  })

  it("returns inactive-link lock when the link is closed and the batch is not finalized", () => {
    const result = getPublicBatchReviewWriteState({
      batchIsFinalized: false,
      reviewLinkStatus: "closed"
    })

    expect(result).toEqual({
      isLocked: true,
      reason: "link_inactive"
    })
  })

  it("treats revoked links as inactive and locked", () => {
    const result = getPublicBatchReviewWriteState({
      batchIsFinalized: false,
      reviewLinkStatus: "revoked"
    })

    expect(result).toEqual({
      isLocked: true,
      reason: "link_inactive"
    })
  })
})

describe("getPublicBatchReviewLockMessage", () => {
  it("returns no message when the review is writable", () => {
    const message = getPublicBatchReviewLockMessage({
      finalizationNote: "Should not appear.",
      writeState: {
        isLocked: false,
        reason: "writable"
      }
    })

    expect(message).toBeNull()
  })

  it("returns the finalized message with the finalization note when finalized", () => {
    const message = getPublicBatchReviewLockMessage({
      finalizationNote: "Winner locked for campaign handoff.",
      writeState: {
        isLocked: true,
        reason: "finalized"
      }
    })

    expect(message).toBe(
      "This review is closed. The owner finalized the batch and further public review is frozen. Winner locked for campaign handoff."
    )
  })

  it("returns the inactive-link message when the review link is no longer active", () => {
    const message = getPublicBatchReviewLockMessage({
      finalizationNote: null,
      writeState: {
        isLocked: true,
        reason: "link_inactive"
      }
    })

    expect(message).toBe(
      "This review is closed because this review link is no longer active."
    )
  })
})
