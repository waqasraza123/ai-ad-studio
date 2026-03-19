import { notFound } from "next/navigation"
import { ExportSummary } from "@/features/exports/components/export-summary"
import { ShareLinkPanel } from "@/features/exports/components/share-link-panel"
import { ShareCampaignPanel } from "@/features/renders/components/share-campaign-panel"
import { ShowcasePublishPanel } from "@/features/showcase/components/showcase-publish-panel"
import { UsageEventsTable } from "@/features/analytics/components/usage-events-table"
import { DeliveryWorkspacePanel } from "@/features/delivery/components/delivery-workspace-panel"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { listUsageEventsByExportIdForOwner } from "@/server/analytics/usage-event-repository"
import { getConceptByIdForOwner } from "@/server/concepts/concept-repository"
import {
  getDeliveryWorkspaceByCanonicalExportIdForOwner,
  listDeliveryWorkspaceExportsByWorkspaceIdForOwner
} from "@/server/delivery-workspaces/delivery-workspace-repository"
import { getExportByIdForOwner, listExportsByProjectIdForOwner } from "@/server/exports/export-repository"
import {
  getShareLinkByExportIdForOwner
} from "@/server/exports/share-link-repository"
import { getPromotionEligibilityForExport } from "@/server/promotion/promotion-eligibility"
import { listAssetsByProjectIdForOwner } from "@/server/projects/asset-repository"
import { getProjectByIdForOwner } from "@/server/projects/project-repository"
import { getRenderBatchByIdForOwner, listExportsForRenderBatch } from "@/server/render-batches/render-batch-repository"
import { getShareCampaignByExportIdForOwner } from "@/server/share-campaigns/share-campaign-repository"
import { getShowcaseItemByExportIdForOwner } from "@/server/showcase/showcase-repository"
import { getPublicEnvironment } from "@/lib/env"

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

function renderMetadataValue(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key]

  if (typeof value === "string" || typeof value === "number") {
    return String(value)
  }

  return "n/a"
}

function formatUsd(value: number) {
  return `$${value.toFixed(4)}`
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

  const [
    project,
    concept,
    assets,
    shareLink,
    usageEvents,
    showcaseItem,
    shareCampaign,
    promotionEligibility,
    deliveryWorkspace,
    projectExports
  ] = await Promise.all([
    getProjectByIdForOwner(exportRecord.project_id, user.id),
    exportRecord.concept_id
      ? getConceptByIdForOwner(exportRecord.concept_id, user.id)
      : Promise.resolve(null),
    listAssetsByProjectIdForOwner(exportRecord.project_id, user.id),
    getShareLinkByExportIdForOwner(exportRecord.id, user.id),
    listUsageEventsByExportIdForOwner(exportRecord.id, user.id),
    getShowcaseItemByExportIdForOwner(exportRecord.id, user.id),
    getShareCampaignByExportIdForOwner(exportRecord.id, user.id),
    getPromotionEligibilityForExport({
      exportRecord,
      ownerId: user.id
    }),
    getDeliveryWorkspaceByCanonicalExportIdForOwner(exportRecord.id, user.id),
    listExportsByProjectIdForOwner(exportRecord.project_id, user.id)
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

  const environment = getPublicEnvironment()
  const shareUrl = shareLink
    ? `${environment.NEXT_PUBLIC_APP_URL}/share/${shareLink.token}`
    : null

  const exportCost = usageEvents.reduce(
    (total, event) => total + Number(event.estimated_cost_usd ?? 0),
    0
  )

  const eligibleBatch =
    promotionEligibility.eligible
      ? await getRenderBatchByIdForOwner(promotionEligibility.batchId, user.id)
      : null

  const eligibleBatchExports =
    eligibleBatch
      ? await listExportsForRenderBatch({
          batchId: eligibleBatch.id,
          exports: projectExports
        })
      : []

  const workspaceExports =
    deliveryWorkspace
      ? await listDeliveryWorkspaceExportsByWorkspaceIdForOwner(
          deliveryWorkspace.id,
          user.id
        )
      : []

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

      <div className="grid gap-4 md:grid-cols-6">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">Selected concept</p>
          <p className="mt-2 text-sm font-medium text-white">
            {concept?.title ?? "Unknown concept"}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">Variant</p>
          <p className="mt-2 text-sm font-medium text-white">
            {exportRecord.variant_key}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">Preset</p>
          <p className="mt-2 text-sm font-medium text-white">
            {exportRecord.platform_preset}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">Aspect ratio</p>
          <p className="mt-2 text-sm font-medium text-white">
            {exportRecord.aspect_ratio}
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

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">Estimated cost</p>
          <p className="mt-2 text-sm font-medium text-white">
            {formatUsd(exportCost)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">Artifact mode</p>
          <p className="mt-2 text-sm font-medium text-white">
            {typeof exportAsset?.metadata.renderMode === "string"
              ? exportAsset.metadata.renderMode
              : "unknown"}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">Scene count</p>
          <p className="mt-2 text-sm font-medium text-white">
            {renderMetadataValue(exportRecord.render_metadata, "sceneCount")}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">Caption cues</p>
          <p className="mt-2 text-sm font-medium text-white">
            {renderMetadataValue(exportRecord.render_metadata, "captionCueCount")}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">Video specs</p>
          <p className="mt-2 text-sm font-medium text-white">
            {exportAsset?.width ?? 0} × {exportAsset?.height ?? 0} ·{" "}
            {Math.round((exportAsset?.duration_ms ?? 0) / 1000)}s
          </p>
        </div>
      </div>

      {concept ? (
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">Safety notes</p>
          <p className="mt-2 text-sm leading-7 text-white">
            {concept.safety_notes ?? "No additional safety notes were recorded."}
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <ShareLinkPanel exportId={exportRecord.id} shareUrl={shareUrl} />
        <DeliveryWorkspacePanel
          canonicalExportId={exportRecord.id}
          eligibleBatchExports={eligibleBatchExports}
          eligibilityReason={promotionEligibility.eligible ? null : promotionEligibility.reason}
          isEligible={promotionEligibility.eligible}
          workspace={deliveryWorkspace}
          workspaceExportIds={workspaceExports.map((item) => item.export_id)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ShowcasePublishPanel
          eligibilityReason={promotionEligibility.eligible ? null : promotionEligibility.reason}
          exportId={exportRecord.id}
          isEligible={promotionEligibility.eligible}
          showcaseItem={showcaseItem}
        />
        <ShareCampaignPanel
          eligibilityReason={promotionEligibility.eligible ? null : promotionEligibility.reason}
          exportId={exportRecord.id}
          isEligible={promotionEligibility.eligible}
          shareCampaign={shareCampaign}
        />
      </div>

      <UsageEventsTable usageEvents={usageEvents} />
    </div>
  )
}
