import type { SupabaseClient } from "@supabase/supabase-js"

export type WorkerAssetRecord = {
  id: string
  project_id: string
  owner_id: string
  kind:
    | "product_image"
    | "logo"
    | "concept_preview"
    | "storyboard_frame"
    | "scene_video"
    | "voiceover_audio"
    | "export_video"
  storage_key: string
  mime_type: string
  width: number | null
  height: number | null
  duration_ms: number | null
  metadata: Record<string, unknown>
  created_at: string
}

const assetSelection =
  "id, project_id, owner_id, kind, storage_key, mime_type, width, height, duration_ms, metadata, created_at"

export async function listProjectAssetsByProjectId(
  supabase: SupabaseClient,
  projectId: string
) {
  const { data, error } = await supabase
    .from("assets")
    .select(assetSelection)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to load project assets")
  }

  return (data ?? []) as WorkerAssetRecord[]
}
