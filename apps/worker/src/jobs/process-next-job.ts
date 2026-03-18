import type { SupabaseClient } from "@supabase/supabase-js"
import { executeJob } from "./execute-job"
import { claimNextJob } from "@/repositories/jobs-repository"

export async function processNextJob(supabase: SupabaseClient) {
  const job = await claimNextJob(supabase)

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
