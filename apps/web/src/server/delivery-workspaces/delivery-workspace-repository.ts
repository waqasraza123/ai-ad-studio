import "server-only"
import { randomBytes } from "node:crypto"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  AssetRecord,
  DeliveryApprovalSummary,
  DeliveryWorkspaceExportRecord,
  DeliveryWorkspaceRecord,
  ExportRecord
} from "@/server/database/types"

const deliveryWorkspaceSelection =
  "id, owner_id, project_id, render_batch_id, canonical_export_id, title, summary, handoff_notes, approval_summary, token, status, created_at, updated_at"

const deliveryWorkspaceExportSelection =
  "id, delivery_workspace_id, owner_id, project_id, export_id, label, sort_order, created_at"

function generateDeliveryToken() {
  return randomBytes(20).toString("hex")
}

function normalizeDeliveryWorkspace(
  record: Omit<DeliveryWorkspaceRecord, "approval_summary"> & {
    approval_summary: unknown
  }
) {
  return {
    ...record,
    approval_summary: (record.approval_summary ?? {
      approved_count: 0,
      rejected_count: 0,
      pending_count: 0,
      responded_count: 0,
      review_note: null,
      finalization_note: null,
      decided_at: null,
      finalized_at: null
    }) as DeliveryApprovalSummary
  } as DeliveryWorkspaceRecord
}

export async function listDeliveryWorkspacesByOwner(ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("delivery_workspaces")
    .select(deliveryWorkspaceSelection)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list delivery workspaces")
  }

  return (data ?? []).map((record) =>
    normalizeDeliveryWorkspace(
      record as DeliveryWorkspaceRecord & {
        approval_summary: unknown
      }
    )
  )
}

export async function getDeliveryWorkspaceByCanonicalExportIdForOwner(
  canonicalExportId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("delivery_workspaces")
    .select(deliveryWorkspaceSelection)
    .eq("canonical_export_id", canonicalExportId)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load delivery workspace")
  }

  if (!data) {
    return null
  }

  return normalizeDeliveryWorkspace(
    data as DeliveryWorkspaceRecord & {
      approval_summary: unknown
    }
  )
}

export async function getActiveDeliveryWorkspaceByToken(token: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("delivery_workspaces")
    .select(deliveryWorkspaceSelection)
    .eq("token", token)
    .eq("status", "active")
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load public delivery workspace")
  }

  if (!data) {
    return null
  }

  return normalizeDeliveryWorkspace(
    data as DeliveryWorkspaceRecord & {
      approval_summary: unknown
    }
  )
}

export async function listDeliveryWorkspaceExportsByWorkspaceIdForOwner(
  workspaceId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("delivery_workspace_exports")
    .select(deliveryWorkspaceExportSelection)
    .eq("delivery_workspace_id", workspaceId)
    .eq("owner_id", ownerId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error("Failed to list delivery workspace exports")
  }

  return (data ?? []) as DeliveryWorkspaceExportRecord[]
}

export async function listPublicDeliveryWorkspaceExportsByWorkspaceId(
  workspaceId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("delivery_workspace_exports")
    .select(deliveryWorkspaceExportSelection)
    .eq("delivery_workspace_id", workspaceId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error("Failed to load public delivery workspace exports")
  }

  return (data ?? []) as DeliveryWorkspaceExportRecord[]
}

