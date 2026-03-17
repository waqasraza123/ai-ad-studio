import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { JobRecord, JobType } from "@/server/database/types"

const jobSelection =
  "id, project_id, owner_id, type, status, provider, provider_job_id, payload, result, error, attempts, max_attempts, scheduled_at, started_at, finished_at, heartbeat_at, created_at, updated_at"

export async function listJobsByProjectIdForOwner(projectId: string, ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("jobs")
    .select(jobSelection)
    .eq("project_id", projectId)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list jobs")
  }

  return (data ?? []) as JobRecord[]
}

export async function createJob(input: {
  ownerId: string
  projectId: string
  type: JobType
  payload: Record<string, unknown>
}) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      owner_id: input.ownerId,
      project_id: input.projectId,
      type: input.type,
      payload: input.payload
    })
    .select(jobSelection)
    .single()

  if (error) {
    throw new Error("Failed to create job")
  }

  return data as JobRecord
}
