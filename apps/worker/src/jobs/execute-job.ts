import type { SupabaseClient } from "@supabase/supabase-js"
import { handleGenerateConceptPreviewJob } from "./handlers/generate-concept-preview-job"
import { handleGenerateConceptsJob } from "./handlers/generate-concepts-job"
import { handleRenderFinalAdJob } from "./handlers/render-final-ad-job"
import {
  markJobFailed,
  markJobSucceeded,
  type WorkerJobRecord
} from "@/repositories/jobs-repository"
import { createJobTrace } from "@/repositories/job-traces-repository"
import { updateProjectStatus } from "@/repositories/projects-repository"

export async function executeJob(
  supabase: SupabaseClient,
  job: WorkerJobRecord
) {
  await createJobTrace(supabase, {
    job_id: job.id,
    owner_id: job.owner_id,
    payload: {
      payload: job.payload,
      type: job.type
    },
    project_id: job.project_id,
    stage: "job_started",
    trace_type: "lifecycle"
  })

  try {
    if (job.type === "generate_concepts") {
      const result = await handleGenerateConceptsJob(supabase, job)

      await markJobSucceeded(supabase, {
        jobId: job.id,
        result
      })

      await createJobTrace(supabase, {
        job_id: job.id,
        owner_id: job.owner_id,
        payload: result,
        project_id: job.project_id,
        stage: "job_succeeded",
        trace_type: "lifecycle"
      })

      return
    }

    if (job.type === "generate_concept_preview") {
      const result = await handleGenerateConceptPreviewJob(supabase, job)

      await markJobSucceeded(supabase, {
        jobId: job.id,
        result
      })

      await createJobTrace(supabase, {
        job_id: job.id,
        owner_id: job.owner_id,
        payload: result,
        project_id: job.project_id,
        stage: "job_succeeded",
        trace_type: "lifecycle"
      })

      return
    }

    if (job.type === "render_final_ad") {
      const result = await handleRenderFinalAdJob(supabase, job)

      await markJobSucceeded(supabase, {
        jobId: job.id,
        result
      })

      await createJobTrace(supabase, {
        job_id: job.id,
        owner_id: job.owner_id,
        payload: result,
        project_id: job.project_id,
        stage: "job_succeeded",
        trace_type: "lifecycle"
      })

      return
    }

    throw new Error(`Unsupported job type: ${job.type}`)
  } catch (error) {
    await updateProjectStatus(supabase, {
      projectId: job.project_id,
      status: "failed"
    })

    const message =
      error instanceof Error ? error.message : "Unknown worker error"

    await markJobFailed(supabase, {
      error: {
        message
      },
      jobId: job.id
    })

    await createJobTrace(supabase, {
      job_id: job.id,
      owner_id: job.owner_id,
      payload: {
        message
      },
      project_id: job.project_id,
      stage: "job_failed",
      trace_type: "error"
    })

    throw error
  }
}
