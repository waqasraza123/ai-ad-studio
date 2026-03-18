import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ProjectRecord, ProjectStatus } from "@/server/database/types"

const projectSelection =
  "id, owner_id, name, status, selected_concept_id, created_at, updated_at"

export async function createProject(input: { name: string; ownerId: string }) {
  const supabase = await createSupabaseServerClient()

  // #region agent log
  fetch('http://127.0.0.1:7682/ingest/8799e641-d605-442c-ab12-29862cd0eef4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'42c6b9'},body:JSON.stringify({sessionId:'42c6b9',runId:'create-project-pre',hypothesisId:'CP5',location:'src/server/projects/project-repository.ts:13',message:'createProject:start',data:{ownerIdPresent:Boolean(input.ownerId),nameLength:input.name.length},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: input.name,
      owner_id: input.ownerId
    })
    .select(projectSelection)
    .single()

  if (error) {
    const errorRecord = error as unknown as Record<string, unknown>
    const errorCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof errorRecord.code === "string"
        ? String(errorRecord.code)
        : null
    const errorMessage =
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof errorRecord.message === "string"
        ? String(errorRecord.message)
        : null

    // #region agent log
    fetch('http://127.0.0.1:7682/ingest/8799e641-d605-442c-ab12-29862cd0eef4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'42c6b9'},body:JSON.stringify({sessionId:'42c6b9',runId:'create-project-pre',hypothesisId:'CP6',location:'src/server/projects/project-repository.ts:33',message:'createProject:error',data:{errorCode,errorMessage},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    throw new Error("Failed to create project")
  }

  // #region agent log
  fetch('http://127.0.0.1:7682/ingest/8799e641-d605-442c-ab12-29862cd0eef4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'42c6b9'},body:JSON.stringify({sessionId:'42c6b9',runId:'create-project-pre',hypothesisId:'CP7',location:'src/server/projects/project-repository.ts:40',message:'createProject:success',data:{returnedIdPresent:Boolean((data as { id?: string } | null)?.id)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

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

export async function getProjectByIdForOwner(
  projectId: string,
  ownerId: string
) {
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
