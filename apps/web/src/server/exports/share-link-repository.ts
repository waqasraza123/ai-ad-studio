import "server-only"
import { randomUUID } from "node:crypto"
import { createClient } from "@supabase/supabase-js"
import { getServerEnvironment } from "@/lib/env"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  AssetRecord,
  ExportRecord,
  ProjectRecord,
  ShareLinkRecord
} from "@/server/database/types"

const shareLinkSelection =
  "id, project_id, export_id, owner_id, token, is_active, created_at"

const exportSelection =
  "id, project_id, concept_id, owner_id, asset_id, status, version, variant_key, aspect_ratio, platform_preset, render_metadata, created_at, updated_at"

const projectSelection =
  "id, owner_id, name, status, selected_concept_id, created_at, updated_at"

const assetSelection =
  "id, project_id, owner_id, kind, storage_key, mime_type, width, height, duration_ms, metadata, created_at"

function createShareToken() {
  return randomUUID().replaceAll("-", "")
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

export async function listShareLinksByProjectIdForOwner(
  projectId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("share_links")
    .select(shareLinkSelection)
    .eq("project_id", projectId)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list share links")
  }

  return (data ?? []) as ShareLinkRecord[]
}

export async function getShareLinkByExportIdForOwner(
  exportId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("share_links")
    .select(shareLinkSelection)
    .eq("export_id", exportId)
    .eq("owner_id", ownerId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load share link")
  }

  return (data ?? null) as ShareLinkRecord | null
}

export async function createShareLink(input: {
  exportId: string
  ownerId: string
  projectId: string
}) {
  const supabase = await createSupabaseServerClient()

  const existingShareLink = await getShareLinkByExportIdForOwner(
    input.exportId,
    input.ownerId
  )

  if (existingShareLink) {
    return existingShareLink
  }

  const { data, error } = await supabase
    .from("share_links")
    .insert({
      export_id: input.exportId,
      owner_id: input.ownerId,
      project_id: input.projectId,
      token: createShareToken()
    })
    .select(shareLinkSelection)
    .single()

  if (error) {
    throw new Error("Failed to create share link")
  }

  return data as ShareLinkRecord
}

export async function getShareLinkByToken(token: string) {
  const supabase = createPrivilegedSupabaseClient()

  const { data, error } = await supabase
    .from("share_links")
    .select(shareLinkSelection)
    .eq("token", token)
    .eq("is_active", true)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load public share link")
  }

  return (data ?? null) as ShareLinkRecord | null
}

export async function getSharedExportBundleByToken(token: string) {
  const supabase = createPrivilegedSupabaseClient()

  const { data: shareLink, error: shareLinkError } = await supabase
    .from("share_links")
    .select(shareLinkSelection)
    .eq("token", token)
    .eq("is_active", true)
    .maybeSingle()

  if (shareLinkError) {
    throw new Error("Failed to load shared link")
  }

  if (!shareLink) {
    return null
  }

  const { data: exportRecord, error: exportError } = await supabase
    .from("exports")
    .select(exportSelection)
    .eq("id", shareLink.export_id)
    .maybeSingle()

  if (exportError) {
    throw new Error("Failed to load shared export")
  }

  if (!exportRecord) {
    return null
  }

  const [{ data: project, error: projectError }, { data: asset, error: assetError }] =
    await Promise.all([
      supabase
        .from("projects")
        .select(projectSelection)
        .eq("id", shareLink.project_id)
        .maybeSingle(),
      exportRecord.asset_id
        ? supabase
            .from("assets")
            .select(assetSelection)
            .eq("project_id", shareLink.project_id)
            .eq("id", exportRecord.asset_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null })
    ])

  if (projectError) {
    throw new Error("Failed to load shared project")
  }

  if (assetError) {
    throw new Error("Failed to load shared asset")
  }

  if (!project) {
    return null
  }

  return {
    asset: (asset ?? null) as AssetRecord | null,
    exportRecord: exportRecord as ExportRecord,
    project: project as ProjectRecord,
    shareLink: shareLink as ShareLinkRecord
  }
}
