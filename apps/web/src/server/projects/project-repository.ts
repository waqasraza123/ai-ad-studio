import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ProjectRecord, ProjectStatus } from "@/server/database/types"

const projectSelection =
  "id, owner_id, name, status, selected_concept_id, created_at, updated_at"

export async function createProject(input: { name: string; ownerId: string }) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: input.name,
      owner_id: input.ownerId
    })
    .select(projectSelection)
    .single()

  if (error) {
    throw new Error("Failed to create project")
  }

  return data as ProjectRecord
}

export async function listProjectsByOwner(ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("projects")
    .select(projectSelection)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list projects")
  }

  return (data ?? []) as ProjectRecord[]
}

export async function getProjectByIdForOwner(projectId: string, ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("projects")
    .select(projectSelection)
    .eq("id", projectId)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load project")
  }

  return (data ?? null) as ProjectRecord | null
}

export async function updateProjectStatus(input: {
  ownerId: string
  projectId: string
  status: ProjectStatus
}) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("projects")
    .update({
      status: input.status
    })
    .eq("id", input.projectId)
    .eq("owner_id", input.ownerId)
    .select(projectSelection)
    .single()

  if (error) {
    throw new Error("Failed to update project status")
  }

  return data as ProjectRecord
}

export async function selectConceptForProject(input: {
  conceptId: string
  ownerId: string
  projectId: string
}) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("projects")
    .update({
      selected_concept_id: input.conceptId
    })
    .eq("id", input.projectId)
    .eq("owner_id", input.ownerId)
    .select(projectSelection)
    .single()

  if (error) {
    throw new Error("Failed to select concept for project")
  }

  return data as ProjectRecord
}
