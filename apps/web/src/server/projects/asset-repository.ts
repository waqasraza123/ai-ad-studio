import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { CreateAssetPlaceholderInput } from "@/features/projects/schemas/project-schema"
import type { AssetRecord, AssetKind } from "@/server/database/types"

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

export async function createUploadedAssetRecord(input: {
  kind: Extract<AssetKind, "product_image" | "logo">
  metadata: CreateAssetPlaceholderInput
  ownerId: string
  storageKey: string
}) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("assets")
    .insert({
      kind: input.kind,
      metadata: {
        originalFileName: input.metadata.fileName,
        sizeBytes: input.metadata.sizeBytes,
        uploadStatus: "uploaded"
      },
      mime_type: input.metadata.mimeType,
      owner_id: input.ownerId,
      project_id: input.metadata.projectId,
      storage_key: input.storageKey
    })
    .select(assetSelection)
    .single()

  if (error) {
    throw new Error("Failed to create uploaded asset record")
  }

  return data as AssetRecord
}
