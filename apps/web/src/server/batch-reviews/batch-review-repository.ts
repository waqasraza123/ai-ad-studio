import "server-only"
import { randomBytes } from "node:crypto"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  BatchReviewCommentRecord,
  BatchReviewLinkRecord,
  PublicBatchReviewContext,
  PublicBatchReviewExport,
  ReviewerRole
} from "@/server/database/types"

const batchReviewLinkSelection =
  "id, owner_id, project_id, render_batch_id, reviewer_name, reviewer_email, reviewer_role, message, token, status, response_status, response_note, responded_at, created_at, updated_at"

const batchReviewCommentSelection =
  "id, owner_id, project_id, render_batch_id, review_link_id, export_id, author_label, reviewer_role, body, created_at"

function generateReviewToken() {
  return randomBytes(20).toString("hex")
}

export async function listBatchReviewLinksByBatchIdForOwner(
  batchId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("batch_review_links")
    .select(batchReviewLinkSelection)
    .eq("render_batch_id", batchId)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list batch review links")
  }

  return (data ?? []) as BatchReviewLinkRecord[]
}

export async function listBatchReviewCommentsByBatchIdForOwner(
  batchId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("batch_review_comments")
    .select(batchReviewCommentSelection)
    .eq("render_batch_id", batchId)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error("Failed to list batch review comments")
  }

  return (data ?? []) as BatchReviewCommentRecord[]
}

export async function getBatchReviewLinkByIdForOwner(
  linkId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("batch_review_links")
    .select(batchReviewLinkSelection)
    .eq("id", linkId)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load batch review link")
  }

  return (data ?? null) as BatchReviewLinkRecord | null
}

export async function createBatchReviewLink(input: {
  ownerId: string
  projectId: string
  renderBatchId: string
  reviewerName: string
  reviewerEmail: string | null
  reviewerRole: ReviewerRole
  message: string
}) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("batch_review_links")
    .insert({
      message: input.message,
      owner_id: input.ownerId,
      project_id: input.projectId,
      render_batch_id: input.renderBatchId,
      reviewer_email: input.reviewerEmail,
      reviewer_name: input.reviewerName,
      reviewer_role: input.reviewerRole,
      token: generateReviewToken()
    })
    .select(batchReviewLinkSelection)
    .single()

  if (error) {
    throw new Error("Failed to create batch review link")
  }

  return data as BatchReviewLinkRecord
}

export async function revokeBatchReviewLink(input: {
  linkId: string
  ownerId: string
}) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("batch_review_links")
    .update({
      status: "revoked",
      updated_at: new Date().toISOString()
    })
    .eq("id", input.linkId)
    .eq("owner_id", input.ownerId)
    .select(batchReviewLinkSelection)
    .single()

  if (error) {
    throw new Error("Failed to revoke batch review link")
  }

  return data as BatchReviewLinkRecord
}

export async function getPublicBatchReviewContext(token: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.rpc("get_public_batch_review_context", {
    p_token: token
  })

  if (error) {
    throw new Error("Failed to load public batch review context")
  }

  const record = Array.isArray(data) ? data[0] : null

  return (record ?? null) as PublicBatchReviewContext | null
}

export async function listPublicBatchReviewExports(token: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.rpc("list_public_batch_review_exports", {
    p_token: token
  })

  if (error) {
    throw new Error("Failed to load public batch review exports")
  }

  return (data ?? []) as PublicBatchReviewExport[]
}

export async function listPublicBatchReviewComments(token: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.rpc("list_public_batch_review_comments", {
    p_token: token
  })

  if (error) {
    throw new Error("Failed to load public batch review comments")
  }

  return (data ?? []) as Array<{
    comment_id: string
    export_id: string | null
    author_label: string
    reviewer_role: ReviewerRole | null
    body: string
    created_at: string
  }>
}

export async function submitPublicBatchReviewResponse(input: {
  token: string
  responseStatus: "approved" | "rejected"
  responseNote: string | null
}) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.rpc("submit_public_batch_review_response", {
    p_response_note: input.responseNote,
    p_response_status: input.responseStatus,
    p_token: input.token
  })

  if (error) {
    throw new Error("Failed to submit public batch review response")
  }

  return Array.isArray(data) ? data[0] ?? null : null
}

export async function submitPublicBatchReviewComment(input: {
  token: string
  exportId: string | null
  authorLabel: string | null
  body: string
}) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.rpc("submit_public_batch_review_comment", {
    p_author_label: input.authorLabel,
    p_body: input.body,
    p_export_id: input.exportId,
    p_token: input.token
  })

  if (error) {
    throw new Error("Failed to submit public batch review comment")
  }

  return Array.isArray(data) ? data[0] ?? null : null
}
