import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ProjectRecord, ProjectStatus } from "@/server/database/types"

const projectSelection =
  "id, owner_id, name, status, selected_concept_id, template_id, brand_kit_id, canonical_export_id, created_at, updated_at"

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

export async function createProjectForOwner(input: {
  ownerId: string
  name: string
}) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: input.name,
      owner_id: input.ownerId,
      status: "draft"
    })
    .select(projectSelection)
    .single()

  if (error) {
    throw new Error("Failed to create project")
  }

  return data as ProjectRecord
}

export async function updateProjectStatus(input: {
  ownerId: string
  projectId: string
  status: ProjectStatus
}) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("projects")
    .update({
      status: input.status
    })
    .eq("id", input.projectId)
    .eq("owner_id", input.ownerId)

  if (error) {
    throw new Error("Failed to update project status")
  }
}

export async function selectProjectConcept(input: {
  conceptId: string
  ownerId: string
  projectId: string
}) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("projects")
    .update({
      selected_concept_id: input.conceptId
    })
    .eq("id", input.projectId)
    .eq("owner_id", input.ownerId)

  if (error) {
    throw new Error("Failed to select project concept")
  }
}

export async function updateProjectTemplate(input: {
  ownerId: string
  projectId: string
  templateId: string | null
}) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("projects")
    .update({
      template_id: input.templateId
    })
    .eq("id", input.projectId)
    .eq("owner_id", input.ownerId)

  if (error) {
    throw new Error("Failed to update project template")
  }
}

export async function updateProjectBrandKit(input: {
  ownerId: string
  projectId: string
  brandKitId: string | null
}) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("projects")
    .update({
      brand_kit_id: input.brandKitId
    })
    .eq("id", input.projectId)
    .eq("owner_id", input.ownerId)

  if (error) {
    throw new Error("Failed to update project brand kit")
  }
}

export async function updateProjectCanonicalExport(input: {
  ownerId: string
  projectId: string
  exportId: string | null
}) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("projects")
    .update({
      canonical_export_id: input.exportId
    })
    .eq("id", input.projectId)
    .eq("owner_id", input.ownerId)

  if (error) {
    throw new Error("Failed to update project canonical export")
  }
}
