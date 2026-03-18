import type { SupabaseClient } from "@supabase/supabase-js"
import { handleGenerateConceptPreviewJob } from "./handlers/generate-concept-preview-job"
import { handleGenerateConceptsJob } from "./handlers/generate-concepts-job"
import { handleRenderFinalAdJob } from "./handlers/render-final-ad-job"
import {
  getJobById,
  markJobCancelled,
  markJobFailed,
  markJobSucceeded,
  type WorkerJobRecord
} from "@/repositories/jobs-repository"
import { createJobTrace } from "@/repositories/job-traces-repository"
import { updateProjectStatus } from "@/repositories/projects-repository"
import { createNotifications } from "@/notifications/notification-service"

function canRetryJob(job: WorkerJobRecord) {
  return job.attempts < job.max_attempts
}

function extractExportNotifications(
  result: Record<string, unknown>,
  job: WorkerJobRecord
) {
  const exportsCreated = result.exportsCreated

  if (!Array.isArray(exportsCreated)) {
    return []
  }

  return exportsCreated
    .map((exportItem) => {
      if (!exportItem || typeof exportItem !== "object") {
        return null
      }

      const exportId =
        typeof exportItem.exportId === "string" ? exportItem.exportId : null
      const aspectRatio =
        typeof exportItem.aspectRatio === "string" ? exportItem.aspectRatio : "new"

      if (!exportId) {
        return null
      }

      return {
        action_url: `/dashboard/exports/${exportId}`,
        body: `A ${aspectRatio} export is ready for review and download.`,
        export_id: exportId,
        job_id: job.id,
        kind: "export_ready",
        metadata: {
          aspectRatio
        },
        owner_id: job.owner_id,
        project_id: job.project_id,
        severity: "success" as const,
        title: "Export ready"
      }
    })
    .filter((value): value is NonNullable<typeof value> => value !== null)
}

