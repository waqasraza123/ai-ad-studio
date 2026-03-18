import type { SupabaseClient } from "@supabase/supabase-js"

export type WorkerProjectRecord = {
  id: string
  owner_id: string
  name: string
  status: "draft" | "generating_concepts" | "concepts_ready" | "rendering" | "export_ready" | "failed"
  selected_concept_id: string | null
  template_id: string | null
  created_at: string
  updated_at: string
}

export type WorkerProjectInputRecord = {
  project_id: string
  owner_id: string
  product_name: string | null
  product_description: string | null
  offer_text: string | null
  call_to_action: string | null
  target_audience: string | null
  brand_tone: string | null
  visual_style: string | null
  duration_seconds: number
  aspect_ratio: string
  created_at: string
  updated_at: string
}

const projectSelection =
  "id, owner_id, name, status, selected_concept_id, template_id, created_at, updated_at"

const projectInputSelection =
  "project_id, owner_id, product_name, product_description, offer_text, call_to_action, target_audience, brand_tone, visual_style, duration_seconds, aspect_ratio, created_at, updated_at"

export async function getProjectById(
  supabase: SupabaseClient,
  projectId: string
) {
  const { data, error } = await supabase
    .from("projects")
    .select(projectSelection)
    .eq("id", projectId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load project")
  }

  return (data ?? null) as WorkerProjectRecord | null
}

export async function getProjectInputByProjectId(
  supabase: SupabaseClient,
  projectId: string
) {
  const { data, error } = await supabase
    .from("project_inputs")
    .select(projectInputSelection)
    .eq("project_id", projectId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load project input")
  }

  return (data ?? null) as WorkerProjectInputRecord | null
}

export async function updateProjectStatus(
  supabase: SupabaseClient,
  input: {
    projectId: string
    status: WorkerProjectRecord["status"]
  }
) {
  const { error } = await supabase
    .from("projects")
    .update({
      status: input.status
    })
    .eq("id", input.projectId)

  if (error) {
    throw new Error("Failed to update project status")
  }
}
