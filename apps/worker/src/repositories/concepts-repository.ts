import type { SupabaseClient } from "@supabase/supabase-js"

export type WorkerConceptRecord = {
  id: string
  project_id: string
  owner_id: string
  title: string
  angle: string
  hook: string
  script: string
  caption_style: string | null
  visual_direction: string | null
  status:
    | "planned"
    | "preview_generating"
    | "preview_ready"
    | "selected"
    | "render_queued"
    | "rendered"
    | "failed"
  sort_order: number
  created_at: string
  updated_at: string
}

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

const conceptSelection =
  "id, project_id, owner_id, title, angle, hook, script, caption_style, visual_direction, status, sort_order, created_at, updated_at"

export async function listConceptsByProjectId(
  supabase: SupabaseClient,
  projectId: string
) {
  const { data, error } = await supabase
    .from("concepts")
    .select(conceptSelection)
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })

  if (error) {
    throw new Error("Failed to load concepts")
  }

  return (data ?? []) as WorkerConceptRecord[]
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

export async function updateConceptStatus(
  supabase: SupabaseClient,
  input: {
    conceptId: string
    status: WorkerConceptRecord["status"]
  }
) {
  const { error } = await supabase
    .from("concepts")
    .update({
      status: input.status
    })
    .eq("id", input.conceptId)

  if (error) {
    throw new Error("Failed to update concept status")
  }
}
