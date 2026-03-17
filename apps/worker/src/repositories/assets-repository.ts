import type { SupabaseClient } from "@supabase/supabase-js"

type ConceptPreviewAssetInsertRecord = {
  kind: "concept_preview"
  metadata: Record<string, unknown>
  mime_type: "image/svg+xml" | "image/webp"
  owner_id: string
  project_id: string
  storage_key: string
}

type RenderAssetInsertRecord = {
  kind: "export_video"
  metadata: Record<string, unknown>
  mime_type: string
  owner_id: string
  project_id: string
  storage_key: string
  duration_ms?: number | null
  height?: number | null
  width?: number | null
}

export async function deleteConceptPreviewAssetsByProjectId(
  supabase: SupabaseClient,
  projectId: string
) {
  const { error } = await supabase
    .from("assets")
    .delete()
    .eq("project_id", projectId)
    .eq("kind", "concept_preview")

  if (error) {
    throw new Error("Failed to clear concept preview assets")
  }
}

export async function createConceptPreviewAssets(
  supabase: SupabaseClient,
  assets: ConceptPreviewAssetInsertRecord[]
) {
  const { error } = await supabase.from("assets").insert(assets)

  if (error) {
    throw new Error("Failed to create concept preview assets")
  }
}

export async function createRenderAsset(
  supabase: SupabaseClient,
  asset: RenderAssetInsertRecord
) {
  const { data, error } = await supabase
    .from("assets")
    .insert(asset)
    .select(
      "id, project_id, owner_id, kind, storage_key, mime_type, width, height, duration_ms, metadata, created_at"
    )
    .single()

  if (error) {
    throw new Error("Failed to create render asset")
  }

  return data as {
    id: string
    project_id: string
    owner_id: string
    kind: "export_video"
    storage_key: string
    mime_type: string
    width: number | null
    height: number | null
    duration_ms: number | null
    metadata: Record<string, unknown>
    created_at: string
  }
}
