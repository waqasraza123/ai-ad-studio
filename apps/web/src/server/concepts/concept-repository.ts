import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ConceptRecord, ConceptStatus } from "@/server/database/types"

const conceptSelection =
  "id, project_id, owner_id, title, angle, hook, script, caption_style, visual_direction, status, sort_order, risk_flags, safety_notes, was_safety_modified, created_at, updated_at"

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

  return ((data ?? []) as unknown as ConceptRecord[]).map((concept) => ({
    ...concept,
    risk_flags: Array.isArray(concept.risk_flags) ? concept.risk_flags : []
  }))
}

export async function getConceptByIdForOwner(conceptId: string, ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("concepts")
    .select(conceptSelection)
    .eq("id", conceptId)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load concept")
  }

  if (!data) {
    return null
  }

  return {
    ...(data as unknown as ConceptRecord),
    risk_flags: Array.isArray((data as { risk_flags?: unknown }).risk_flags)
      ? ((data as { risk_flags: string[] }).risk_flags ?? [])
      : []
  } satisfies ConceptRecord
}

export async function updateConceptStatusForProject(input: {
  ownerId: string
  projectId: string
  status: ConceptStatus
}) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("concepts")
    .update({
      status: input.status
    })
    .eq("project_id", input.projectId)
    .eq("owner_id", input.ownerId)

  if (error) {
    throw new Error("Failed to update concept statuses")
  }
}

export async function updateConceptStatusForOwner(input: {
  conceptId: string
  ownerId: string
  status: ConceptStatus
}) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("concepts")
    .update({
      status: input.status
    })
    .eq("id", input.conceptId)
    .eq("owner_id", input.ownerId)

  if (error) {
    throw new Error("Failed to update concept status")
  }
}
