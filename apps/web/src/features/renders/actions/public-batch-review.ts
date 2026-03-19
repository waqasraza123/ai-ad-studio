"use server"

import { revalidatePath } from "next/cache"
import {
  submitPublicBatchReviewComment,
  submitPublicBatchReviewResponse
} from "@/server/batch-reviews/batch-review-repository"

function readResponseStatus(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "")

  if (normalized === "approved" || normalized === "rejected") {
    return normalized
  }

  throw new Error("Response status is required")
}

function readNullableValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim()
  return value.length > 0 ? value : null
}

export async function submitPublicBatchReviewResponseAction(
  token: string,
  formData: FormData
) {
  await submitPublicBatchReviewResponse({
    responseNote: readNullableValue(formData, "response_note"),
    responseStatus: readResponseStatus(formData.get("response_status")),
    token
  })

  revalidatePath(`/review/${token}`)
}

export async function submitPublicBatchReviewCommentAction(
  token: string,
  exportId: string | null,
  formData: FormData
) {
  const body = String(formData.get("body") ?? "").trim()

  if (!body) {
    throw new Error("Comment body is required")
  }

  await submitPublicBatchReviewComment({
    authorLabel: readNullableValue(formData, "author_label"),
    body,
    exportId,
    token
  })

  revalidatePath(`/review/${token}`)
}
