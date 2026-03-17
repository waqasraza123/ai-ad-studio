import type { SupabaseClient } from "@supabase/supabase-js"
import { executeJob } from "./execute-job"
import { claimNextQueuedJob } from "@/repositories/jobs-repository"

export async function processNextJob(supabase: SupabaseClient) {
  const job = await claimNextQueuedJob(supabase)

  if (!job) {
    return {
      processed: false
    }
  }

  await executeJob(supabase, job)

  return {
    jobId: job.id,
    processed: true,
    type: job.type
  }
}
