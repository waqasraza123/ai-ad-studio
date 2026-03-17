import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ConceptRecord } from "@/server/database/types"

const conceptSelection =
  "id, project_id, owner_id, title, angle, hook, script, caption_style, visual_direction, status, sort_order, created_at, updated_at"

export async function listConceptsByProjectIdForOwner(
  projectId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("concepts")
    .select(conceptSelection)
    .eq("project_id", projectId)
    .eq("owner_id", ownerId)
    .order("sort_order", { ascending: true })

  if (error) {
    throw new Error("Failed to list concepts")
  }

  return (data ?? []) as ConceptRecord[]
}
