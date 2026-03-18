import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ExportRecord } from "@/server/database/types"

const exportSelection =
  "id, project_id, concept_id, owner_id, asset_id, status, version, variant_key, aspect_ratio, platform_preset, render_metadata, created_at, updated_at"

export async function listExportsByProjectIdForOwner(
  projectId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("exports")
    .select(exportSelection)
    .eq("project_id", projectId)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list exports")
  }

  return (data ?? []) as ExportRecord[]
}

export async function getLatestExportByProjectIdForOwner(
  projectId: string,
  ownerId: string
) {
  const exports = await listExportsByProjectIdForOwner(projectId, ownerId)
  return exports[0] ?? null
}

export async function getExportByIdForOwner(exportId: string, ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("exports")
    .select(exportSelection)
    .eq("id", exportId)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load export")
  }

  return (data ?? null) as ExportRecord | null
}
