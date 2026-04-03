import "server-only"
import { randomBytes } from "node:crypto"
import { createClient } from "@supabase/supabase-js"
import { getServerEnvironment } from "@/lib/env"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  AssetRecord,
  DeliveryApprovalSummary,
  DeliveryFollowUpStatus,
  DeliveryReminderBucket,
  DeliveryWorkspaceEventRecord,
  DeliveryWorkspaceEventType,
  DeliveryWorkspaceExportRecord,
  DeliveryWorkspaceRecord,
  ExportRecord
} from "@/server/database/types"

const deliveryWorkspaceSelection =
  "id, owner_id, project_id, render_batch_id, canonical_export_id, title, summary, handoff_notes, approval_summary, token, status, follow_up_status, follow_up_note, follow_up_due_on, follow_up_updated_at, follow_up_last_notification_bucket, follow_up_last_notification_date, reminder_mismatch_resolved_notification_id, reminder_mismatch_resolved_at, reminder_mismatch_resolution_note, created_at, updated_at"

const deliveryWorkspaceExportSelection =
  "id, delivery_workspace_id, owner_id, project_id, export_id, label, sort_order, created_at"

const deliveryWorkspaceEventSelection =
  "id, delivery_workspace_id, owner_id, project_id, export_id, event_type, actor_label, metadata, created_at"

function generateDeliveryToken() {
  return randomBytes(20).toString("hex")
}

function normalizeDeliveryFollowUpStatus(value: unknown): DeliveryFollowUpStatus {
  if (
    value === "needs_follow_up" ||
    value === "reminder_scheduled" ||
    value === "waiting_on_client" ||
    value === "resolved"
  ) {
    return value
  }

  return "none"
}

function normalizeDeliveryReminderBucket(
  value: unknown
): DeliveryReminderBucket | null {
  if (
    value === "none" ||
    value === "overdue" ||
    value === "due_today" ||
    value === "upcoming"
  ) {
    return value
  }

  return null
}

function normalizeDeliveryWorkspace(
  record: Omit<
    DeliveryWorkspaceRecord,
    "approval_summary" | "follow_up_status" | "follow_up_last_notification_bucket"
  > & {
    approval_summary: unknown
    follow_up_status: unknown
    follow_up_last_notification_bucket: unknown
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
    }) as DeliveryApprovalSummary,
    follow_up_due_on: record.follow_up_due_on ?? null,
    follow_up_note: record.follow_up_note ?? null,
    follow_up_status: normalizeDeliveryFollowUpStatus(record.follow_up_status),
    follow_up_updated_at: record.follow_up_updated_at ?? null,
    follow_up_last_notification_bucket: normalizeDeliveryReminderBucket(
      record.follow_up_last_notification_bucket
    ),
    follow_up_last_notification_date:
      record.follow_up_last_notification_date ?? null
  } as DeliveryWorkspaceRecord
}

function createPrivilegedSupabaseClient() {
  const environment = getServerEnvironment()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Privileged Supabase configuration is missing")
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
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
      follow_up_status: unknown
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
      follow_up_status: unknown
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
      follow_up_status: unknown
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

export async function listDeliveryWorkspaceEventsByWorkspaceIdForOwner(
  workspaceId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("delivery_workspace_events")
    .select(deliveryWorkspaceEventSelection)
    .eq("delivery_workspace_id", workspaceId)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to load delivery workspace events")
  }

  return (data ?? []) as DeliveryWorkspaceEventRecord[]
}

export async function listPublicDeliveryWorkspaceEventsByToken(token: string) {
  const supabase = createPrivilegedSupabaseClient()

  const { data: workspace, error: workspaceError } = await supabase
    .from("delivery_workspaces")
    .select("id")
    .eq("token", token)
    .eq("status", "active")
    .maybeSingle()

  if (workspaceError) {
    throw new Error("Failed to load public delivery workspace")
  }

  if (!workspace) {
    return [] as DeliveryWorkspaceEventRecord[]
  }

  const { data, error } = await supabase
    .from("delivery_workspace_events")
    .select(deliveryWorkspaceEventSelection)
    .eq("delivery_workspace_id", workspace.id)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to load public delivery workspace events")
  }

  return (data ?? []) as DeliveryWorkspaceEventRecord[]
}


export async function listDeliveryWorkspaceEventsByWorkspaceIdsForOwner(
  workspaceIds: string[],
  ownerId: string
) {
  if (workspaceIds.length === 0) {
    return [] as DeliveryWorkspaceEventRecord[]
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("delivery_workspace_events")
    .select(deliveryWorkspaceEventSelection)
    .in("delivery_workspace_id", workspaceIds)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to load delivery workspace events")
  }

  return (data ?? []) as DeliveryWorkspaceEventRecord[]
}

