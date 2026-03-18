"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  getJobByIdForOwner,
  retryFailedJob
} from "@/server/debug/job-debug-repository"

export async function retryJobAction(jobId: string) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  const job = await getJobByIdForOwner(jobId, user.id)

  if (!job) {
    throw new Error("Job not found")
  }

  await retryFailedJob({
    jobId,
    ownerId: user.id
  })

  revalidatePath(`/dashboard/debug/jobs/${jobId}`)
  revalidatePath(`/dashboard/debug/jobs`)
  revalidatePath(`/dashboard/projects/${job.project_id}`)
}
