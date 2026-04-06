"use server"

import { revalidatePath } from "next/cache"
import { MODEST_WORDING_FORM_ERROR_CODE, validateModestText } from "@/lib/modest-wording"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirectToLoginWithFormError, redirectWithFormError } from "@/lib/server-action-redirect"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  getApprovalByJobIdForOwner,
  updateApprovalDecision
} from "@/server/approvals/approval-repository"

function readDecisionNote(formData: FormData) {
  const value = String(formData.get("decision_note") ?? "").trim()
  return value.length > 0 ? value : null
}

function projectPath(projectId: string) {
  return `/dashboard/projects/${projectId}`
}

async function createApprovalNotification(input: {
  actionUrl: string
  body: string
  jobId: string
  kind: string
  ownerId: string
  projectId: string
  severity: "success" | "warning"
  title: string
}) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from("notifications").insert({
    action_url: input.actionUrl,
    body: input.body,
    job_id: input.jobId,
    kind: input.kind,
    metadata: {},
    owner_id: input.ownerId,
    project_id: input.projectId,
    severity: input.severity,
    title: input.title
  })

  if (error) {
    throw new Error("notification_insert_failed")
  }
}

async function requeueBlockedJob(jobId: string, ownerId: string) {
  const supabase = await createSupabaseServerClient()
  const nowIso = new Date().toISOString()

  const { error } = await supabase
    .from("jobs")
    .update({
      error: {},
      finished_at: null,
      heartbeat_at: null,
      next_attempt_at: nowIso,
      scheduled_at: nowIso,
      started_at: null,
      status: "queued"
    })
    .eq("id", jobId)
    .eq("owner_id", ownerId)
    .eq("status", "blocked")

  if (error) {
    throw new Error("requeue_failed")
  }
}

export async function approveRenderAction(jobId: string, formData: FormData) {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  const approval = await getApprovalByJobIdForOwner(jobId, user.id)

  if (!approval) {
    redirectWithFormError("/dashboard", "approval_not_found")
  }

  const path = projectPath(approval.project_id)
  const decisionNote = readDecisionNote(formData)

  if (validateModestText(decisionNote)) {
    redirectWithFormError(path, MODEST_WORDING_FORM_ERROR_CODE)
  }

  try {
    const updated = await updateApprovalDecision({
      approvalId: approval.id,
      decisionNote,
      ownerId: user.id,
      status: "approved"
    })

    await requeueBlockedJob(jobId, user.id)

    await createApprovalNotification({
      actionUrl: `/dashboard/debug/jobs/${jobId}`,
      body: "The final render approval was accepted and the blocked render job has been queued again.",
      jobId,
      kind: "approval_approved",
      ownerId: user.id,
      projectId: updated.project_id,
      severity: "success",
      title: "Final render approved"
    })

    revalidatePath(path)
    revalidatePath(`/dashboard/debug/jobs/${jobId}`)
    revalidatePath("/dashboard/notifications")
  } catch {
    redirectWithFormError(path, "server_error")
  }
}

export async function rejectRenderAction(jobId: string, formData: FormData) {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  const approval = await getApprovalByJobIdForOwner(jobId, user.id)

  if (!approval) {
    redirectWithFormError("/dashboard", "approval_not_found")
  }

  const path = projectPath(approval.project_id)
  const decisionNote = readDecisionNote(formData)

  if (validateModestText(decisionNote)) {
    redirectWithFormError(path, MODEST_WORDING_FORM_ERROR_CODE)
  }

  try {
    const updated = await updateApprovalDecision({
      approvalId: approval.id,
      decisionNote,
      ownerId: user.id,
      status: "rejected"
    })

    await createApprovalNotification({
      actionUrl: path,
      body: decisionNote
        ? `The final render approval was rejected. Note: ${decisionNote}`
        : "The final render approval was rejected.",
      jobId,
      kind: "approval_rejected",
      ownerId: user.id,
      projectId: updated.project_id,
      severity: "warning",
      title: "Final render rejected"
    })

    revalidatePath(path)
    revalidatePath(`/dashboard/debug/jobs/${jobId}`)
    revalidatePath("/dashboard/notifications")
  } catch {
    redirectWithFormError(path, "server_error")
  }
}
