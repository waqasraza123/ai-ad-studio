import type { SupabaseClient } from "@supabase/supabase-js"
import { getOwnerConcurrencyLimitForJob } from "@/billing/billing-limits"
import { getRetryDelaySeconds } from "@/lib/queue/config"

export type WorkerJobRecord = {
  id: string
  project_id: string
  owner_id: string
  type:
    | "generate_concepts"
    | "generate_concept_preview"
    | "render_final_ad"
    | "cleanup_assets"
  status:
    | "queued"
    | "running"
    | "waiting_provider"
    | "succeeded"
    | "failed"
    | "cancelled"
  provider: string | null
  provider_job_id: string | null
  payload: Record<string, unknown>
  result: Record<string, unknown>
  error: Record<string, unknown>
  attempts: number
  max_attempts: number
  scheduled_at: string
  next_attempt_at: string
  cancel_requested_at: string | null
  cancel_reason: string | null
  started_at: string | null
  finished_at: string | null
  heartbeat_at: string | null
  created_at: string
  updated_at: string
}

const jobSelection =
  "id, project_id, owner_id, type, status, provider, provider_job_id, payload, result, error, attempts, max_attempts, scheduled_at, next_attempt_at, cancel_requested_at, cancel_reason, started_at, finished_at, heartbeat_at, created_at, updated_at"

export async function claimNextJob(supabase: SupabaseClient) {
  const nowIso = new Date().toISOString()

  const { data, error } = await supabase
    .from("jobs")
    .select(jobSelection)
    .eq("status", "queued")
    .is("cancel_requested_at", null)
    .lte("scheduled_at", nowIso)
    .lte("next_attempt_at", nowIso)
    .order("next_attempt_at", { ascending: true })
    .order("scheduled_at", { ascending: true })
    .limit(20)

  if (error) {
    throw new Error("Failed to load queued jobs")
  }

  const queuedJobs = (data ?? []) as WorkerJobRecord[]

  for (const queuedJob of queuedJobs) {
    const ownerLimit = await getOwnerConcurrencyLimitForJob(
      supabase,
      queuedJob.owner_id,
      queuedJob.type
    )

    const { count, error: countError } = await supabase
      .from("jobs")
      .select("id", {
        count: "exact",
        head: true
      })
      .eq("owner_id", queuedJob.owner_id)
      .eq("type", queuedJob.type)
      .eq("status", "running")

    if (countError) {
      throw new Error("Failed to count running jobs")
    }

    if ((count ?? 0) >= ownerLimit) {
      continue
    }

    const { data: claimedJob, error: claimError } = await supabase
      .from("jobs")
      .update({
        attempts: queuedJob.attempts + 1,
        heartbeat_at: nowIso,
        started_at: nowIso,
        status: "running"
      })
      .eq("id", queuedJob.id)
      .eq("status", "queued")
      .is("cancel_requested_at", null)
      .select(jobSelection)
      .maybeSingle()

    if (claimError) {
      throw new Error("Failed to claim job")
    }

    if (claimedJob) {
      return claimedJob as WorkerJobRecord
    }
  }

  return null
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
      heartbeat_at: null,
      result: input.result,
      status: "succeeded"
    })
    .eq("id", input.jobId)

  if (error) {
    throw new Error("Failed to mark job as succeeded")
  }
}

export async function markJobBlocked(
  supabase: SupabaseClient,
  input: {
    jobId: string
    reason: string
  }
) {
  const { error } = await supabase
    .from("jobs")
    .update({
      error: {
        reason: input.reason
      },
      finished_at: null,
      heartbeat_at: null,
      started_at: null,
      status: "waiting_provider"
    })
    .eq("id", input.jobId)

  if (error) {
    throw new Error("Failed to mark job as blocked")
  }
}

export async function markJobCancelled(
  supabase: SupabaseClient,
  input: {
    jobId: string
    reason: string
  }
) {
  const nowIso = new Date().toISOString()

  const { error } = await supabase
    .from("jobs")
    .update({
      cancel_reason: input.reason,
      cancel_requested_at: nowIso,
      finished_at: nowIso,
      heartbeat_at: null,
      status: "cancelled"
    })
    .eq("id", input.jobId)

  if (error) {
    throw new Error("Failed to mark job as cancelled")
  }
}

export async function markJobFailed(
  supabase: SupabaseClient,
  input: {
    error: Record<string, unknown>
    jobId: string
    shouldRetry?: boolean
    type?: WorkerJobRecord["type"]
    attempts?: number
  }
) {
  const nowIso = new Date().toISOString()
  const shouldRetry = Boolean(input.shouldRetry)
  const nextAttemptAt =
    shouldRetry && input.type && typeof input.attempts === "number"
      ? new Date(
          Date.now() + getRetryDelaySeconds(input.attempts, input.type) * 1000
        ).toISOString()
      : nowIso

  const updatePayload: Record<string, unknown> = {
    error: input.error,
    finished_at: shouldRetry ? null : nowIso,
    heartbeat_at: null,
    next_attempt_at: nextAttemptAt,
    status: shouldRetry ? "queued" : "failed"
  }

  if (shouldRetry) {
    updatePayload.started_at = null
  }

  const { error } = await supabase
    .from("jobs")
    .update(updatePayload)
    .eq("id", input.jobId)

  if (error) {
    throw new Error("Failed to mark job as failed")
  }
}

export async function refreshJobHeartbeat(
  supabase: SupabaseClient,
  jobId: string
) {
  const { error } = await supabase
    .from("jobs")
    .update({
      heartbeat_at: new Date().toISOString()
    })
    .eq("id", jobId)

  if (error) {
    throw new Error("Failed to refresh job heartbeat")
  }
}

export async function getJobById(
  supabase: SupabaseClient,
  jobId: string
) {
  const { data, error } = await supabase
    .from("jobs")
    .select(jobSelection)
    .eq("id", jobId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load job")
  }

  return (data ?? null) as WorkerJobRecord | null
}
