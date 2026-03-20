import { notFound } from "next/navigation"
import { getPublicShareCampaignBundleByToken } from "@/server/share-campaigns/public-share-campaign"

type PublicCampaignPageProps = {
  params: Promise<{
    token: string
  }>
}

export default async function PublicCampaignPage({
  params
}: PublicCampaignPageProps) {
  const { token } = await params
  const bundle = await getPublicShareCampaignBundleByToken(token)

  if (!bundle) {
    notFound()
  }

  const { asset, campaign, exportRecord } = bundle
  const previewDataUrl =
    asset && typeof asset.metadata.previewDataUrl === "string"
      ? asset.metadata.previewDataUrl
      : null
  const videoSrc =
    asset?.mime_type === "video/mp4"
      ? `/campaign/${token}/download`
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
