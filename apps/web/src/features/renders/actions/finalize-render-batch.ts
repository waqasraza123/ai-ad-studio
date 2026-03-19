"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  finalizeRenderBatchDecision,
  getRenderBatchByIdForOwner
} from "@/server/render-batches/render-batch-repository"

function readFinalizationNote(formData: FormData) {
  const value = String(formData.get("finalization_note") ?? "").trim()
  return value.length > 0 ? value : null
}

export async function finalizeRenderBatchAction(
  batchId: string,
  formData: FormData
) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const existingBatch = await getRenderBatchByIdForOwner(batchId, user.id)

  if (!existingBatch) {
    throw new Error("Render batch not found")
  }

  const finalizedBatch = await finalizeRenderBatchDecision({
    batchId,
    finalizationNote: readFinalizationNote(formData),
    ownerId: user.id
  })

  const supabase = await createSupabaseServerClient()

  await supabase.from("job_traces").insert({
    job_id: finalizedBatch.job_id,
    owner_id: user.id,
    payload: {
      finalizationNote: finalizedBatch.finalization_note,
      finalizedExportId: finalizedBatch.finalized_export_id
    },
    project_id: finalizedBatch.project_id,
    stage: "batch_final_decision_locked",
    trace_type: "final_decision"
  })

  await supabase.from("notifications").insert({
    action_url: `/dashboard/exports/${finalizedBatch.finalized_export_id}`,
    body: "The reviewed winner has been finalized and set as the canonical export for this project.",
    export_id: finalizedBatch.finalized_export_id,
    job_id: finalizedBatch.job_id,
    kind: "render_batch_finalized",
    metadata: {
      batchId: finalizedBatch.id
    },
    owner_id: user.id,
    project_id: finalizedBatch.project_id,
    severity: "success",
    title: "Batch final decision locked"
  })

  revalidatePath(`/dashboard/render-batches/${batchId}`)
  revalidatePath(`/dashboard/projects/${finalizedBatch.project_id}`)
  if (finalizedBatch.finalized_export_id) {
    revalidatePath(`/dashboard/exports/${finalizedBatch.finalized_export_id}`)
  }
  revalidatePath("/dashboard/showcase")
  revalidatePath("/dashboard/campaigns")
}
