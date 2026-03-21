import { getWorkerEnvironment, hasWorkerEnvironmentConfiguration } from "@/lib/env"
import { executeJob } from "@/jobs/execute-job"
import { createLongRunningQueueNotifications } from "@/notifications/notification-service"
import { claimNextJob, refreshJobHeartbeat } from "@/repositories/jobs-repository"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

function getMissingConfigurationPollIntervalMilliseconds() {
  const parsedValue = Number(process.env.WORKER_POLL_INTERVAL_MS ?? "3000")

  if (Number.isInteger(parsedValue) && parsedValue > 0) {
    return parsedValue
  }

  return 3000
}

async function runWorkerLoop() {
  let hasLoggedMissingConfiguration = false

  for (;;) {
    if (!hasWorkerEnvironmentConfiguration()) {
      if (!hasLoggedMissingConfiguration) {
        console.log(
          "[worker] Supabase worker environment is not configured. Waiting for credentials."
        )
        hasLoggedMissingConfiguration = true
      }

      await wait(getMissingConfigurationPollIntervalMilliseconds())
      continue
    }

    hasLoggedMissingConfiguration = false

    const environment = getWorkerEnvironment()
    const supabase = createSupabaseAdminClient()

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
