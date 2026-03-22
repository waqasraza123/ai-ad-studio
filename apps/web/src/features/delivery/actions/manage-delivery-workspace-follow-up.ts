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

function resolveNotificationSeverity(followUpStatus: string) {
  if (followUpStatus === "needs_follow_up") {
    return "warning"
  }

  if (followUpStatus === "resolved") {
    return "success"
  }

  return "info"
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

  const updatedWorkspace = await updateDeliveryWorkspaceFollowUp({
    followUpNote: readFollowUpNote(formData),
    followUpStatus: readFollowUpStatus(formData),
    ownerId: user.id,
    workspaceId: workspace.id
  })

  const followUpLabel = getDeliveryWorkspaceFollowUpLabel(
    updatedWorkspace.follow_up_status
  )

  const supabase = await createSupabaseServerClient()

  await supabase.from("job_traces").insert({
    job_id: batch.job_id,
    owner_id: user.id,
    payload: {
      deliveryWorkspaceId: updatedWorkspace.id,
      followUpNote: updatedWorkspace.follow_up_note,
      followUpStatus: updatedWorkspace.follow_up_status
    },
    project_id: updatedWorkspace.project_id,
    stage: "delivery_workspace_follow_up_updated",
    trace_type: "delivery"
  })

  await supabase.from("notifications").insert({
    action_url: "/dashboard/delivery",
    body: `Follow-up state is now ${followUpLabel.toLowerCase()}.`,
    export_id: updatedWorkspace.canonical_export_id,
    job_id: batch.job_id,
    kind: "delivery_workspace_follow_up_updated",
    metadata: {
      deliveryWorkspaceId: updatedWorkspace.id,
      followUpStatus: updatedWorkspace.follow_up_status
    },
    owner_id: user.id,
    project_id: updatedWorkspace.project_id,
    severity: resolveNotificationSeverity(updatedWorkspace.follow_up_status),
    title: "Delivery follow-up updated"
  })

  revalidatePath("/dashboard/delivery")
}
