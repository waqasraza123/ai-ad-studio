import type { SupabaseClient } from "@supabase/supabase-js"
import {
  ensureRenderApproval,
  getApprovalByJobId
} from "@/approvals/approval-service"
import { evaluateOwnerGuardrails } from "@/guardrails/owner-guardrails"
import { createNotifications } from "@/notifications/notification-service"
import { handleGenerateConceptPreviewJob } from "./handlers/generate-concept-preview-job"
import { handleGenerateConceptsJob } from "./handlers/generate-concepts-job"
import { handleRenderFinalAdJob } from "./handlers/render-final-ad-job"
import {
  getJobById,
  markJobBlocked,
  markJobCancelled,
  markJobFailed,
  markJobSucceeded,
  type WorkerJobRecord
} from "@/repositories/jobs-repository"
import { createJobTrace } from "@/repositories/job-traces-repository"
import { updateProjectStatus } from "@/repositories/projects-repository"

function canRetryJob(job: WorkerJobRecord) {
  return job.attempts < job.max_attempts
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

  if (job.type === "render_final_ad") {
    const approval = await ensureRenderApproval(supabase, {
      conceptId:
        typeof job.payload.conceptId === "string" ? job.payload.conceptId : null,
      jobId: job.id,
      ownerId: job.owner_id,
      projectId: job.project_id
    })

    if (approval.status === "pending") {
      await markJobBlocked(supabase, {
        jobId: job.id,
        reason: "approval_required"
      })

      await createJobTrace(supabase, {
        job_id: job.id,
        owner_id: job.owner_id,
        payload: {
          approvalId: approval.id,
          status: approval.status
        },
        project_id: job.project_id,
        stage: "job_waiting_for_approval",
        trace_type: "approval"
      })

      await createNotifications(supabase, [
        {
          action_url: `/dashboard/projects/${job.project_id}`,
          body: "A final render is waiting for your approval before expensive execution can begin.",
          job_id: job.id,
          kind: "approval_required",
          metadata: {
            approvalId: approval.id
          },
          owner_id: job.owner_id,
          project_id: job.project_id,
          severity: "warning",
          title: "Approval required for final render"
        }
      ])

      return
    }

    if (approval.status === "rejected") {
      await markJobBlocked(supabase, {
        jobId: job.id,
        reason: "approval_rejected"
      })

      await createJobTrace(supabase, {
        job_id: job.id,
        owner_id: job.owner_id,
        payload: {
          approvalId: approval.id,
          decisionNote: approval.decision_note,
          status: approval.status
        },
        project_id: job.project_id,
        stage: "job_blocked_by_rejection",
        trace_type: "approval"
      })

      await createNotifications(supabase, [
        {
          action_url: `/dashboard/projects/${job.project_id}`,
          body: "The final render request was rejected and will not proceed until a new render is queued.",
          job_id: job.id,
          kind: "approval_rejected",
          metadata: {
            approvalId: approval.id
          },
          owner_id: job.owner_id,
          project_id: job.project_id,
          severity: "warning",
          title: "Final render rejected"
        }
      ])

      await updateProjectStatus(supabase, {
        projectId: job.project_id,
        status: "failed"
      })

      return
    }

    await createJobTrace(supabase, {
      job_id: job.id,
      owner_id: job.owner_id,
      payload: {
        approvalId: approval.id,
        decidedAt: approval.decided_at,
        decisionNote: approval.decision_note,
        status: approval.status
      },
      project_id: job.project_id,
      stage: "approval_confirmed",
      trace_type: "approval"
    })
  }

  const guardrailDecision = await evaluateOwnerGuardrails(supabase, job)

  if (!guardrailDecision.allowed) {
    await markJobBlocked(supabase, {
      jobId: job.id,
      reason: guardrailDecision.reason
    })

    await createJobTrace(supabase, {
      job_id: job.id,
      owner_id: job.owner_id,
      payload: {
        guardrails: guardrailDecision.guardrails,
        monthlyOpenAiCost: guardrailDecision.monthlyOpenAiCost,
        monthlyRunwayCost: guardrailDecision.monthlyRunwayCost,
        monthlyTotalCost: guardrailDecision.monthlyTotalCost,
        reason: guardrailDecision.reason
      },
      project_id: job.project_id,
      stage: "job_blocked_by_guardrail",
      trace_type: "guardrail"
    })

    await createNotifications(supabase, [
      {
        action_url: `/dashboard/debug/jobs/${job.id}`,
        body: `The ${job.type} job was blocked because ${guardrailDecision.reason}. Review owner settings to raise limits or disable auto-blocking.`,
        job_id: job.id,
        kind: "job_blocked_by_guardrail",
        metadata: {
          reason: guardrailDecision.reason
        },
        owner_id: job.owner_id,
        project_id: job.project_id,
        severity: "warning",
        title: "Job blocked by cost guardrail"
      }
    ])

    await updateProjectStatus(supabase, {
      projectId: job.project_id,
      status: "failed"
    })

    return
  }

  await createJobTrace(supabase, {
    job_id: job.id,
    owner_id: job.owner_id,
    payload: {
      attempts: job.attempts,
      guardrails: guardrailDecision.guardrails,
      monthlyOpenAiCost: guardrailDecision.monthlyOpenAiCost,
      monthlyRunwayCost: guardrailDecision.monthlyRunwayCost,
      monthlyTotalCost: guardrailDecision.monthlyTotalCost,
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

        const exportNotifications = Array.isArray(result.exportsCreated)
          ? result.exportsCreated.map((exportItem) => ({
              action_url: `/dashboard/exports/${String((exportItem as { exportId?: unknown }).exportId ?? "")}`,
              body: `A ${String((exportItem as { aspectRatio?: unknown }).aspectRatio ?? "new")} export is ready for review and download.`,
              export_id: String((exportItem as { exportId?: unknown }).exportId ?? ""),
              job_id: job.id,
              kind: "export_ready",
              metadata: {
                aspectRatio:
                  (exportItem as { aspectRatio?: unknown }).aspectRatio ?? null
              },
              owner_id: job.owner_id,
              project_id: job.project_id,
              severity: "success" as const,
              title: "Export ready"
            }))
          : []

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
