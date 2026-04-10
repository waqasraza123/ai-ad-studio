import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ActivationPackageRecord } from "@/server/database/types"

const activationPackageSelection =
  "id, owner_id, project_id, render_batch_id, export_id, canonical_export_id, channel, status, readiness_status, readiness_issues, manifest_version, manifest_json, channel_payload_json, asset_bundle_json, created_by_user_id, created_via, created_at, updated_at"

async function resolveClient(client?: SupabaseClient) {
  return client ?? createSupabaseServerClient()
}

function normalizeActivationPackage(
  record: ActivationPackageRecord & {
    asset_bundle_json: unknown
    channel_payload_json: unknown
    manifest_json: unknown
    readiness_issues: unknown
  }
) {
  return {
    ...record,
    asset_bundle_json:
      record.asset_bundle_json && typeof record.asset_bundle_json === "object"
        ? (record.asset_bundle_json as Record<string, unknown>)
        : {},
    channel_payload_json:
      record.channel_payload_json && typeof record.channel_payload_json === "object"
        ? (record.channel_payload_json as Record<string, unknown>)
        : {},
    manifest_json:
      record.manifest_json && typeof record.manifest_json === "object"
        ? (record.manifest_json as Record<string, unknown>)
        : {},
    readiness_issues: Array.isArray(record.readiness_issues)
      ? record.readiness_issues.filter((value): value is string => typeof value === "string")
      : []
  } satisfies ActivationPackageRecord
}

export async function listActivationPackagesByExportIdForOwner(
  exportId: string,
  ownerId: string,
  client?: SupabaseClient
) {
  const supabase = await resolveClient(client)
  const { data, error } = await supabase
    .from("activation_packages")
    .select(activationPackageSelection)
    .eq("export_id", exportId)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list activation packages")
  }

  return (data ?? []).map((record) =>
    normalizeActivationPackage(
      record as ActivationPackageRecord & {
        asset_bundle_json: unknown
        channel_payload_json: unknown
        manifest_json: unknown
        readiness_issues: unknown
      }
    )
  )
}

export async function getActivationPackageByIdForOwner(
  packageId: string,
  ownerId: string,
  client?: SupabaseClient
) {
  const supabase = await resolveClient(client)
  const { data, error } = await supabase
    .from("activation_packages")
    .select(activationPackageSelection)
    .eq("id", packageId)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load activation package")
  }

  if (!data) {
    return null
  }

  return normalizeActivationPackage(
    data as ActivationPackageRecord & {
      asset_bundle_json: unknown
      channel_payload_json: unknown
      manifest_json: unknown
      readiness_issues: unknown
    }
  )
}

export async function supersedeActivationPackagesForExportChannel(input: {
  exportId: string
  ownerId: string
  channel: ActivationPackageRecord["channel"]
  client?: SupabaseClient
}) {
  const supabase = await resolveClient(input.client)
  const { error } = await supabase
    .from("activation_packages")
    .update({
      status: "superseded"
    })
    .eq("export_id", input.exportId)
    .eq("owner_id", input.ownerId)
    .eq("channel", input.channel)
    .in("status", ["draft", "ready"])

  if (error) {
    throw new Error("Failed to archive prior activation packages")
  }
}

export async function createActivationPackageRecord(input: {
  ownerId: string
  projectId: string
  renderBatchId: string | null
  exportId: string
  canonicalExportId: string | null
  channel: ActivationPackageRecord["channel"]
  status: ActivationPackageRecord["status"]
  readinessStatus: ActivationPackageRecord["readiness_status"]
  readinessIssues: string[]
  manifestVersion: number
  manifestJson: Record<string, unknown>
  channelPayloadJson: Record<string, unknown>
  assetBundleJson: Record<string, unknown>
  createdByUserId: string | null
  createdVia: ActivationPackageRecord["created_via"]
  client?: SupabaseClient
}) {
  const supabase = await resolveClient(input.client)
  const { data, error } = await supabase
    .from("activation_packages")
    .insert({
      asset_bundle_json: input.assetBundleJson,
      canonical_export_id: input.canonicalExportId,
      channel: input.channel,
      channel_payload_json: input.channelPayloadJson,
      created_by_user_id: input.createdByUserId,
      created_via: input.createdVia,
      export_id: input.exportId,
      manifest_json: input.manifestJson,
      manifest_version: input.manifestVersion,
      owner_id: input.ownerId,
      project_id: input.projectId,
      readiness_issues: input.readinessIssues,
      readiness_status: input.readinessStatus,
      render_batch_id: input.renderBatchId,
      status: input.status
    })
    .select(activationPackageSelection)
    .single()

  if (error) {
    throw new Error("Failed to create activation package")
  }

  return normalizeActivationPackage(
    data as ActivationPackageRecord & {
      asset_bundle_json: unknown
      channel_payload_json: unknown
      manifest_json: unknown
      readiness_issues: unknown
    }
  )
}
