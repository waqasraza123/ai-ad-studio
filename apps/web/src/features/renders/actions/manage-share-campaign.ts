"use server"

import { revalidatePath } from "next/cache"
import { MODEST_WORDING_FORM_ERROR_CODE, validateModestText } from "@/lib/modest-wording/index"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirectToLoginWithFormError, redirectWithFormError } from "@/lib/server-action-redirect"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getBillingGateDecision } from "@/server/billing/billing-service"
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

function exportPath(exportId: string) {
  return `/dashboard/exports/${exportId}`
}

export async function publishShareCampaignAction(exportId: string, formData: FormData) {
  const path = exportPath(exportId)
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  const exportRecord = await getExportByIdForOwner(exportId, user.id)

  if (!exportRecord) {
    redirectWithFormError(path, "export_not_found")
  }

  const eligibility = await getPromotionEligibilityForExport({
    exportRecord,
    ownerId: user.id
  })

  if (!eligibility.eligible) {
    redirectWithFormError(path, "promotion_ineligible")
  }

  const project = await getProjectByIdForOwner(exportRecord.project_id, user.id)

  if (!project) {
    redirectWithFormError(path, "project_not_found")
  }

  const billingDecision = await getBillingGateDecision(
    user.id,
    "publish_share_campaign"
  )

  if (!billingDecision.allowed) {
    redirectWithFormError(path, billingDecision.code ?? "server_error")
  }

  let campaignToken: string | null = null
  const message = readValue(
    formData,
    "message",
    "Reviewed winner selected from a controlled variation batch."
  )
  const title = readValue(formData, "title", `${project.name} campaign`)

  if (validateModestText(message) || validateModestText(title)) {
    redirectWithFormError(path, MODEST_WORDING_FORM_ERROR_CODE)
  }

  try {
    const campaign = await upsertShareCampaign({
      exportId,
      message,
      ownerId: user.id,
      projectId: project.id,
      renderBatchId: eligibility.batchId,
      title
    })

    campaignToken = campaign.token

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
  } catch {
    redirectWithFormError(path, "server_error")
  }

  revalidatePath("/dashboard/campaigns")
  revalidatePath(path)
  if (campaignToken) {
    revalidatePath(`/campaign/${campaignToken}`)
  }
}

export async function archiveShareCampaignAction(exportId: string) {
  const path = exportPath(exportId)
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  const campaign = await getShareCampaignByExportIdForOwner(exportId, user.id)

  if (!campaign) {
    redirectWithFormError(path, "campaign_not_found")
  }

  try {
    await archiveShareCampaign({
      campaignId: campaign.id,
      ownerId: user.id
    })
  } catch {
    redirectWithFormError(path, "server_error")
  }

  revalidatePath("/dashboard/campaigns")
  revalidatePath(path)
  revalidatePath(`/campaign/${campaign.token}`)
}
