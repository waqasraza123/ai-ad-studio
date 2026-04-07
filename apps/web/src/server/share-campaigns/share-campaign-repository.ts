import "server-only"
import { randomBytes } from "node:crypto"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { hasPublicFeatureAccess } from "@/server/billing/billing-service"
import type { ShareCampaignRecord } from "@/server/database/types"

const shareCampaignSelection =
  "id, owner_id, project_id, render_batch_id, export_id, title, message, token, status, created_at, updated_at"

function generateCampaignToken() {
  return randomBytes(18).toString("hex")
}

export async function listShareCampaignsByOwner(ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("share_campaigns")
    .select(shareCampaignSelection)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list share campaigns")
  }

  return (data ?? []) as ShareCampaignRecord[]
}

export async function getShareCampaignByExportIdForOwner(
  exportId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("share_campaigns")
    .select(shareCampaignSelection)
    .eq("export_id", exportId)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load share campaign")
  }

  return (data ?? null) as ShareCampaignRecord | null
}

export async function getActiveShareCampaignByToken(token: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("share_campaigns")
    .select(shareCampaignSelection)
    .eq("token", token)
    .eq("status", "active")
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load public share campaign")
  }

  const campaign = (data ?? null) as ShareCampaignRecord | null

  if (!campaign) {
    return null
  }

  const allowed = await hasPublicFeatureAccess(
    campaign.owner_id,
    "allowShareCampaigns",
    campaign.created_at,
    createSupabaseAdminClient()
  )

  return allowed ? campaign : null
}

export async function upsertShareCampaign(input: {
  ownerId: string
  projectId: string
  renderBatchId: string
  exportId: string
  title: string
  message: string
}) {
  const supabase = await createSupabaseServerClient()

  const existing = await getShareCampaignByExportIdForOwner(
    input.exportId,
    input.ownerId
  )

  if (existing) {
    const { data, error } = await supabase
      .from("share_campaigns")
      .update({
        message: input.message,
        render_batch_id: input.renderBatchId,
        status: "active",
        title: input.title,
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id)
      .eq("owner_id", input.ownerId)
      .select(shareCampaignSelection)
      .single()

    if (error) {
      throw new Error("Failed to update share campaign")
    }

    return data as ShareCampaignRecord
  }

  const { data, error } = await supabase
    .from("share_campaigns")
    .insert({
      export_id: input.exportId,
      message: input.message,
      owner_id: input.ownerId,
      project_id: input.projectId,
      render_batch_id: input.renderBatchId,
      status: "active",
      title: input.title,
      token: generateCampaignToken()
    })
    .select(shareCampaignSelection)
    .single()

  if (error) {
    throw new Error("Failed to create share campaign")
  }

  return data as ShareCampaignRecord
}

export async function archiveShareCampaign(input: {
  campaignId: string
  ownerId: string
}) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("share_campaigns")
    .update({
      status: "archived",
      updated_at: new Date().toISOString()
    })
    .eq("id", input.campaignId)
    .eq("owner_id", input.ownerId)
    .select(shareCampaignSelection)
    .single()

  if (error) {
    throw new Error("Failed to archive share campaign")
  }

  return data as ShareCampaignRecord
}
