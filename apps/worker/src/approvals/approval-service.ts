import type { SupabaseClient } from "@supabase/supabase-js"

type ApprovalRecord = {
  id: string
  owner_id: string
  project_id: string
  job_id: string
  concept_id: string | null
  status: "pending" | "approved" | "rejected"
  decision_note: string | null
  requested_at: string
  decided_at: string | null
  created_at: string
}

const approvalSelection =
  "id, owner_id, project_id, job_id, concept_id, status, decision_note, requested_at, decided_at, created_at"

export async function ensureRenderApproval(
  supabase: SupabaseClient,
  input: {
    ownerId: string
    projectId: string
    jobId: string
    conceptId: string | null
  }
) {
  const { data: existing, error: existingError } = await supabase
    .from("approvals")
    .select(approvalSelection)
    .eq("job_id", input.jobId)
    .eq("owner_id", input.ownerId)
    .maybeSingle()

  if (existingError) {
    throw new Error("Failed to load render approval")
  }

  if (existing) {
    return existing as ApprovalRecord
  }

  const { data, error } = await supabase
    .from("approvals")
    .insert({
      concept_id: input.conceptId,
      job_id: input.jobId,
      owner_id: input.ownerId,
      project_id: input.projectId,
      status: "pending"
    })
    .select(approvalSelection)
    .single()

  if (error) {
    throw new Error("Failed to create render approval")
  }

  return data as ApprovalRecord
}

export async function getApprovalByJobId(
  supabase: SupabaseClient,
  jobId: string
) {
  const { data, error } = await supabase
    .from("approvals")
    .select(approvalSelection)
    .eq("job_id", jobId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load approval by job id")
  }

  return (data ?? null) as ApprovalRecord | null
}
