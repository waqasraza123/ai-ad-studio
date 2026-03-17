import type { SupabaseClient } from "@supabase/supabase-js"
import { handleGenerateConceptPreviewJob } from "./handlers/generate-concept-preview-job"
import { handleGenerateConceptsJob } from "./handlers/generate-concepts-job"
import { handleRenderFinalAdJob } from "./handlers/render-final-ad-job"
import {
  markJobFailed,
  markJobSucceeded,
  type WorkerJobRecord
} from "@/repositories/jobs-repository"
import { updateProjectStatus } from "@/repositories/projects-repository"

export async function executeJob(
  supabase: SupabaseClient,
  job: WorkerJobRecord
) {
  try {
    if (job.type === "generate_concepts") {
      const result = await handleGenerateConceptsJob(supabase, job)

      await markJobSucceeded(supabase, {
        jobId: job.id,
        result
      })

      return
    }

    if (job.type === "generate_concept_preview") {
      const result = await handleGenerateConceptPreviewJob(supabase, job)

      await markJobSucceeded(supabase, {
        jobId: job.id,
        result
      })

      return
    }

    if (job.type === "render_final_ad") {
      const result = await handleRenderFinalAdJob(supabase, job)

      await markJobSucceeded(supabase, {
        jobId: job.id,
        result
      })

      return
    }

    throw new Error(`Unsupported job type: ${job.type}`)
  } catch (error) {
    await updateProjectStatus(supabase, {
      projectId: job.project_id,
      status: "failed"
    })

    await markJobFailed(supabase, {
      error: {
        message: error instanceof Error ? error.message : "Unknown worker error"
      },
      jobId: job.id
    })

    throw error
  }
}
