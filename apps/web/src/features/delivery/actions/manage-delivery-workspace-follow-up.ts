"use server"
import { reopenDeliveryWorkspaceReminderMismatch } from "@/server/delivery-workspaces/delivery-workspace-repository"
import { buildDeliveryReminderMismatchReopenActivityMetadata, deliveryReminderMismatchReopenNoteFieldName, normalizeDeliveryReminderMismatchReopenNote, validateDeliveryReminderMismatchReopenNote } from "@/features/delivery/lib/delivery-reminder-mismatch-reopen"
import { buildDeliveryReminderMismatchOutcomeHref } from "@/features/delivery/lib/delivery-reminder-mismatch-outcome"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { MODEST_WORDING_FORM_ERROR_CODE, validateModestText } from "@/lib/modest-wording"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  getDeliveryWorkspaceByIdForOwner,
  getDeliveryWorkspaceFollowUpSnapshotById,
  recordDeliveryWorkspaceEvent,
  resolveDeliveryWorkspaceReminderMismatch,
  updateDeliveryWorkspaceFollowUp
} from "@/server/delivery-workspaces/delivery-workspace-repository"
import { getRenderBatchByIdForOwner } from "@/server/render-batches/render-batch-repository"
import {
  getDeliveryWorkspaceFollowUpLabel,
  normalizeDeliveryWorkspaceFollowUpStatus
} from "@/features/delivery/lib/delivery-workspace-follow-up"
import {
  buildDeliveryReminderRepairValues,
  deliveryReminderRepairActionFieldName,
  normalizeDeliveryReminderRepairAction
} from "@/features/delivery/lib/delivery-reminder-repair"
import { buildDeliveryReminderRepairResultHref } from "@/features/delivery/lib/delivery-reminder-repair-outcome"
import {
  deliveryReminderClearReasonFieldName,
  normalizeDeliveryReminderClearReason,
  validateDeliveryReminderClearReason
} from "@/features/delivery/lib/delivery-reminder-repair-reason"
import {
  buildDeliveryReminderRepairActivityMetadata,
  normalizeReminderBucketForRepairActivity,
  normalizeReminderNotificationIdForRepairActivity
} from "@/features/delivery/lib/delivery-reminder-repair-activity"
import {
  buildDeliveryReminderMismatchResolutionActivityMetadata,
  deliveryReminderMismatchResolutionNoteFieldName,
  normalizeDeliveryReminderMismatchResolutionNote,
  validateDeliveryReminderMismatchResolutionNote
} from "@/features/delivery/lib/delivery-reminder-mismatch-resolution"

function getOptionalTrimmedFormValue(formData: FormData, fieldName: string) {
  const rawValue = formData.get(fieldName)

  if (typeof rawValue !== "string") {
    return null
  }

  const normalizedValue = rawValue.trim()

  return normalizedValue.length > 0 ? normalizedValue : null
}

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

