import type { SupabaseClient } from "@supabase/supabase-js"

export async function createExportRecord(
  supabase: SupabaseClient,
  input: {
    assetId: string
    conceptId: string
    ownerId: string
    projectId: string
    renderMetadata: Record<string, unknown>
    variantKey: string
  }
) {
  const { data, error } = await supabase
    .from("exports")
    .insert({
      asset_id: input.assetId,
      concept_id: input.conceptId,
      owner_id: input.ownerId,
      project_id: input.projectId,
      render_metadata: input.renderMetadata,
      status: "ready",
      variant_key: input.variantKey
    })
    .select("id, project_id, concept_id, owner_id, asset_id, status, version, variant_key, render_metadata, created_at, updated_at")
    .single()

  if (error) {
    throw new Error("Failed to create export record")
  }

  return data as {
    id: string
    project_id: string
    concept_id: string
    owner_id: string
    asset_id: string
    status: "ready"
    version: number
    variant_key: string
    render_metadata: Record<string, unknown>
    created_at: string
    updated_at: string
  }
}