export async function recordDeliveryWorkspaceEvent(input: {
  workspaceId: string
  ownerId: string
  projectId: string
  exportId: string | null
  eventType: DeliveryWorkspaceEventType
  actorLabel?: string | null
  metadata?: Record<string, unknown>
}) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("delivery_workspace_events")
    .insert({
      delivery_workspace_id: input.workspaceId,
      owner_id: input.ownerId,
      project_id: input.projectId,
      export_id: input.exportId,
      event_type: input.eventType,
      actor_label: input.actorLabel ?? null,
      metadata: input.metadata ?? {}
    })
    .select(deliveryWorkspaceEventSelection)
    .single()

  if (error) {
    throw new Error("Failed to record delivery workspace event")
  }

  return data as DeliveryWorkspaceEventRecord
}

export async function recordPublicDeliveryWorkspaceEventByToken(input: {
  token: string
  eventType: DeliveryWorkspaceEventType
  exportId?: string | null
  actorLabel?: string | null
  metadata?: Record<string, unknown>
}) {
  const supabase = createPrivilegedSupabaseClient()

  const { data: workspace, error: workspaceError } = await supabase
    .from("delivery_workspaces")
    .select("id, owner_id, project_id, canonical_export_id")
    .eq("token", input.token)
    .eq("status", "active")
    .maybeSingle()

  if (workspaceError) {
    throw new Error("Failed to load public delivery workspace")
  }

  if (!workspace) {
    throw new Error("Delivery workspace not found")
  }

  const exportId = input.exportId ?? null

  if (exportId) {
    const { data: workspaceExport, error: workspaceExportError } = await supabase
      .from("delivery_workspace_exports")
      .select("id")
      .eq("delivery_workspace_id", workspace.id)
      .eq("export_id", exportId)
      .maybeSingle()

    if (workspaceExportError) {
      throw new Error("Failed to validate delivery workspace export")
    }

    if (!workspaceExport) {
      throw new Error("Export does not belong to this delivery workspace")
    }
  }

  const { data, error } = await supabase
    .from("delivery_workspace_events")
    .insert({
      delivery_workspace_id: workspace.id,
      owner_id: workspace.owner_id,
      project_id: workspace.project_id,
      export_id: exportId,
      event_type: input.eventType,
      actor_label: input.actorLabel ?? null,
      metadata: input.metadata ?? {}
    })
    .select(deliveryWorkspaceEventSelection)
    .single()

  if (error) {
    throw new Error("Failed to record public delivery workspace event")
  }

  return data as DeliveryWorkspaceEventRecord
}

export async function getDeliveryWorkspaceByIdForOwner(
  workspaceId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("delivery_workspaces")
    .select(deliveryWorkspaceSelection)
    .eq("id", workspaceId)
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
      follow_up_status: unknown
    }
  )
}


export async function getDeliveryWorkspaceFollowUpSnapshotById(workspaceId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("delivery_workspaces")
    .select("id, follow_up_status, follow_up_due_on")
    .eq("id", workspaceId)
    .single()

  if (error || !data) {
    throw new Error("Failed to load delivery workspace follow-up snapshot")
  }

  return {
    follow_up_due_on: data.follow_up_due_on ?? null,
    follow_up_status: normalizeDeliveryFollowUpStatus(data.follow_up_status),
    id: data.id
  }
}


export async function resolveDeliveryWorkspaceReminderMismatch(input: {
  reminderNotificationId: string
  resolutionNote: string | null
  workspaceId: string
}) {
  const supabase = await createSupabaseServerClient()
  const updatedAt = new Date().toISOString()

  const { error } = await supabase
    .from("delivery_workspaces")
    .update({
      reminder_mismatch_resolved_at: updatedAt,
      reminder_mismatch_resolved_notification_id: input.reminderNotificationId,
      reminder_mismatch_resolution_note: input.resolutionNote,
      updated_at: updatedAt
    })
    .eq("id", input.workspaceId)

  if (error) {
    throw new Error("Failed to resolve delivery reminder mismatch")
  }
}

export async function updateDeliveryWorkspaceFollowUp(input: {
  followUpDueOn: string | null
  followUpNote: string | null
  followUpStatus: DeliveryFollowUpStatus
  ownerId: string
  workspaceId: string
}) {
  const supabase = await createSupabaseServerClient()
  const updatedAt = new Date().toISOString()

  const { data, error } = await supabase
    .from("delivery_workspaces")
    .update({
      follow_up_due_on: input.followUpDueOn,
      follow_up_note: input.followUpNote,
      follow_up_status: input.followUpStatus,
      follow_up_updated_at: updatedAt,
      updated_at: updatedAt
    })
    .eq("id", input.workspaceId)
    .eq("owner_id", input.ownerId)
    .select(deliveryWorkspaceSelection)
    .single()

  if (error) {
    throw new Error("Failed to update delivery workspace follow-up")
  }

  return normalizeDeliveryWorkspace(
    data as DeliveryWorkspaceRecord & {
      approval_summary: unknown
      follow_up_status: unknown
    }
  )
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
      follow_up_status: unknown
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
      follow_up_status: unknown
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
      follow_up_status: unknown
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
