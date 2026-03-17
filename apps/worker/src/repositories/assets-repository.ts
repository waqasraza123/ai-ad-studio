import type { SupabaseClient } from "@supabase/supabase-js"

type ConceptPreviewAssetInsertRecord = {
  kind: "concept_preview"
  metadata: Record<string, unknown>
  mime_type: "image/svg+xml"
  owner_id: string
  project_id: string
  storage_key: string
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
