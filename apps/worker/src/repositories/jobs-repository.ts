import type { SupabaseClient } from "@supabase/supabase-js"

export type WorkerJobRecord = {
  id: string
  project_id: string
  owner_id: string
  type: "generate_concepts" | "generate_concept_preview" | "render_final_ad" | "cleanup_assets"
  status: "queued" | "running" | "waiting_provider" | "succeeded" | "failed" | "cancelled"
  provider: string | null
  provider_job_id: string | null
  payload: Record<string, unknown>
  result: Record<string, unknown>
  error: Record<string, unknown>
  attempts: number
  max_attempts: number
  scheduled_at: string
  started_at: string | null
  finished_at: string | null
  heartbeat_at: string | null
  created_at: string
  updated_at: string
}

const jobSelection =
  "id, project_id, owner_id, type, status, provider, provider_job_id, payload, result, error, attempts, max_attempts, scheduled_at, started_at, finished_at, heartbeat_at, created_at, updated_at"

export async function claimNextQueuedJob(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("jobs")
    .select(jobSelection)
    .eq("status", "queued")
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load queued job")
  }

  if (!data) {
    return null
  }

  const { data: updatedJob, error: updateError } = await supabase
    .from("jobs")
    .update({
      attempts: data.attempts + 1,
      heartbeat_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      status: "running"
    })
    .eq("id", data.id)
    .eq("status", "queued")
    .select(jobSelection)
    .maybeSingle()

  if (updateError) {
    throw new Error("Failed to claim job")
  }

  return (updatedJob ?? null) as WorkerJobRecord | null
}

export async function markJobSucceeded(
  supabase: SupabaseClient,
  input: {
    jobId: string
    result: Record<string, unknown>
  }
) {
  const { error } = await supabase
    .from("jobs")
    .update({
      finished_at: new Date().toISOString(),
      result: input.result,
      status: "succeeded"
    })
    .eq("id", input.jobId)

  if (error) {
    throw new Error("Failed to mark job succeeded")
  }
}

export async function markJobFailed(
  supabase: SupabaseClient,
  input: {
    error: Record<string, unknown>
    jobId: string
  }
) {
  const { error } = await supabase
    .from("jobs")
    .update({
      error: input.error,
      finished_at: new Date().toISOString(),
      status: "failed"
    })
    .eq("id", input.jobId)

  if (error) {
    throw new Error("Failed to mark job failed")
  }
}
