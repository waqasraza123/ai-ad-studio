import type { SupabaseClient } from "@supabase/supabase-js"

type NotificationInsertRecord = {
  owner_id: string
  project_id?: string | null
  export_id?: string | null
  job_id?: string | null
  kind: string
  title: string
  body: string
  severity: "info" | "success" | "warning" | "error"
  action_url?: string | null
  metadata?: Record<string, unknown>
}

async function hasRecentNotification(
  supabase: SupabaseClient,
  input: {
    ownerId: string
    jobId: string | null
    kind: string
    sinceIso: string
  }
) {
  const query = supabase
    .from("notifications")
    .select("id", {
      head: true,
      count: "exact"
    })
    .eq("owner_id", input.ownerId)
    .eq("kind", input.kind)
    .gte("created_at", input.sinceIso)

  const scopedQuery = input.jobId ? query.eq("job_id", input.jobId) : query.is("job_id", null)
  const { count, error } = await scopedQuery

  if (error) {
    throw new Error("Failed to inspect recent notifications")
  }

  return (count ?? 0) > 0
}

export async function createNotifications(
  supabase: SupabaseClient,
  notifications: NotificationInsertRecord[]
) {
  if (notifications.length === 0) {
    return
  }

  const { error } = await supabase.from("notifications").insert(
    notifications.map((notification) => ({
      action_url: notification.action_url ?? null,
      body: notification.body,
      export_id: notification.export_id ?? null,
      job_id: notification.job_id ?? null,
      kind: notification.kind,
      metadata: notification.metadata ?? {},
      owner_id: notification.owner_id,
      project_id: notification.project_id ?? null,
      severity: notification.severity,
      title: notification.title
    }))
  )

  if (error) {
    throw new Error("Failed to create notifications")
  }
}

export async function createLongRunningQueueNotifications(
  supabase: SupabaseClient
) {
  const queuedThresholdIso = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const runningThresholdIso = new Date(Date.now() - 20 * 60 * 1000).toISOString()
  const dedupeSinceIso = new Date(Date.now() - 30 * 60 * 1000).toISOString()

  const { data: queuedJobs, error: queuedError } = await supabase
    .from("jobs")
    .select("id, owner_id, project_id, type, status, scheduled_at, created_at")
    .eq("status", "queued")
    .lt("scheduled_at", queuedThresholdIso)
    .is("cancel_requested_at", null)
    .limit(25)

  if (queuedError) {
    throw new Error("Failed to inspect queued jobs")
  }

  const { data: runningJobs, error: runningError } = await supabase
    .from("jobs")
    .select("id, owner_id, project_id, type, status, heartbeat_at, started_at")
    .eq("status", "running")
    .lt("heartbeat_at", runningThresholdIso)
    .limit(25)

  if (runningError) {
    throw new Error("Failed to inspect running jobs")
  }

  const notifications: NotificationInsertRecord[] = []

  for (const job of queuedJobs ?? []) {
    const alreadyExists = await hasRecentNotification(supabase, {
      jobId: job.id,
      kind: "queue_long_wait",
      ownerId: job.owner_id,
      sinceIso: dedupeSinceIso
    })

    if (!alreadyExists) {
      notifications.push({
        action_url: `/dashboard/debug/jobs/${job.id}`,
        body: `A queued ${job.type} job appears stuck in the queue and has not started within the expected window.`,
        job_id: job.id,
        kind: "queue_long_wait",
        metadata: {
          status: job.status
        },
        owner_id: job.owner_id,
        project_id: job.project_id,
        severity: "warning",
        title: "Queued job waiting too long"
      })
    }
  }

  for (const job of runningJobs ?? []) {
    const alreadyExists = await hasRecentNotification(supabase, {
      jobId: job.id,
      kind: "queue_stalled_running",
      ownerId: job.owner_id,
      sinceIso: dedupeSinceIso
    })

    if (!alreadyExists) {
      notifications.push({
        action_url: `/dashboard/debug/jobs/${job.id}`,
        body: `A running ${job.type} job has not refreshed its heartbeat recently and may need inspection or cancellation.`,
        job_id: job.id,
        kind: "queue_stalled_running",
        metadata: {
          status: job.status
        },
        owner_id: job.owner_id,
        project_id: job.project_id,
        severity: "warning",
        title: "Running job may be stalled"
      })
    }
  }

  await createNotifications(supabase, notifications)
}
