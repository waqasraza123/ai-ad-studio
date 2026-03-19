import { notFound } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  AssetRecord,
  ExportRecord
} from "@/server/database/types"
import { getActiveShareCampaignByToken } from "@/server/share-campaigns/share-campaign-repository"

type PublicCampaignPageProps = {
  params: Promise<{
    token: string
  }>
}

async function loadPromotedExport(exportId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("exports")
    .select("id, project_id, concept_id, owner_id, asset_id, status, version, variant_key, aspect_ratio, platform_preset, render_metadata, created_at, updated_at")
    .eq("id", exportId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load promoted export")
  }

  return (data ?? null) as ExportRecord | null
}

async function loadPromotedAsset(assetId: string | null) {
  if (!assetId) {
    return null
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("assets")
    .select("id, project_id, owner_id, kind, storage_key, mime_type, width, height, duration_ms, metadata, created_at")
    .eq("id", assetId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load promoted asset")
  }

  return (data ?? null) as AssetRecord | null
}

export default async function PublicCampaignPage({
  params
}: PublicCampaignPageProps) {
  const { token } = await params

  const campaign = await getActiveShareCampaignByToken(token)

  if (!campaign) {
    notFound()
  }

  const exportRecord = await loadPromotedExport(campaign.export_id)

  if (!exportRecord) {
    notFound()
  }

  const asset = await loadPromotedAsset(exportRecord.asset_id)
  const previewDataUrl =
    asset && typeof asset.metadata.previewDataUrl === "string"
      ? asset.metadata.previewDataUrl
      : null
  const videoSrc =
    asset?.mime_type === "video/mp4"
      ? `/api/exports/${exportRecord.id}/download`
      : null

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_24rem),linear-gradient(180deg,#050816_0%,#0f172a_100%)] px-4 py-10 text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Public campaign
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
            {campaign.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            {campaign.message}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
              {exportRecord.variant_key}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
              {exportRecord.aspect_ratio}
            </span>
            <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">
              {exportRecord.platform_preset}
            </span>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
          {videoSrc ? (
            <video
              className="h-auto w-full rounded-[1.5rem] object-cover"
              controls
              playsInline
              poster={previewDataUrl ?? undefined}
              src={videoSrc}
            />
          ) : previewDataUrl ? (
            <img
              alt={campaign.title}
              className="h-auto w-full rounded-[1.5rem] object-cover"
              src={previewDataUrl}
            />
          ) : (
            <div className="flex h-96 items-center justify-center rounded-[1.5rem] bg-white/[0.04] text-sm text-slate-400">
              Preview unavailable
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
