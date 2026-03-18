import { hasWorkerEnvironmentConfiguration, getWorkerEnvironment } from "@/lib/env"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import { executeJob } from "@/jobs/execute-job"
import { createLongRunningQueueNotifications } from "@/notifications/notification-service"
import { claimNextJob, refreshJobHeartbeat } from "@/repositories/jobs-repository"

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

async function runWorkerLoop() {
  if (!hasWorkerEnvironmentConfiguration()) {
    console.log("[worker] Supabase worker environment is not configured. Waiting for credentials.")
    return
  }

  const environment = getWorkerEnvironment()
  const supabase = createSupabaseAdminClient()

  for (;;) {
    try {
      await createLongRunningQueueNotifications(supabase)

      const job = await claimNextJob(supabase)

      if (!job) {
        await wait(environment.WORKER_POLL_INTERVAL_MS)
        continue
      }

      await refreshJobHeartbeat(supabase, job.id)
      await executeJob(supabase, job)
    } catch (error) {
      console.error(error)
      await wait(environment.WORKER_POLL_INTERVAL_MS)
    }
  }
}

void runWorkerLoop()
