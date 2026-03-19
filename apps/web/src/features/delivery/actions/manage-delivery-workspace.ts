"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getPublicEnvironment } from "@/lib/env"
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
  replaceDeliveryWorkspaceExports,
  upsertDeliveryWorkspace
} from "@/server/delivery-workspaces/delivery-workspace-repository"
import type {
  DeliveryApprovalSummary,
  ExportRecord
} from "@/server/database/types"

function readValue(formData: FormData, key: string, fallback = "") {
  return String(formData.get(key) ?? "").trim() || fallback
}

function readSelectedExportIds(formData: FormData) {
  return [...new Set(formData.getAll("export_ids").map((value) => String(value).trim()).filter(Boolean))]
}

function buildApprovalSummary(input: {
  batchFinalizationNote: string | null
  batchReviewLinks: Array<{ response_status: string; status: string }>
  batchReviewNote: string | null
  decidedAt: string | null
  finalizedAt: string | null
}): DeliveryApprovalSummary {
  const approvedCount = input.batchReviewLinks.filter(
    (link) => link.response_status === "approved"
  ).length
  const rejectedCount = input.batchReviewLinks.filter(
    (link) => link.response_status === "rejected"
  ).length
  const pendingCount = input.batchReviewLinks.filter(
    (link) => link.response_status === "pending" && link.status === "active"
  ).length

  return {
    approved_count: approvedCount,
    decided_at: input.decidedAt,
    finalization_note: input.batchFinalizationNote,
    finalized_at: input.finalizedAt,
    pending_count: pendingCount,
    rejected_count: rejectedCount,
    responded_count: approvedCount + rejectedCount,
    review_note: input.batchReviewNote
  }
}

export async function upsertDeliveryWorkspaceAction(
  exportId: string,
  formData: FormData
) {
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
  const validBatchExportsById = new Map(batchExports.map((item) => [item.id, item]))

  const selectedExports = selectedExportIds
    .map((id) => validBatchExportsById.get(id) ?? null)
    .filter((item): item is ExportRecord => Boolean(item))

  const includedExportsById = new Map<string, ExportRecord>()

  includedExportsById.set(exportRecord.id, exportRecord)

  for (const selectedExport of selectedExports) {
    includedExportsById.set(selectedExport.id, selectedExport)
  }

  const approvalSummary = buildApprovalSummary({
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
    exportRecords: [...includedExportsById.values()],
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
      includedExportIds: [...includedExportsById.keys()]
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
