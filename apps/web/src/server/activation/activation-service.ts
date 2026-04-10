import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  createActivationPackageRecord,
  listActivationPackagesByExportIdForOwner,
  supersedeActivationPackagesForExportChannel
} from "@/server/activation/activation-repository"
import { resolveExportCreativeLineage } from "@/server/creative-lineage/export-lineage"
import type {
  ActivationChannel,
  ActivationPackageCreatedVia
} from "@/server/database/types"

export class ActivationPackageError extends Error {
  constructor(
    readonly code:
      | "activation_export_not_finalized"
      | "activation_export_not_found"
      | "activation_package_failed"
  ) {
    super(code)
  }
}

function placementsForChannel(channel: ActivationChannel, aspectRatio: string) {
  if (channel === "meta") {
    return aspectRatio === "9:16"
      ? ["Reels", "Stories"]
      : aspectRatio === "1:1"
        ? ["Feed"]
        : ["Video feed"]
  }

  if (channel === "google") {
    return aspectRatio === "16:9"
      ? ["YouTube in-stream", "Demand Gen landscape"]
      : ["Demand Gen video"]
  }

  if (channel === "tiktok") {
    return ["TikTok video"]
  }

  return ["Internal handoff"]
}

function channelName(channel: ActivationChannel) {
  if (channel === "meta") return "Meta"
  if (channel === "google") return "Google"
  if (channel === "tiktok") return "TikTok"
  return "Internal handoff"
}

function buildReadinessIssues(input: {
  canonicalExportId: string | null
  exportAssetExists: boolean
  exportId: string
  exportStatus: string
  isBatchFinalized: boolean
}) {
  const issues: string[] = []

  if (input.exportStatus !== "ready") {
    issues.push("export_not_ready")
  }

  if (!input.exportAssetExists) {
    issues.push("export_asset_missing")
  }

  if (!input.isBatchFinalized || input.canonicalExportId !== input.exportId) {
    issues.push("export_not_finalized")
  }

  return issues
}

function buildActivationManifest(input: {
  channel: ActivationChannel
  lineage: NonNullable<Awaited<ReturnType<typeof resolveExportCreativeLineage>>>
}) {
  const { concept, exportAsset, exportRecord, previewAsset, project, projectInput, renderBatch } =
    input.lineage

  const placements = placementsForChannel(input.channel, exportRecord.aspect_ratio)
  const exportDownloadPath = `/api/exports/${exportRecord.id}/download`
  const manifestVersion = 1
  const readinessIssues = buildReadinessIssues({
    canonicalExportId: project?.canonical_export_id ?? null,
    exportAssetExists: Boolean(exportAsset),
    exportId: exportRecord.id,
    exportStatus: exportRecord.status,
    isBatchFinalized: Boolean(renderBatch?.is_finalized)
  })

  const manifestJson = {
    activationPackage: {
      channel: input.channel,
      channelLabel: channelName(input.channel),
      manifestVersion,
      preparedAt: new Date().toISOString()
    },
    brief: {
      aspectRatio: projectInput?.aspect_ratio ?? exportRecord.aspect_ratio,
      brandTone: projectInput?.brand_tone ?? null,
      callToAction: projectInput?.call_to_action ?? null,
      offerText: projectInput?.offer_text ?? null,
      productDescription: projectInput?.product_description ?? null,
      productName: projectInput?.product_name ?? null,
      targetAudience: projectInput?.target_audience ?? null,
      visualStyle: projectInput?.visual_style ?? null
    },
    concept: concept
      ? {
          angle: concept.angle,
          hook: concept.hook,
          id: concept.id,
          title: concept.title
        }
      : null,
    export: {
      aspectRatio: exportRecord.aspect_ratio,
      assetId: exportRecord.asset_id,
      downloadPath: exportDownloadPath,
      id: exportRecord.id,
      platformPreset: exportRecord.platform_preset,
      previewAssetId: exportRecord.preview_asset_id,
      status: exportRecord.status,
      variantKey: exportRecord.variant_key
    },
    lineage: {
      canonicalExportId: project?.canonical_export_id ?? null,
      conceptId: exportRecord.concept_id,
      previewAssetId: previewAsset?.id ?? exportRecord.preview_asset_id,
      projectId: exportRecord.project_id,
      renderBatchId: renderBatch?.id ?? null
    },
    project: project
      ? {
          id: project.id,
          name: project.name
        }
      : null
  } satisfies Record<string, unknown>

  const assetBundleJson = {
    items: [
      exportAsset
        ? {
            downloadPath: exportDownloadPath,
            durationMs: exportAsset.duration_ms,
            height: exportAsset.height,
            id: exportAsset.id,
            kind: exportAsset.kind,
            mimeType: exportAsset.mime_type,
            storageKey: exportAsset.storage_key,
            width: exportAsset.width
          }
        : null,
      previewAsset
        ? {
            id: previewAsset.id,
            kind: previewAsset.kind,
            mimeType: previewAsset.mime_type,
            previewDataUrl:
              typeof previewAsset.metadata.previewDataUrl === "string"
                ? previewAsset.metadata.previewDataUrl
                : null,
            storageKey: previewAsset.storage_key
          }
        : null
    ].filter(Boolean)
  } satisfies Record<string, unknown>

  const channelPayloadJson = {
    adCreative: {
      callToAction: projectInput?.call_to_action ?? null,
      channel: input.channel,
      creativeName: [
        project?.name ?? "Project",
        concept?.title ?? "Creative",
        exportRecord.variant_key,
        exportRecord.aspect_ratio
      ].join(" · "),
      headline: concept?.hook ?? projectInput?.product_name ?? project?.name ?? null,
      placements,
      primaryAsset: {
        assetId: exportRecord.asset_id,
        downloadPath: exportDownloadPath,
        mimeType: exportAsset?.mime_type ?? null
      },
      primaryText:
        projectInput?.product_description ??
        projectInput?.offer_text ??
        concept?.angle ??
        null
    },
    destination: "internal_preparation"
  } satisfies Record<string, unknown>

  return {
    assetBundleJson,
    channelPayloadJson,
    manifestJson,
    manifestVersion,
    readinessIssues,
    readinessStatus: readinessIssues.length > 0 ? "blocked" : "ready",
    status: readinessIssues.length > 0 ? "draft" : "ready"
  } as const
}

