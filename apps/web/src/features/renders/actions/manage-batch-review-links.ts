"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getPublicEnvironment } from "@/lib/env"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  createBatchReviewLink,
  getBatchReviewLinkByIdForOwner,
  revokeBatchReviewLink
} from "@/server/batch-reviews/batch-review-repository"
import { getRenderBatchByIdForOwner } from "@/server/render-batches/render-batch-repository"

function readValue(formData: FormData, key: string, fallback = "") {
  return String(formData.get(key) ?? "").trim() || fallback
}

function readReviewerRole(value: string) {
  if (
    value === "client" ||
    value === "stakeholder" ||
    value === "internal_reviewer"
  ) {
    return value
  }

  return "client"
}

export async function createBatchReviewLinkAction(
  batchId: string,
  formData: FormData
) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const batch = await getRenderBatchByIdForOwner(batchId, user.id)

  if (!batch) {
    throw new Error("Render batch not found")
  }

  if (batch.is_finalized) {
    throw new Error("This batch is finalized and no longer accepts new review links")
  }

  const reviewerName = readValue(formData, "reviewer_name")
  const reviewerEmail = readValue(formData, "reviewer_email")
  const reviewerRole = readReviewerRole(readValue(formData, "reviewer_role", "client"))
  const message = readValue(
    formData,
    "message",
    "Please review the batch outputs and leave your decision."
  )

  if (!reviewerName) {
    throw new Error("Reviewer name is required")
  }

  const link = await createBatchReviewLink({
    message,
    ownerId: user.id,
    projectId: batch.project_id,
    renderBatchId: batch.id,
    reviewerEmail: reviewerEmail || null,
    reviewerName,
    reviewerRole
  })

  const supabase = await createSupabaseServerClient()

  await supabase.from("job_traces").insert({
    job_id: batch.job_id,
    owner_id: user.id,
    payload: {
      reviewLinkId: link.id,
      reviewerName: link.reviewer_name,
      reviewerRole: link.reviewer_role
    },
    project_id: batch.project_id,
    stage: "batch_review_link_created",
    trace_type: "external_review"
  })

  await supabase.from("notifications").insert({
    action_url: `/dashboard/render-batches/${batch.id}`,
    body: `${link.reviewer_name} can now review this batch through an external review link.`,
    export_id: null,
    job_id: batch.job_id,
    kind: "batch_review_link_created",
    metadata: {
      reviewLinkId: link.id,
      reviewerRole: link.reviewer_role
    },
    owner_id: user.id,
    project_id: batch.project_id,
    severity: "info",
    title: "External review link created"
  })

  revalidatePath(`/dashboard/render-batches/${batch.id}`)
}

export async function revokeBatchReviewLinkAction(
  batchId: string,
  linkId: string
) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const [batch, link] = await Promise.all([
    getRenderBatchByIdForOwner(batchId, user.id),
    getBatchReviewLinkByIdForOwner(linkId, user.id)
  ])

  if (!batch || !link) {
    throw new Error("Review link not found")
  }

  if (batch.is_finalized) {
    throw new Error("This batch is finalized and review links can no longer be changed")
  }

  if (link.status !== "active") {
    throw new Error("Only active review links can be revoked")
  }

  const revoked = await revokeBatchReviewLink({
    linkId,
    ownerId: user.id
  })

  const supabase = await createSupabaseServerClient()

  await supabase.from("job_traces").insert({
    job_id: batch.job_id,
    owner_id: user.id,
    payload: {
      reviewLinkId: revoked.id,
      reviewerName: revoked.reviewer_name
    },
    project_id: batch.project_id,
    stage: "batch_review_link_revoked",
    trace_type: "external_review"
  })

  await supabase.from("notifications").insert({
    action_url: `/dashboard/render-batches/${batch.id}`,
    body: `${revoked.reviewer_name}'s external review link was revoked.`,
    export_id: null,
    job_id: batch.job_id,
    kind: "batch_review_link_revoked",
    metadata: {
      reviewLinkId: revoked.id
    },
    owner_id: user.id,
    project_id: batch.project_id,
    severity: "warning",
    title: "External review link revoked"
  })

  revalidatePath(`/dashboard/render-batches/${batch.id}`)
}

export async function getBatchReviewPublicUrl(token: string) {
  const environment = getPublicEnvironment()
  return `${environment.NEXT_PUBLIC_APP_URL}/review/${token}`
}
