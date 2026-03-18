"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  cancelJob,
  getJobByIdForOwner
} from "@/server/debug/job-debug-repository"

export async function cancelJobAction(jobId: string, formData: FormData) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const job = await getJobByIdForOwner(jobId, user.id)

  if (!job) {
    throw new Error("Job not found")
  }

  const reason = String(formData.get("reason") ?? "Cancelled from debug UI")

  await cancelJob({
    jobId,
    ownerId: user.id,
    reason
  })

  revalidatePath(`/dashboard/debug/jobs/${jobId}`)
  revalidatePath(`/dashboard/debug/jobs`)
  revalidatePath(`/dashboard/projects/${job.project_id}`)
}
