import type { SupabaseClient } from "@supabase/supabase-js"

export type ConceptInsertRecord = {
  angle: string
  caption_style: string
  hook: string
  owner_id: string
  project_id: string
  script: string
  sort_order: number
  status: "planned"
  title: string
  visual_direction: string
}

export async function deleteConceptsByProjectId(
  supabase: SupabaseClient,
  projectId: string
) {
  const { error } = await supabase.from("concepts").delete().eq("project_id", projectId)

  if (error) {
    throw new Error("Failed to clear existing concepts")
  }
}

export async function createConceptsForProject(
  supabase: SupabaseClient,
  concepts: ConceptInsertRecord[]
) {
  const { error } = await supabase.from("concepts").insert(concepts)

  if (error) {
    throw new Error("Failed to create concepts")
  }
}
