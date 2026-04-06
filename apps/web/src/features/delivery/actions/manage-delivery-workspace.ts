"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getPublicEnvironment } from "@/lib/env"
import { MODEST_WORDING_FORM_ERROR_CODE, validateRecordTextFields } from "@/lib/modest-wording/index"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  listBatchReviewLinksByBatchIdForOwner
} from "@/server/batch-reviews/batch-review-repository"
import { getExportByIdForOwner, listExportsByProjectIdForOwner } from "@/server/exports/export-repository"
import { getProjectByIdForOwner } from "@/server/projects/project-repository"
import { getPromotionEligibilityForExport } from "@/server/promotion/promotion-eligibility"
import {
  getRenderBatchByIdForOwner,
  listExportsForRenderBatch
} from "@/server/render-batches/render-batch-repository"
import {
  archiveDeliveryWorkspace,
  getDeliveryWorkspaceByCanonicalExportIdForOwner,
  recordDeliveryWorkspaceEvent,
  replaceDeliveryWorkspaceExports,
  upsertDeliveryWorkspace
} from "@/server/delivery-workspaces/delivery-workspace-repository"
import {
  buildDeliveryApprovalSummary,
  resolveDeliveryWorkspaceExports
} from "@/features/delivery/lib/delivery-workspace-rules"

function readValue(formData: FormData, key: string, fallback = "") {
  return String(formData.get(key) ?? "").trim() || fallback
}

function readSelectedExportIds(formData: FormData) {
  return [...new Set(formData.getAll("export_ids").map((value) => String(value).trim()).filter(Boolean))]
}

export async function upsertDeliveryWorkspaceAction(
  exportId: string,
  formData: FormData
) {
  const path = `/dashboard/exports/${exportId}`
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const exportRecord = await getExportByIdForOwner(exportId, user.id)

  if (!exportRecord) {
    throw new Error("Export not found")
  }

  const eligibility = await getPromotionEligibilityForExport({
    exportRecord,
    ownerId: user.id
  })

  if (!eligibility.eligible) {
    throw new Error(eligibility.reason)
  }

  const [project, batch, projectExports, batchReviewLinks] = await Promise.all([
    getProjectByIdForOwner(exportRecord.project_id, user.id),
    getRenderBatchByIdForOwner(eligibility.batchId, user.id),
    listExportsByProjectIdForOwner(exportRecord.project_id, user.id),
    listBatchReviewLinksByBatchIdForOwner(eligibility.batchId, user.id)
  ])

  if (!project || !batch) {
    throw new Error("Required delivery context was not found")
  }

  const batchExports = await listExportsForRenderBatch({
    batchId: batch.id,
    exports: projectExports
  })

  const selectedExportIds = readSelectedExportIds(formData)
  const resolvedWorkspaceExports = resolveDeliveryWorkspaceExports({
    batchExports,
    canonicalExport: exportRecord,
    selectedExportIds
  })

  const approvalSummary = buildDeliveryApprovalSummary({
    batchFinalizationNote: batch.finalization_note,
    batchReviewLinks,
    batchReviewNote: batch.review_note,
    decidedAt: batch.decided_at,
    finalizedAt: batch.finalized_at
  })

  const title = readValue(formData, "title", `${project.name} delivery`)
  const summary = readValue(
    formData,
    "summary",
    "Final reviewed deliverables prepared from the canonical export."
  )
  const handoffNotes = readValue(
    formData,
    "handoff_notes",
    "Please review the included deliverables and handoff notes."
  )

  if (validateRecordTextFields({ handoffNotes, summary, title })) {
    redirect(`${path}?error=${encodeURIComponent(MODEST_WORDING_FORM_ERROR_CODE)}`)
  }

  const workspace = await upsertDeliveryWorkspace({
    approvalSummary,
    canonicalExportId: exportRecord.id,
    handoffNotes,
    ownerId: user.id,
    projectId: project.id,
    renderBatchId: batch.id,
    summary,
    title
  })

  await replaceDeliveryWorkspaceExports({
    exportRecords: resolvedWorkspaceExports,
    ownerId: user.id,
    projectId: project.id,
    workspaceId: workspace.id
  })

  await recordDeliveryWorkspaceEvent({
    actorLabel: null,
    eventType: "delivered",
    exportId: exportRecord.id,
    metadata: {
      includedExportIds: resolvedWorkspaceExports.map(
        (workspaceExport) => workspaceExport.id
      )
    },
    ownerId: user.id,
    projectId: project.id,
    workspaceId: workspace.id
  })

  const supabase = await createSupabaseServerClient()

  await supabase.from("job_traces").insert({
    job_id: batch.job_id,
    owner_id: user.id,
    payload: {
      canonicalExportId: exportRecord.id,
      deliveryWorkspaceId: workspace.id,
      includedExportIds: resolvedWorkspaceExports.map(
        (workspaceExport) => workspaceExport.id
      )
    },
    project_id: project.id,
    stage: "delivery_workspace_published",
    trace_type: "delivery"
  })

  await supabase.from("notifications").insert({
    action_url: `/delivery/${workspace.token}`,
    body: "A client delivery workspace is now active for the canonical export.",
    export_id: exportRecord.id,
    job_id: batch.job_id,
    kind: "delivery_workspace_published",
    metadata: {
      deliveryWorkspaceId: workspace.id
    },
    owner_id: user.id,
    project_id: project.id,
    severity: "success",
    title: "Delivery workspace published"
  })

  revalidatePath(`/dashboard/exports/${exportId}`)
  revalidatePath("/dashboard/delivery")
  revalidatePath(`/delivery/${workspace.token}`)
}

export async function archiveDeliveryWorkspaceAction(exportId: string) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const exportRecord = await getExportByIdForOwner(exportId, user.id)

  if (!exportRecord) {
    throw new Error("Export not found")
  }

  const workspace = await getDeliveryWorkspaceByCanonicalExportIdForOwner(
    exportId,
    user.id
  )

  if (!workspace) {
    throw new Error("Delivery workspace not found")
  }

  const batch = await getRenderBatchByIdForOwner(workspace.render_batch_id, user.id)

  if (!batch) {
    throw new Error("Render batch not found")
  }

  await archiveDeliveryWorkspace({
    ownerId: user.id,
    workspaceId: workspace.id
  })

  const supabase = await createSupabaseServerClient()

  await supabase.from("job_traces").insert({
    job_id: batch.job_id,
    owner_id: user.id,
    payload: {
      canonicalExportId: exportRecord.id,
      deliveryWorkspaceId: workspace.id
    },
    project_id: workspace.project_id,
    stage: "delivery_workspace_archived",
    trace_type: "delivery"
  })

  await supabase.from("notifications").insert({
    action_url: `/dashboard/exports/${exportId}`,
    body: "The client delivery workspace was archived.",
    export_id: exportId,
    job_id: batch.job_id,
    kind: "delivery_workspace_archived",
    metadata: {
      deliveryWorkspaceId: workspace.id
    },
    owner_id: user.id,
    project_id: workspace.project_id,
    severity: "warning",
    title: "Delivery workspace archived"
  })

  revalidatePath(`/dashboard/exports/${exportId}`)
  revalidatePath("/dashboard/delivery")
  revalidatePath(`/delivery/${workspace.token}`)
}

export async function getDeliveryWorkspacePublicUrl(token: string) {
  const environment = getPublicEnvironment()
  return `${environment.NEXT_PUBLIC_APP_URL}/delivery/${token}`
}
