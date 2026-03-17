import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ProjectRecord } from "@/server/database/types"

export async function listProjectsByOwner(ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("projects")
    .select("id, owner_id, name, status, selected_concept_id, created_at, updated_at")
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
    .select("id, owner_id, name, status, selected_concept_id, created_at, updated_at")
    .eq("id", projectId)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load project")
  }

  return (data ?? null) as ProjectRecord | null
}
