import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { AssetRecord, ExportRecord } from "@/server/database/types"
import { getActiveShareCampaignByToken } from "@/server/share-campaigns/share-campaign-repository"

const exportSelection =
  "id, project_id, concept_id, owner_id, asset_id, status, version, variant_key, aspect_ratio, platform_preset, render_metadata, created_at, updated_at"

const assetSelection =
  "id, project_id, owner_id, kind, storage_key, mime_type, width, height, duration_ms, metadata, created_at"

export async function getPublicShareCampaignBundleByToken(token: string) {
  const campaign = await getActiveShareCampaignByToken(token)

  if (!campaign) {
    return null
  }

  const supabase = await createSupabaseServerClient()

  const { data: exportRecord, error: exportError } = await supabase
    .from("exports")
    .select(exportSelection)
    .eq("id", campaign.export_id)
    .maybeSingle()

  if (exportError) {
    throw new Error("Failed to load promoted export")
  }

  if (!exportRecord) {
    return null
  }

  const { data: asset, error: assetError } = exportRecord.asset_id
    ? await supabase
        .from("assets")
        .select(assetSelection)
        .eq("id", exportRecord.asset_id)
        .maybeSingle()
    : { data: null, error: null }

  if (assetError) {
    throw new Error("Failed to load promoted asset")
  }

  return {
    asset: (asset ?? null) as AssetRecord | null,
    campaign,
    exportRecord: exportRecord as ExportRecord
  }
}