export async function upsertDeliveryWorkspace(input: {
  approvalSummary: DeliveryApprovalSummary
  canonicalExportId: string
  handoffNotes: string
  ownerId: string
  projectId: string
  renderBatchId: string
  summary: string
  title: string
}) {
  const supabase = await createSupabaseServerClient()
  const existing = await getDeliveryWorkspaceByCanonicalExportIdForOwner(
    input.canonicalExportId,
    input.ownerId
  )

  if (existing) {
    const { data, error } = await supabase
      .from("delivery_workspaces")
      .update({
        approval_summary: input.approvalSummary,
        handoff_notes: input.handoffNotes,
        render_batch_id: input.renderBatchId,
        status: "active",
        summary: input.summary,
        title: input.title,
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id)
      .eq("owner_id", input.ownerId)
      .select(deliveryWorkspaceSelection)
      .single()

    if (error) {
      throw new Error("Failed to update delivery workspace")
    }

    return normalizeDeliveryWorkspace(
      data as DeliveryWorkspaceRecord & {
        approval_summary: unknown
      }
    )
  }

  const { data, error } = await supabase
    .from("delivery_workspaces")
    .insert({
      approval_summary: input.approvalSummary,
      canonical_export_id: input.canonicalExportId,
      handoff_notes: input.handoffNotes,
      owner_id: input.ownerId,
      project_id: input.projectId,
      render_batch_id: input.renderBatchId,
      summary: input.summary,
      title: input.title,
      token: generateDeliveryToken()
    })
    .select(deliveryWorkspaceSelection)
    .single()

  if (error) {
    throw new Error("Failed to create delivery workspace")
  }

  return normalizeDeliveryWorkspace(
    data as DeliveryWorkspaceRecord & {
      approval_summary: unknown
    }
  )
}

export async function replaceDeliveryWorkspaceExports(input: {
  exportRecords: ExportRecord[]
  ownerId: string
  projectId: string
  workspaceId: string
}) {
  const supabase = await createSupabaseServerClient()

  const { error: deleteError } = await supabase
    .from("delivery_workspace_exports")
    .delete()
    .eq("delivery_workspace_id", input.workspaceId)
    .eq("owner_id", input.ownerId)

  if (deleteError) {
    throw new Error("Failed to reset delivery workspace exports")
  }

  if (input.exportRecords.length === 0) {
    return
  }

  const { error: insertError } = await supabase
    .from("delivery_workspace_exports")
    .insert(
      input.exportRecords.map((exportRecord, index) => ({
        delivery_workspace_id: input.workspaceId,
        export_id: exportRecord.id,
        label: `${exportRecord.variant_key} · ${exportRecord.aspect_ratio}`,
        owner_id: input.ownerId,
        project_id: input.projectId,
        sort_order: index
      }))
    )

  if (insertError) {
    throw new Error("Failed to update delivery workspace exports")
  }
}

export async function archiveDeliveryWorkspace(input: {
  ownerId: string
  workspaceId: string
}) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("delivery_workspaces")
    .update({
      status: "archived",
      updated_at: new Date().toISOString()
    })
    .eq("id", input.workspaceId)
    .eq("owner_id", input.ownerId)
    .select(deliveryWorkspaceSelection)
    .single()

  if (error) {
    throw new Error("Failed to archive delivery workspace")
  }

  return normalizeDeliveryWorkspace(
    data as DeliveryWorkspaceRecord & {
      approval_summary: unknown
    }
  )
}

export async function listExportsForDeliveryWorkspace(input: {
  exportIds: string[]
}) {
  if (input.exportIds.length === 0) {
    return [] as ExportRecord[]
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("exports")
    .select("id, project_id, concept_id, owner_id, asset_id, status, version, variant_key, aspect_ratio, platform_preset, render_metadata, created_at, updated_at")
    .in("id", input.exportIds)

  if (error) {
    throw new Error("Failed to load workspace exports")
  }

  return (data ?? []) as ExportRecord[]
}

export async function listAssetsForDeliveryWorkspace(input: {
  assetIds: string[]
}) {
  if (input.assetIds.length === 0) {
    return [] as AssetRecord[]
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("assets")
    .select("id, project_id, owner_id, kind, storage_key, mime_type, width, height, duration_ms, metadata, created_at")
    .in("id", input.assetIds)

  if (error) {
    throw new Error("Failed to load workspace assets")
  }

  return (data ?? []) as AssetRecord[]
}
