import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { JobRecord, JobTraceRecord } from "@/server/database/types"

const jobSelection =
  "id, project_id, owner_id, type, status, provider, provider_job_id, payload, result, error, attempts, max_attempts, scheduled_at, next_attempt_at, cancel_requested_at, cancel_reason, started_at, finished_at, heartbeat_at, created_at, updated_at"

const jobTraceSelection =
  "id, job_id, project_id, owner_id, trace_type, stage, payload, created_at"

export async function listAllJobsByOwner(ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("jobs")
    .select(jobSelection)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list jobs")
  }

  return (data ?? []) as JobRecord[]
}

export async function listJobsByProjectIdForOwner(
  projectId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("jobs")
    .select(jobSelection)
    .eq("project_id", projectId)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list project jobs")
  }

  return (data ?? []) as JobRecord[]
}

export async function getJobByIdForOwner(jobId: string, ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("jobs")
    .select(jobSelection)
    .eq("id", jobId)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load job")
  }

  return (data ?? null) as JobRecord | null
}

export async function listJobTracesByJobIdForOwner(
  jobId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("job_traces")
    .select(jobTraceSelection)
    .eq("job_id", jobId)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error("Failed to list job traces")
  }

  return (data ?? []) as JobTraceRecord[]
}

export async function retryFailedJob(input: {
  jobId: string
  ownerId: string
}) {
  const supabase = await createSupabaseServerClient()

  const existingJob = await getJobByIdForOwner(input.jobId, input.ownerId)

  if (!existingJob) {
    throw new Error("Job not found")
  }

  if (existingJob.status !== "failed" && existingJob.status !== "cancelled") {
    throw new Error("Only failed or cancelled jobs can be retried")
  }

  const nowIso = new Date().toISOString()

  const { data, error } = await supabase
    .from("jobs")
    .update({
      cancel_reason: null,
      cancel_requested_at: null,
      error: {},
      finished_at: null,
      heartbeat_at: null,
      next_attempt_at: nowIso,
      provider_job_id: null,
      result: {},
      scheduled_at: nowIso,
      started_at: null,
      status: "queued"
    })
    .eq("id", input.jobId)
    .eq("owner_id", input.ownerId)
    .select(jobSelection)
    .single()

  if (error) {
    throw new Error("Failed to retry job")
  }

  return data as JobRecord
}

export async function cancelJob(input: {
  jobId: string
  ownerId: string
  reason: string
}) {
  const supabase = await createSupabaseServerClient()

  const existingJob = await getJobByIdForOwner(input.jobId, input.ownerId)

  if (!existingJob) {
    throw new Error("Job not found")
  }

  if (
    existingJob.status === "succeeded" ||
    existingJob.status === "failed" ||
    existingJob.status === "cancelled"
  ) {
    throw new Error("Completed jobs cannot be cancelled")
  }

  const nowIso = new Date().toISOString()
  const isQueued =
    existingJob.status === "queued" || existingJob.status === "waiting_provider"

  const { data, error } = await supabase
    .from("jobs")
    .update({
      cancel_reason: input.reason,
      cancel_requested_at: nowIso,
      finished_at: isQueued ? nowIso : existingJob.finished_at,
      status: isQueued ? "cancelled" : existingJob.status
    })
    .eq("id", input.jobId)
    .eq("owner_id", input.ownerId)
    .select(jobSelection)
    .single()

  if (error) {
    throw new Error("Failed to cancel job")
  }

  return data as JobRecord
}