async function appendDeliveryWorkspaceActivity(input: {
  exportId: string | null
  metadata: Record<string, unknown>
  ownerId: string
  projectId: string
  workspaceId: string
}) {
  await recordDeliveryWorkspaceEvent({
    actorLabel: "Support operator",
    eventType: "viewed",
    exportId: input.exportId,
    metadata: input.metadata,
    ownerId: input.ownerId,
    projectId: input.projectId,
    workspaceId: input.workspaceId
  })
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
  const followUpNote = readFollowUpNote(formData)

  if (validateModestText(followUpNote)) {
    redirect(`/dashboard/delivery?error=${encodeURIComponent(MODEST_WORDING_FORM_ERROR_CODE)}`)
  }

  const updatedWorkspace = await updateDeliveryWorkspaceFollowUp({
    followUpDueOn,
    followUpNote,
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

export async function repairDeliveryWorkspaceReminderFromSupport(
  formData: FormData
) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const workspaceId = getOptionalTrimmedFormValue(formData, "workspaceId")
  const returnToHref =
    getOptionalTrimmedFormValue(formData, "returnToHref") ??
    "/dashboard/delivery"
  const currentFollowUpNote = getOptionalTrimmedFormValue(
    formData,
    "currentFollowUpNote"
  )
  const reminderRepairAction = normalizeDeliveryReminderRepairAction(
    formData.get(deliveryReminderRepairActionFieldName)
  )
  const focusedReminderBucket = normalizeReminderBucketForRepairActivity(
    formData.get("focusedReminderBucket")
  )
  const focusedReminderNotificationId =
    normalizeReminderNotificationIdForRepairActivity(
      formData.get("focusedReminderNotificationId")
    )
  const clearReminderReason = normalizeDeliveryReminderClearReason(
    formData.get(deliveryReminderClearReasonFieldName)
  )

  if (!workspaceId) {
    throw new Error("workspaceId is required")
  }

  if (!reminderRepairAction) {
    throw new Error("A valid reminder repair action is required")
  }

  const workspace = await getDeliveryWorkspaceByIdForOwner(workspaceId, user.id)

  if (!workspace) {
    throw new Error("Delivery workspace not found")
  }

  const workspaceBefore = await getDeliveryWorkspaceFollowUpSnapshotById(workspaceId)
  const repairValues = buildDeliveryReminderRepairValues({
    action: reminderRepairAction
  })

  if (validateModestText(currentFollowUpNote)) {
    redirect(
      buildDeliveryReminderRepairResultHref({
        action: reminderRepairAction,
        baseHref: returnToHref,
        errorCode: "disallowed_wording",
        notificationId: focusedReminderNotificationId,
        status: "error",
        workspaceId
      })
    )
  }

  if (reminderRepairAction === "clear_reminder_scheduling") {
    const clearReasonValidationError =
      validateDeliveryReminderClearReason(clearReminderReason)

    if (clearReasonValidationError) {
      try {
        await recordDeliveryWorkspaceEvent({
          workspaceId: workspace.id,
          ownerId: user.id,
          projectId: workspace.project_id,
          exportId: workspace.canonical_export_id,
          eventType: "viewed",
          actorLabel: "Support operator",
          metadata: buildDeliveryReminderRepairActivityMetadata({
            clearReminderReason,
            errorCode: clearReasonValidationError,
            nextFollowUpDueOn: workspaceBefore.follow_up_due_on,
            nextFollowUpStatus: workspaceBefore.follow_up_status,
            previousFollowUpDueOn: workspaceBefore.follow_up_due_on,
            previousFollowUpStatus: workspaceBefore.follow_up_status,
            reminderBucket: focusedReminderBucket,
            reminderNotificationId: focusedReminderNotificationId,
            repairAction: reminderRepairAction,
            repairOutcome: "error"
          })
        })

        revalidatePath("/dashboard/delivery")
      } catch (error) {
        console.error("Failed to append delivery reminder validation activity", error)
      }

      redirect(
        buildDeliveryReminderRepairResultHref({
          action: reminderRepairAction,
          baseHref: returnToHref,
          errorCode: clearReasonValidationError,
          notificationId: focusedReminderNotificationId,
          status: "error",
          workspaceId
        })
      )
    }
  }

  let outcomeStatus: "error" | "success" = "success"

  try {
    await updateDeliveryWorkspaceFollowUp({
      followUpDueOn: repairValues.followUpDueOn,
      followUpNote: currentFollowUpNote,
      followUpStatus: repairValues.followUpStatus,
      ownerId: user.id,
      workspaceId: workspace.id
    })
  } catch {
    outcomeStatus = "error"
  }

  try {
    await recordDeliveryWorkspaceEvent({
      workspaceId: workspace.id,
      ownerId: user.id,
      projectId: workspace.project_id,
      exportId: workspace.canonical_export_id,
      eventType: "viewed",
      actorLabel: "Support operator",
      metadata: buildDeliveryReminderRepairActivityMetadata({
        clearReminderReason:
          reminderRepairAction === "clear_reminder_scheduling"
            ? clearReminderReason
            : null,
        errorCode: null,
        nextFollowUpDueOn:
          outcomeStatus === "success"
            ? repairValues.followUpDueOn
            : workspaceBefore.follow_up_due_on,
        nextFollowUpStatus:
          outcomeStatus === "success"
            ? repairValues.followUpStatus
            : workspaceBefore.follow_up_status,
        previousFollowUpDueOn: workspaceBefore.follow_up_due_on,
        previousFollowUpStatus: workspaceBefore.follow_up_status,
        reminderBucket: focusedReminderBucket,
        reminderNotificationId: focusedReminderNotificationId,
        repairAction: reminderRepairAction,
        repairOutcome: outcomeStatus
      })
    })

    revalidatePath("/dashboard/delivery")
  } catch (error) {
    console.error("Failed to append delivery reminder repair activity", error)
  }

  if (outcomeStatus === "success") {
    revalidatePath("/dashboard/delivery")
  }

  redirect(
    buildDeliveryReminderRepairResultHref({
      action: reminderRepairAction,
      baseHref: returnToHref,
      notificationId: focusedReminderNotificationId,
      status: outcomeStatus,
      workspaceId
    })
  )
}


export async function resolveDeliveryWorkspaceReminderMismatchFromSupport(
  formData: FormData
) {
  "use server"

  const workspaceId = getOptionalTrimmedFormValue(formData, "workspaceId")
  const reminderNotificationId = getOptionalTrimmedFormValue(
    formData,
    "focusedReminderNotificationId"
  )
  const returnToHref =
    getOptionalTrimmedFormValue(formData, "returnToHref") ??
    "/dashboard/delivery"
  const reminderBucket = normalizeReminderBucketForRepairActivity(
    formData.get("focusedReminderBucket")
  )
  const resolutionNote = normalizeDeliveryReminderMismatchResolutionNote(
    formData.get(deliveryReminderMismatchResolutionNoteFieldName)
  )

  if (!workspaceId) {
    throw new Error("workspaceId is required")
  }

  if (!reminderNotificationId) {
    throw new Error("focusedReminderNotificationId is required")
  }

  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const workspace = await getDeliveryWorkspaceByIdForOwner(workspaceId, user.id)

  if (!workspace) {
    throw new Error("Delivery workspace not found")
  }

  const resolutionNoteError =
    validateDeliveryReminderMismatchResolutionNote(resolutionNote)

  if (resolutionNoteError) {
    redirect(
      buildDeliveryReminderMismatchOutcomeHref({
        action: "resolved",
        baseHref: returnToHref,
        errorCode: resolutionNoteError,
        notificationId: reminderNotificationId,
        status: "error",
        workspaceId
      })
    )
  }

  await resolveDeliveryWorkspaceReminderMismatch({
    reminderNotificationId,
    resolutionNote,
    workspaceId
  })

  try {
    await appendDeliveryWorkspaceActivity({
      exportId: workspace.canonical_export_id,
      metadata: buildDeliveryReminderMismatchResolutionActivityMetadata({
        reminderBucket,
        reminderNotificationId,
        resolutionNote
      }),
      ownerId: user.id,
      projectId: workspace.project_id,
      workspaceId: workspace.id
    })
  } catch (error) {
    console.error(
      "Failed to append delivery reminder mismatch resolution activity",
      error
    )
  }

  revalidatePath("/dashboard/delivery")

  redirect(
    buildDeliveryReminderMismatchOutcomeHref({
      action: "resolved",
      baseHref: returnToHref,
      notificationId: reminderNotificationId,
      status: "success",
      workspaceId
    })
  )
}

export async function reopenDeliveryWorkspaceReminderMismatchFromSupport(
  formData: FormData
) {
  "use server"

  const workspaceId = getOptionalTrimmedFormValue(formData, "workspaceId")
  const reminderNotificationId = getOptionalTrimmedFormValue(
    formData,
    "focusedReminderNotificationId"
  )
  const returnToHref =
    getOptionalTrimmedFormValue(formData, "returnToHref") ??
    "/dashboard/delivery"
  const reminderBucket = normalizeReminderBucketForRepairActivity(
    formData.get("focusedReminderBucket")
  )
  const reopenNote = normalizeDeliveryReminderMismatchReopenNote(
    formData.get(deliveryReminderMismatchReopenNoteFieldName)
  )

  if (!workspaceId) {
    throw new Error("workspaceId is required")
  }

  if (!reminderNotificationId) {
    throw new Error("focusedReminderNotificationId is required")
  }

  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const workspace = await getDeliveryWorkspaceByIdForOwner(workspaceId, user.id)

  if (!workspace) {
    throw new Error("Delivery workspace not found")
  }

  const reopenNoteError =
    validateDeliveryReminderMismatchReopenNote(reopenNote)

  if (reopenNoteError) {
    try {
      await appendDeliveryWorkspaceActivity({
        exportId: workspace.canonical_export_id,
        metadata: buildDeliveryReminderMismatchReopenActivityMetadata({
          errorCode: reopenNoteError,
          reminderBucket,
          reminderNotificationId,
          reopenNote,
          reopenOutcome: "error"
        }),
        ownerId: user.id,
        projectId: workspace.project_id,
        workspaceId: workspace.id
      })
    } catch (error) {
      console.error(
        "Failed to append delivery reminder mismatch reopen validation activity",
        error
      )
    }

    revalidatePath("/dashboard/delivery")

    redirect(
      buildDeliveryReminderMismatchOutcomeHref({
        action: "reopened",
        baseHref: returnToHref,
        errorCode: reopenNoteError,
        notificationId: reminderNotificationId,
        status: "error",
        workspaceId
      })
    )
  }

  try {
    await reopenDeliveryWorkspaceReminderMismatch({
      reminderNotificationId,
      workspaceId
    })
  } catch (error) {
    console.error("Failed to reopen delivery reminder mismatch", error)

    try {
      await appendDeliveryWorkspaceActivity({
        exportId: workspace.canonical_export_id,
        metadata: buildDeliveryReminderMismatchReopenActivityMetadata({
          errorCode: "not_currently_resolved",
          reminderBucket,
          reminderNotificationId,
          reopenNote,
          reopenOutcome: "error"
        }),
        ownerId: user.id,
        projectId: workspace.project_id,
        workspaceId: workspace.id
      })
    } catch (activityError) {
      console.error(
        "Failed to append delivery reminder mismatch reopen failure activity",
        activityError
      )
    }

    revalidatePath("/dashboard/delivery")

    redirect(
      buildDeliveryReminderMismatchOutcomeHref({
        action: "reopened",
        baseHref: returnToHref,
        errorCode: "not_currently_resolved",
        notificationId: reminderNotificationId,
        status: "error",
        workspaceId
      })
    )
  }

  try {
    await appendDeliveryWorkspaceActivity({
      exportId: workspace.canonical_export_id,
      metadata: buildDeliveryReminderMismatchReopenActivityMetadata({
        errorCode: null,
        reminderBucket,
        reminderNotificationId,
        reopenNote,
        reopenOutcome: "success"
      }),
      ownerId: user.id,
      projectId: workspace.project_id,
      workspaceId: workspace.id
    })
  } catch (error) {
    console.error(
      "Failed to append delivery reminder mismatch reopen activity",
      error
    )
  }

  revalidatePath("/dashboard/delivery")

  redirect(
    buildDeliveryReminderMismatchOutcomeHref({
      action: "reopened",
      baseHref: returnToHref,
      notificationId: reminderNotificationId,
      status: "success",
      workspaceId
    })
  )
}
