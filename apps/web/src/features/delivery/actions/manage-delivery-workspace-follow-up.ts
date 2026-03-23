"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  getDeliveryWorkspaceByIdForOwner,
  updateDeliveryWorkspaceFollowUp
} from "@/server/delivery-workspaces/delivery-workspace-repository"
import { getRenderBatchByIdForOwner } from "@/server/render-batches/render-batch-repository"
import {
  getDeliveryWorkspaceFollowUpLabel,
  normalizeDeliveryWorkspaceFollowUpStatus
} from "@/features/delivery/lib/delivery-workspace-follow-up"

function readFollowUpNote(formData: FormData) {
  const value = String(formData.get("follow_up_note") ?? "").trim()
  return value.length > 0 ? value : null
}

function readFollowUpStatus(formData: FormData) {
  return normalizeDeliveryWorkspaceFollowUpStatus(
    String(formData.get("follow_up_status") ?? "")
  )
}

function readFollowUpDueOn(formData: FormData) {
  const value = String(formData.get("follow_up_due_on") ?? "").trim()
  return value.length > 0 ? value : null
}

function resolveNotificationSeverity(followUpStatus: string) {
  if (followUpStatus === "needs_follow_up") {
    return "warning"
  }

  if (followUpStatus === "resolved") {
    return "success"
  }

  return "info"
}

function buildNotificationBody(input: {
  followUpDueOn: string | null
  followUpStatus: string
}) {
  if (input.followUpStatus === "reminder_scheduled" && input.followUpDueOn) {
    return `Follow-up reminder scheduled for ${input.followUpDueOn}.`
  }

  return `Follow-up state is now ${getDeliveryWorkspaceFollowUpLabel(
    normalizeDeliveryWorkspaceFollowUpStatus(input.followUpStatus)
  ).toLowerCase()}.`
}

export async function updateDeliveryWorkspaceFollowUpAction(
  workspaceId: string,
  formData: FormData
) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const workspace = await getDeliveryWorkspaceByIdForOwner(workspaceId, user.id)

  if (!workspace) {
    throw new Error("Delivery workspace not found")
  }

  const batch = await getRenderBatchByIdForOwner(workspace.render_batch_id, user.id)

  if (!batch) {
    throw new Error("Render batch not found")
  }

  const followUpStatus = readFollowUpStatus(formData)
  const rawFollowUpDueOn = readFollowUpDueOn(formData)

  if (followUpStatus === "reminder_scheduled" && !rawFollowUpDueOn) {
    throw new Error("Reminder date is required when reminder scheduling is active")
  }

  const followUpDueOn =
    followUpStatus === "reminder_scheduled" ? rawFollowUpDueOn : null

  const updatedWorkspace = await updateDeliveryWorkspaceFollowUp({
    followUpDueOn,
    followUpNote: readFollowUpNote(formData),
    followUpStatus,
    ownerId: user.id,
    workspaceId: workspace.id
  })

  const supabase = await createSupabaseServerClient()

  await supabase.from("job_traces").insert({
    job_id: batch.job_id,
    owner_id: user.id,
    payload: {
      deliveryWorkspaceId: updatedWorkspace.id,
      followUpDueOn: updatedWorkspace.follow_up_due_on,
      followUpNote: updatedWorkspace.follow_up_note,
      followUpStatus: updatedWorkspace.follow_up_status
    },
    project_id: updatedWorkspace.project_id,
    stage: "delivery_workspace_follow_up_updated",
    trace_type: "delivery"
  })

  await supabase.from("notifications").insert({
    action_url: "/dashboard/delivery",
    body: buildNotificationBody({
      followUpDueOn: updatedWorkspace.follow_up_due_on,
      followUpStatus: updatedWorkspace.follow_up_status
    }),
    export_id: updatedWorkspace.canonical_export_id,
    job_id: batch.job_id,
    kind: "delivery_workspace_follow_up_updated",
    metadata: {
      deliveryWorkspaceId: updatedWorkspace.id,
      followUpDueOn: updatedWorkspace.follow_up_due_on,
      followUpStatus: updatedWorkspace.follow_up_status
    },
    owner_id: user.id,
    project_id: updatedWorkspace.project_id,
    severity: resolveNotificationSeverity(updatedWorkspace.follow_up_status),
    title: "Delivery follow-up updated"
  })

  revalidatePath("/dashboard/delivery")
}
