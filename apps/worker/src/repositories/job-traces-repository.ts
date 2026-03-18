import type { SupabaseClient } from "@supabase/supabase-js"

export type JobTraceInsertRecord = {
  job_id: string
  project_id: string
  owner_id: string
  trace_type: string
  stage: string
  payload: Record<string, unknown>
}

export async function createJobTrace(
  supabase: SupabaseClient,
  trace: JobTraceInsertRecord
) {
  const { error } = await supabase.from("job_traces").insert(trace)

  if (error) {
    throw new Error("Failed to create job trace")
  }
}

export async function createJobTraces(
  supabase: SupabaseClient,
  traces: JobTraceInsertRecord[]
) {
  if (traces.length === 0) {
    return
  }

  const { error } = await supabase.from("job_traces").insert(traces)

  if (error) {
    throw new Error("Failed to create job traces")
  }
}
