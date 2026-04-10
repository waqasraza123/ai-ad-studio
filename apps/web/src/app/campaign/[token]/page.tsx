import { notFound } from "next/navigation"
import { PublicPageHeader } from "@/components/i18n/public-page-header"
import { PublicPageFrame } from "@/components/layout/page-frame"
import { getServerI18n } from "@/lib/i18n/server"
import { getPublicShareCampaignBundleByToken } from "@/server/share-campaigns/public-share-campaign"

type PublicCampaignPageProps = {
  params: Promise<{
    token: string
  }>
}

export default async function PublicCampaignPage({
  params
}: PublicCampaignPageProps) {
  const { t } = await getServerI18n()
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
    <main className="theme-page-shell min-h-screen text-[var(--foreground)]">
      <PublicPageHeader />
      <PublicPageFrame variant="readable" className="space-y-6">
        <section className="theme-surface-card rounded-[2rem] border p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
            {t("public.campaign.eyebrow")}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            {campaign.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted-foreground)]">
            {campaign.message}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="theme-soft-panel rounded-full border px-3 py-1 text-xs text-[var(--soft-foreground)]">
              {exportRecord.variant_key}
            </span>
            <span className="theme-soft-panel rounded-full border px-3 py-1 text-xs text-[var(--soft-foreground)]">
              {exportRecord.aspect_ratio}
            </span>
            <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">
              {exportRecord.platform_preset}
            </span>
          </div>
        </section>

        <section className="theme-surface-card overflow-hidden rounded-[2rem] border p-4">
          {videoSrc ? (
            <video
              className="h-auto w-full rounded-[1.5rem] object-cover"
              controls
              playsInline
              poster={previewDataUrl ?? undefined}
              preload="none"
              src={videoSrc}
            />
          ) : previewDataUrl ? (
            <img
              alt={campaign.title}
              className="h-auto w-full rounded-[1.5rem] object-cover"
              decoding="async"
              loading="lazy"
              src={previewDataUrl}
            />
          ) : (
            <div className="theme-soft-panel flex h-96 items-center justify-center rounded-[1.5rem] border text-sm text-[var(--muted-foreground)]">
              {t("public.showcase.previewUnavailable")}
            </div>
          )}
        </section>
      </PublicPageFrame>
    </main>
  )
}
