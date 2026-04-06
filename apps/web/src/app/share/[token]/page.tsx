import { notFound } from "next/navigation"
import { ExportSummary } from "@/features/exports/components/export-summary"
import { getSharedExportBundleByToken } from "@/server/exports/share-link-repository"

type PublicSharePageProps = {
  params: Promise<{
    token: string
  }>
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

export default async function PublicSharePage({
  params
}: PublicSharePageProps) {
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
    <main className="theme-page-shell min-h-screen px-4 py-10 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="theme-surface-card rounded-[1.75rem] border p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
            Shared export
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            {project.name}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
            This is an owner-controlled single-export share link. It is separate from winner-only campaign pages and finalized delivery workspaces.
          </p>
        </section>

        <ExportSummary
          createdAtLabel={formatTimestamp(exportRecord.created_at)}
          downloadHref={videoSrc}
          projectName={project.name}
          previewDataUrl={previewDataUrl}
          status={exportRecord.status}
          videoSrc={videoSrc}
        />
      </div>
    </main>
  )
}
