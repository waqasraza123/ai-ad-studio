import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ApprovalRecord } from "@/server/database/types"

const approvalSelection =
  "id, owner_id, project_id, job_id, concept_id, status, decision_note, requested_at, decided_at, created_at"

export async function listApprovalsByProjectIdForOwner(
  projectId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("approvals")
    .select(approvalSelection)
    .eq("project_id", projectId)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list approvals")
  }

  return (data ?? []) as ApprovalRecord[]
}

export async function getLatestApprovalByProjectIdForOwner(
  projectId: string,
  ownerId: string
) {
  const approvals = await listApprovalsByProjectIdForOwner(projectId, ownerId)
  return approvals[0] ?? null
}

export async function getApprovalByJobIdForOwner(
  jobId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("approvals")
    .select(approvalSelection)
    .eq("job_id", jobId)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load approval")
  }

  return (data ?? null) as ApprovalRecord | null
}

export async function updateApprovalDecision(input: {
  approvalId: string
  ownerId: string
  status: "approved" | "rejected"
  decisionNote: string | null
}) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("approvals")
    .update({
      decision_note: input.decisionNote,
      decided_at: new Date().toISOString(),
      status: input.status
    })
    .eq("id", input.approvalId)
    .eq("owner_id", input.ownerId)
    .select(approvalSelection)
    .single()

  if (error) {
    throw new Error("Failed to update approval decision")
  }

  return data as ApprovalRecord
}