export async function executeJob(
  supabase: SupabaseClient,
  job: WorkerJobRecord
) {
  const latestBeforeStart = await getJobById(supabase, job.id)

  if (latestBeforeStart?.cancel_requested_at) {
    await markJobCancelled(supabase, {
      jobId: job.id,
      reason: latestBeforeStart.cancel_reason ?? "Cancelled before execution"
    })

    await createJobTrace(supabase, {
      job_id: job.id,
      owner_id: job.owner_id,
      payload: {
        reason: latestBeforeStart.cancel_reason ?? "Cancelled before execution"
      },
      project_id: job.project_id,
      stage: "job_cancelled_before_start",
      trace_type: "lifecycle"
    })

    await createNotifications(supabase, [
      {
        action_url: `/dashboard/debug/jobs/${job.id}`,
        body: `The ${job.type} job was cancelled before execution began.`,
        job_id: job.id,
        kind: "job_cancelled",
        metadata: {
          reason: latestBeforeStart.cancel_reason ?? "Cancelled before execution"
        },
        owner_id: job.owner_id,
        project_id: job.project_id,
        severity: "warning",
        title: "Job cancelled"
      }
    ])

    return
  }

  await createJobTrace(supabase, {
    job_id: job.id,
    owner_id: job.owner_id,
    payload: {
      attempts: job.attempts,
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
      const latestAfterHandler = await getJobById(supabase, job.id)

      if (latestAfterHandler?.cancel_requested_at) {
        await markJobCancelled(supabase, {
          jobId: job.id,
          reason: latestAfterHandler.cancel_reason ?? "Cancelled during execution"
        })

        await createNotifications(supabase, [
          {
            action_url: `/dashboard/debug/jobs/${job.id}`,
            body: `The ${job.type} job was cancelled during execution.`,
            job_id: job.id,
            kind: "job_cancelled",
            metadata: {
              reason: latestAfterHandler.cancel_reason ?? "Cancelled during execution"
            },
            owner_id: job.owner_id,
            project_id: job.project_id,
            severity: "warning",
            title: "Job cancelled"
          }
        ])
      } else {
        await markJobSucceeded(supabase, {
          jobId: job.id,
          result
        })
      }

      await createJobTrace(supabase, {
        job_id: job.id,
        owner_id: job.owner_id,
        payload: result,
        project_id: job.project_id,
        stage: latestAfterHandler?.cancel_requested_at
          ? "job_cancelled_after_handler"
          : "job_succeeded",
        trace_type: "lifecycle"
      })

      return
    }

    if (job.type === "generate_concept_preview") {
      const result = await handleGenerateConceptPreviewJob(supabase, job)
      const latestAfterHandler = await getJobById(supabase, job.id)

      if (latestAfterHandler?.cancel_requested_at) {
        await markJobCancelled(supabase, {
          jobId: job.id,
          reason: latestAfterHandler.cancel_reason ?? "Cancelled during execution"
        })

        await createNotifications(supabase, [
          {
            action_url: `/dashboard/debug/jobs/${job.id}`,
            body: `The ${job.type} job was cancelled during execution.`,
            job_id: job.id,
            kind: "job_cancelled",
            metadata: {
              reason: latestAfterHandler.cancel_reason ?? "Cancelled during execution"
            },
            owner_id: job.owner_id,
            project_id: job.project_id,
            severity: "warning",
            title: "Job cancelled"
          }
        ])
      } else {
        await markJobSucceeded(supabase, {
          jobId: job.id,
          result
        })
      }

      await createJobTrace(supabase, {
        job_id: job.id,
        owner_id: job.owner_id,
        payload: result,
        project_id: job.project_id,
        stage: latestAfterHandler?.cancel_requested_at
          ? "job_cancelled_after_handler"
          : "job_succeeded",
        trace_type: "lifecycle"
      })

      return
    }

    if (job.type === "render_final_ad") {
      const result = await handleRenderFinalAdJob(supabase, job)
      const latestAfterHandler = await getJobById(supabase, job.id)

      if (latestAfterHandler?.cancel_requested_at) {
        await markJobCancelled(supabase, {
          jobId: job.id,
          reason: latestAfterHandler.cancel_reason ?? "Cancelled during execution"
        })

        await createNotifications(supabase, [
          {
            action_url: `/dashboard/debug/jobs/${job.id}`,
            body: `The ${job.type} job was cancelled during execution.`,
            job_id: job.id,
            kind: "job_cancelled",
            metadata: {
              reason: latestAfterHandler.cancel_reason ?? "Cancelled during execution"
            },
            owner_id: job.owner_id,
            project_id: job.project_id,
            severity: "warning",
            title: "Job cancelled"
          }
        ])
      } else {
        await markJobSucceeded(supabase, {
          jobId: job.id,
          result
        })

        const exportNotifications = extractExportNotifications(result, job)
        await createNotifications(supabase, exportNotifications)
      }

      await createJobTrace(supabase, {
        job_id: job.id,
        owner_id: job.owner_id,
        payload: result,
        project_id: job.project_id,
        stage: latestAfterHandler?.cancel_requested_at
          ? "job_cancelled_after_handler"
          : "job_succeeded",
        trace_type: "lifecycle"
      })

      return
    }

    throw new Error(`Unsupported job type: ${job.type}`)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown worker error"

    const shouldRetry = canRetryJob(job)

    await updateProjectStatus(supabase, {
      projectId: job.project_id,
      status: shouldRetry ? "rendering" : "failed"
    })

    await markJobFailed(supabase, {
      attempts: job.attempts,
      error: {
        message
      },
      jobId: job.id,
      shouldRetry,
      type: job.type
    })

    await createJobTrace(supabase, {
      job_id: job.id,
      owner_id: job.owner_id,
      payload: {
        attempts: job.attempts,
        message,
        shouldRetry
      },
      project_id: job.project_id,
      stage: shouldRetry ? "job_failed_will_retry" : "job_failed",
      trace_type: "error"
    })

    await createNotifications(supabase, [
      {
        action_url: `/dashboard/debug/jobs/${job.id}`,
        body: shouldRetry
          ? `The ${job.type} job failed and has been scheduled for another attempt.`
          : `The ${job.type} job failed and requires attention.`,
        job_id: job.id,
        kind: shouldRetry ? "job_failed_retrying" : "job_failed",
        metadata: {
          attempts: job.attempts,
          message,
          shouldRetry
        },
        owner_id: job.owner_id,
        project_id: job.project_id,
        severity: shouldRetry ? "warning" : "error",
        title: shouldRetry ? "Job failed and will retry" : "Job failed"
      }
    ])

    throw error
  }
}
