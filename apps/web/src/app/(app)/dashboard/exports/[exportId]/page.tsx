import { notFound } from "next/navigation"
import { AppPageFrame } from "@/components/layout/page-frame"
import { StaleWorkspaceRefresh } from "@/components/system/stale-workspace-refresh"
import { ExportSummary } from "@/features/exports/components/export-summary"
import { exportStatusIsInProgress } from "@/features/exports/lib/export-status-ui"
import { ShareLinkPanel } from "@/features/exports/components/share-link-panel"
import { ActivationPackagePanel } from "@/features/activation/components/activation-package-panel"
import { ShareCampaignPanel } from "@/features/renders/components/share-campaign-panel"
import { ShowcasePublishPanel } from "@/features/showcase/components/showcase-publish-panel"
import { UsageEventsTable } from "@/features/analytics/components/usage-events-table"
import { DeliveryWorkspacePanel } from "@/features/delivery/components/delivery-workspace-panel"
import { DeliveryActivityTimeline } from "@/features/delivery/components/delivery-activity-timeline"
import { summarizeDeliveryWorkspaceActivity } from "@/features/delivery/lib/delivery-activity"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  getActivationReadinessForExport,
  listActivationPackagesForExport
} from "@/server/activation/activation-service"
import { listUsageEventsByExportIdForOwner } from "@/server/analytics/usage-event-repository"
import { getEffectiveOwnerLimits } from "@/server/billing/billing-service"
import { getConceptByIdForOwner } from "@/server/concepts/concept-repository"
import {
  getDeliveryWorkspaceByCanonicalExportIdForOwner,
  listDeliveryWorkspaceEventsByWorkspaceIdForOwner,
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
import { getFormErrorMessage } from "@/lib/form-error-messages"
import { getServerI18n } from "@/lib/i18n/server"
import type { Translator } from "@/lib/i18n/translator"

type ExportDetailPageProps = {
  params: Promise<{
    exportId: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function readSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key]

  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

function formatTimestamp(
  value: string,
  formatDateTime: Translator["formatDateTime"]
) {
  return formatDateTime(value, {
    dateStyle: "medium",
    timeStyle: "short"
  })
}

function renderMetadataValue(
  metadata: Record<string, unknown>,
  key: string,
  notAvailableLabel: string
) {
  const value = metadata[key]

  if (typeof value === "string" || typeof value === "number") {
    return String(value)
  }

  return notAvailableLabel
}

export default async function ExportDetailPage({
  params,
  searchParams
}: ExportDetailPageProps) {
  const { formatCurrency, formatDateTime, t } = await getServerI18n()
  const { exportId } = await params
  const sp = await searchParams
  const formErrorMessage = getFormErrorMessage(readSearchParam(sp, "error"), t)
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
    projectExports,
    activationPackages,
    activationReadiness,
    billingLimits
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
    listExportsByProjectIdForOwner(exportRecord.project_id, user.id),
    listActivationPackagesForExport({
      exportId: exportRecord.id,
      ownerId: user.id
    }),
    getActivationReadinessForExport({
      exportId: exportRecord.id,
      ownerId: user.id
    }),
    getEffectiveOwnerLimits(user.id)
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

  const workspaceEvents =
    deliveryWorkspace
      ? await listDeliveryWorkspaceEventsByWorkspaceIdForOwner(
          deliveryWorkspace.id,
          user.id
        )
      : []

  const workspaceActivitySummary =
    deliveryWorkspace && workspaceEvents.length > 0
      ? summarizeDeliveryWorkspaceActivity(workspaceEvents)
      : null

  return (
    <AppPageFrame variant="expanded" className="space-y-6">
      <StaleWorkspaceRefresh active={exportStatusIsInProgress(exportRecord.status)} />

      {formErrorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {formErrorMessage}
        </div>
      ) : null}

      <ExportSummary
        createdAtLabel={formatTimestamp(exportRecord.created_at, formatDateTime)}
        downloadHref={videoSrc}
        projectName={project.name}
        previewDataUrl={previewDataUrl}
        status={exportRecord.status}
        videoSrc={videoSrc}
      />

      <div className="grid gap-4 md:grid-cols-6">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">{t("exports.detail.selectedConcept")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            {concept?.title ?? t("exports.detail.unknownConcept")}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">{t("exports.detail.variant")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            {exportRecord.variant_key}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">{t("exports.detail.preset")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            {exportRecord.platform_preset}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">{t("exports.detail.aspectRatio")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            {exportRecord.aspect_ratio}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">{t("exports.detail.voiceover")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            {voiceoverAsset
              ? `${Math.round((voiceoverAsset.duration_ms ?? 0) / 1000)}s`
              : t("exports.detail.notFound")}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">{t("exports.detail.estimatedCost")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            {formatCurrency(exportCost, "USD", {
              maximumFractionDigits: 4,
              minimumFractionDigits: 4
            })}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">{t("exports.detail.artifactMode")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            {typeof exportAsset?.metadata.renderMode === "string"
              ? exportAsset.metadata.renderMode
              : t("exports.detail.unknown")}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">{t("exports.detail.sceneCount")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            {renderMetadataValue(
              exportRecord.render_metadata,
              "sceneCount",
              t("exports.detail.notAvailable")
            )}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">{t("exports.detail.captionCues")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            {renderMetadataValue(
              exportRecord.render_metadata,
              "captionCueCount",
              t("exports.detail.notAvailable")
            )}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">{t("exports.detail.videoSpecs")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            {exportAsset?.width ?? 0} × {exportAsset?.height ?? 0} ·{" "}
            {Math.round((exportAsset?.duration_ms ?? 0) / 1000)}s
          </p>
        </div>
      </div>

      {concept ? (
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">{t("exports.detail.safetyNotes")}</p>
          <p className="mt-2 text-sm leading-7 text-white">
            {concept.safety_notes ?? t("exports.detail.noSafetyNotes")}
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.92fr)]">
        <ActivationPackagePanel
          activationEnabled={billingLimits.featureAccess.allowActivationPackages}
          exportId={exportRecord.id}
          packages={activationPackages}
          readiness={
            activationReadiness ?? {
              isEligible: false,
              issues: ["project_missing"],
              status: "blocked"
            }
          }
        />
        <ShareLinkPanel exportId={exportRecord.id} shareUrl={shareUrl} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.92fr)]">
        <DeliveryWorkspacePanel
          canonicalExportId={exportRecord.id}
          eligibleBatchExports={eligibleBatchExports}
          eligibilityReason={promotionEligibility.eligible ? null : promotionEligibility.reason}
          isEligible={promotionEligibility.eligible}
          workspace={deliveryWorkspace}
          workspaceExportIds={workspaceExports.map((item) => item.export_id)}
        />
        <ShowcasePublishPanel
          eligibilityReason={promotionEligibility.eligible ? null : promotionEligibility.reason}
          exportId={exportRecord.id}
          isEligible={promotionEligibility.eligible}
          showcaseItem={showcaseItem}
        />
      </div>

      {deliveryWorkspace && workspaceActivitySummary ? (
        <DeliveryActivityTimeline
          events={workspaceEvents}
          summary={workspaceActivitySummary}
        />
      ) : null}

      <div className="grid gap-4">
        <ShareCampaignPanel
          eligibilityReason={promotionEligibility.eligible ? null : promotionEligibility.reason}
          exportId={exportRecord.id}
          isEligible={promotionEligibility.eligible}
          shareCampaign={shareCampaign}
        />
      </div>

      <UsageEventsTable usageEvents={usageEvents} />
    </AppPageFrame>
  )
}
