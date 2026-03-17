import "server-only"
import { randomUUID } from "node:crypto"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { CreateAssetPlaceholderInput } from "@/features/projects/schemas/project-schema"
import type { AssetRecord } from "@/server/database/types"

const assetSelection =
  "id, project_id, owner_id, kind, storage_key, mime_type, width, height, duration_ms, metadata, created_at"

export async function listAssetsByProjectIdForOwner(projectId: string, ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("assets")
    .select(assetSelection)
    .eq("project_id", projectId)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list project assets")
  }

  return (data ?? []) as AssetRecord[]
}

export async function listConceptPreviewAssetsByProjectIdForOwner(
  projectId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("assets")
    .select(assetSelection)
    .eq("project_id", projectId)
    .eq("owner_id", ownerId)
    .eq("kind", "concept_preview")
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error("Failed to list concept preview assets")
  }

  return (data ?? []) as AssetRecord[]
}

export async function createAssetRecord(input: {
  ownerId: string
  placeholder: CreateAssetPlaceholderInput
}) {
  const supabase = await createSupabaseServerClient()
  const generatedAssetId = randomUUID()

  const { data, error } = await supabase
    .from("assets")
    .insert({
      id: generatedAssetId,
      owner_id: input.ownerId,
      project_id: input.placeholder.projectId,
      kind: input.placeholder.kind,
      storage_key: `pending/${input.placeholder.projectId}/${generatedAssetId}/${input.placeholder.fileName}`,
      mime_type: input.placeholder.mimeType,
      metadata: {
        originalFileName: input.placeholder.fileName,
        sizeBytes: input.placeholder.sizeBytes,
        uploadStatus: "pending_storage"
      }
    })
    .select(assetSelection)
    .single()

  if (error) {
    throw new Error("Failed to create asset record")
  }

  return data as AssetRecord
}