export async function listActivationPackagesForExport(input: {
  exportId: string
  ownerId: string
  client?: SupabaseClient
}) {
  return listActivationPackagesByExportIdForOwner(
    input.exportId,
    input.ownerId,
    input.client
  )
}

export async function createActivationPackageForExport(input: {
  channel: ActivationChannel
  exportId: string
  ownerId: string
  createdByUserId: string | null
  createdVia: ActivationPackageCreatedVia
  client?: SupabaseClient
}) {
  const lineage = await resolveExportCreativeLineage({
    exportId: input.exportId,
    ownerId: input.ownerId,
    client: input.client
  })

  if (!lineage || !lineage.project) {
    throw new ActivationPackageError("activation_export_not_found")
  }

  const isFinalizedCanonical =
    Boolean(lineage.renderBatch?.is_finalized) &&
    lineage.project.canonical_export_id === lineage.exportRecord.id

  if (!isFinalizedCanonical) {
    throw new ActivationPackageError("activation_export_not_finalized")
  }

  const manifest = buildActivationManifest({
    channel: input.channel,
    lineage
  })

  try {
    await supersedeActivationPackagesForExportChannel({
      channel: input.channel,
      exportId: input.exportId,
      ownerId: input.ownerId,
      client: input.client
    })

    return await createActivationPackageRecord({
      assetBundleJson: manifest.assetBundleJson,
      canonicalExportId: lineage.project.canonical_export_id,
      channel: input.channel,
      channelPayloadJson: manifest.channelPayloadJson,
      createdByUserId: input.createdByUserId,
      createdVia: input.createdVia,
      exportId: lineage.exportRecord.id,
      manifestJson: manifest.manifestJson,
      manifestVersion: manifest.manifestVersion,
      ownerId: input.ownerId,
      projectId: lineage.project.id,
      readinessIssues: manifest.readinessIssues,
      readinessStatus: manifest.readinessStatus,
      renderBatchId: lineage.renderBatch?.id ?? null,
      status: manifest.status,
      client: input.client
    })
  } catch (error) {
    if (error instanceof ActivationPackageError) {
      throw error
    }

    throw new ActivationPackageError("activation_package_failed")
  }
}

export const activationServiceInternals = {
  buildReadinessIssues
}
