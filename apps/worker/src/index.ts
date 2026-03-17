import { createWorkerSupabaseClient } from "./lib/supabase"
import {
  getWorkerEnvironment,
  hasWorkerEnvironmentConfiguration
} from "./lib/env"
import { processNextJob } from "./jobs/process-next-job"

function log(message: string) {
  console.log(`[worker] ${message}`)
}

async function run() {
  if (!hasWorkerEnvironmentConfiguration()) {
    log("Supabase worker environment is not configured. Waiting for credentials.")
    return
  }

  const environment = getWorkerEnvironment()
  const supabase = createWorkerSupabaseClient()

  log(`AI Ad Studio worker booted. Poll interval: ${environment.WORKER_POLL_INTERVAL_MS}ms`)

  const tick = async () => {
    try {
      const result = await processNextJob(supabase)

      if (result.processed) {
        log(`Processed job ${result.jobId} (${result.type})`)
      }
    } catch (error) {
      log(
        error instanceof Error
          ? `Job processing failed: ${error.message}`
          : "Job processing failed"
      )
    }
  }

  await tick()
  setInterval(tick, environment.WORKER_POLL_INTERVAL_MS)
}

void run()
