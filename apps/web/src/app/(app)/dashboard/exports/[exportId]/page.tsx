import { notFound } from "next/navigation"
import { ExportSummary } from "@/features/exports/components/export-summary"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getConceptByIdForOwner } from "@/server/concepts/concept-repository"
import { getExportByIdForOwner } from "@/server/exports/export-repository"
import { listAssetsByProjectIdForOwner } from "@/server/projects/asset-repository"
import { getProjectByIdForOwner } from "@/server/projects/project-repository"

type ExportDetailPageProps = {
  params: Promise<{
    exportId: string
  }>
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

export default async function ExportDetailPage({
  params
}: ExportDetailPageProps) {
  const { exportId } = await params
  const user = await getAuthenticatedUser()

  if (!user) {
    notFound()
  }

  const exportRecord = await getExportByIdForOwner(exportId, user.id)

  if (!exportRecord) {
    notFound()
  }

  const [project, concept, assets] = await Promise.all([
    getProjectByIdForOwner(exportRecord.project_id, user.id),
    exportRecord.concept_id
      ? getConceptByIdForOwner(exportRecord.concept_id, user.id)
      : Promise.resolve(null),
    listAssetsByProjectIdForOwner(exportRecord.project_id, user.id)
  ])

  if (!project) {
    notFound()
  }

  const exportAsset =
    assets.find((asset) => asset.id === exportRecord.asset_id) ?? null

  const previewDataUrl =
    exportAsset && typeof exportAsset.metadata.previewDataUrl === "string"
      ? exportAsset.metadata.previewDataUrl
      : null

  const videoSrc =
    exportAsset?.mime_type === "video/mp4"
      ? `/api/exports/${exportRecord.id}/download`
      : null

  const voiceoverAsset =
    assets.find((asset) => asset.kind === "voiceover_audio") ?? null

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <ExportSummary
        createdAtLabel={formatTimestamp(exportRecord.created_at)}
        downloadHref={videoSrc}
        projectName={project.name}
        previewDataUrl={previewDataUrl}
        status={exportRecord.status}
        videoSrc={videoSrc}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">Selected concept</p>
          <p className="mt-2 text-sm font-medium text-white">
            {concept?.title ?? "Unknown concept"}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">Artifact mode</p>
          <p className="mt-2 text-sm font-medium text-white">
            {typeof exportAsset?.metadata.renderMode === "string"
              ? exportAsset.metadata.renderMode
              : "unknown"}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">Video specs</p>
          <p className="mt-2 text-sm font-medium text-white">
            {exportAsset?.width ?? 0} × {exportAsset?.height ?? 0} ·{" "}
            {Math.round((exportAsset?.duration_ms ?? 0) / 1000)}s
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">Voiceover</p>
          <p className="mt-2 text-sm font-medium text-white">
            {voiceoverAsset
              ? `${Math.round((voiceoverAsset.duration_ms ?? 0) / 1000)}s`
              : "Not found"}
          </p>
        </div>
      </div>
    </div>
  )
}
