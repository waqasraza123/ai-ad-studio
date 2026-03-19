"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getExportByIdForOwner } from "@/server/exports/export-repository"
import { getProjectByIdForOwner } from "@/server/projects/project-repository"
import { getPromotionEligibilityForExport } from "@/server/promotion/promotion-eligibility"
import {
  archiveShareCampaign,
  getShareCampaignByExportIdForOwner,
  upsertShareCampaign
} from "@/server/share-campaigns/share-campaign-repository"

function readValue(formData: FormData, key: string, fallback: string) {
  const value = String(formData.get(key) ?? "").trim()
  return value.length > 0 ? value : fallback
}

export async function publishShareCampaignAction(exportId: string, formData: FormData) {
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

  const project = await getProjectByIdForOwner(exportRecord.project_id, user.id)

  if (!project) {
    throw new Error("Project not found")
  }

  const campaign = await upsertShareCampaign({
    exportId,
    message: readValue(formData, "message", "Reviewed winner selected from a controlled variation batch."),
    ownerId: user.id,
    projectId: project.id,
    renderBatchId: eligibility.batchId,
    title: readValue(formData, "title", `${project.name} campaign`)
  })

  const supabase = await createSupabaseServerClient()

  await supabase.from("job_traces").insert({
    job_id: eligibility.jobId,
    owner_id: user.id,
    payload: {
      campaignId: campaign.id,
      exportId,
      renderBatchId: eligibility.batchId
    },
    project_id: eligibility.projectId,
    stage: "winner_promoted_to_share_campaign",
    trace_type: "promotion"
  })

  await supabase.from("notifications").insert({
    action_url: `/dashboard/campaigns`,
    body: "A reviewed winner has been promoted to a public share campaign.",
    export_id: exportId,
    job_id: eligibility.jobId,
    kind: "winner_promoted_to_share_campaign",
    metadata: {
      batchId: eligibility.batchId,
      campaignId: campaign.id
    },
    owner_id: user.id,
    project_id: eligibility.projectId,
    severity: "success",
    title: "Winner promoted to share campaign"
  })

  revalidatePath("/dashboard/campaigns")
  revalidatePath(`/dashboard/exports/${exportId}`)
  revalidatePath(`/campaign/${campaign.token}`)
}

export async function archiveShareCampaignAction(exportId: string) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const campaign = await getShareCampaignByExportIdForOwner(exportId, user.id)

  if (!campaign) {
    throw new Error("Share campaign not found")
  }

  await archiveShareCampaign({
    campaignId: campaign.id,
    ownerId: user.id
  })

  revalidatePath("/dashboard/campaigns")
  revalidatePath(`/dashboard/exports/${exportId}`)
  revalidatePath(`/campaign/${campaign.token}`)
}
