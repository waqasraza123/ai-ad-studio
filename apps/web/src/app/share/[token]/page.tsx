import { notFound } from "next/navigation"
import { PublicPageHeader } from "@/components/i18n/public-page-header"
import { PublicPageFrame } from "@/components/layout/page-frame"
import { ExportSummary } from "@/features/exports/components/export-summary"
import { getServerI18n } from "@/lib/i18n/server"
import { getSharedExportBundleByToken } from "@/server/exports/share-link-repository"

type PublicSharePageProps = {
  params: Promise<{
    token: string
  }>
}

export default async function PublicSharePage({
  params
}: PublicSharePageProps) {
  const { formatDateTime, t } = await getServerI18n()
  const { token } = await params
  const bundle = await getSharedExportBundleByToken(token)

  if (!bundle) {
    notFound()
  }

  const { asset, exportRecord, project } = bundle

  const previewDataUrl =
    asset && typeof asset.metadata.previewDataUrl === "string"
      ? asset.metadata.previewDataUrl
      : null

  const videoSrc =
    asset?.mime_type === "video/mp4"
      ? `/share/${token}/download`
      : null

  return (
    <main className="theme-page-shell min-h-screen text-[var(--foreground)]">
      <PublicPageHeader />
      <PublicPageFrame variant="readable" className="space-y-6">
        <section className="theme-surface-card rounded-[1.75rem] border p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
            {t("public.share.eyebrow")}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            {project.name}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
            {t("public.share.description")}
          </p>
        </section>

        <ExportSummary
          createdAtLabel={formatDateTime(exportRecord.created_at, {
            dateStyle: "medium",
            timeStyle: "short"
          })}
          downloadHref={videoSrc}
          projectName={project.name}
          previewDataUrl={previewDataUrl}
          status={exportRecord.status}
          videoSrc={videoSrc}
        />
      </PublicPageFrame>
    </main>
  )
}
