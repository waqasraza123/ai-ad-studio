"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { MODEST_WORDING_FORM_ERROR_CODE, validateRecordTextFields } from "@/lib/modest-wording"
import {
  submitPublicBatchReviewComment,
  submitPublicBatchReviewResponse
} from "@/server/batch-reviews/batch-review-repository"

function readResponseStatus(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "")

  if (normalized === "approved" || normalized === "rejected") {
    return normalized
  }

  return null
}

function readNullableValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim()
  return value.length > 0 ? value : null
}

function reviewPath(token: string) {
  return `/review/${token}`
}

export async function submitPublicBatchReviewResponseAction(
  token: string,
  formData: FormData
) {
  const path = reviewPath(token)
  const responseStatus = readResponseStatus(formData.get("response_status"))
  const responseNote = readNullableValue(formData, "response_note")

  if (!responseStatus) {
    redirect(`${path}?error=${encodeURIComponent("review_response_invalid")}`)
  }

  if (validateRecordTextFields({ responseNote })) {
    redirect(`${path}?error=${encodeURIComponent(MODEST_WORDING_FORM_ERROR_CODE)}`)
  }

  try {
    await submitPublicBatchReviewResponse({
      responseNote,
      responseStatus,
      token
    })
  } catch {
    redirect(`${path}?error=${encodeURIComponent("server_error")}`)
  }

  revalidatePath(path)
}

export async function submitPublicBatchReviewCommentAction(
  token: string,
  exportId: string | null,
  formData: FormData
) {
  const path = reviewPath(token)
  const body = String(formData.get("body") ?? "").trim()
  const authorLabel = readNullableValue(formData, "author_label")

  if (!body) {
    redirect(`${path}?error=${encodeURIComponent("comment_required")}`)
  }

  if (validateRecordTextFields({ authorLabel, body })) {
    redirect(`${path}?error=${encodeURIComponent(MODEST_WORDING_FORM_ERROR_CODE)}`)
  }

  try {
    await submitPublicBatchReviewComment({
      authorLabel,
      body,
      exportId,
      token
    })
  } catch {
    redirect(`${path}?error=${encodeURIComponent("server_error")}`)
  }

  revalidatePath(path)
}
