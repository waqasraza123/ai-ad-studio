import Link from "next/link"
import type { JobRecord } from "@/server/database/types"
import { cancelJobAction } from "@/features/debug/actions/cancel-job"
import { retryJobAction } from "@/features/debug/actions/retry-job"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { JobStatusBadge } from "./job-status-badge"

type JobDebugDetailProps = {
  job: JobRecord
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "n/a"
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

export function JobDebugDetail({ job }: JobDebugDetailProps) {
  const retryAction = retryJobAction.bind(null, job.id)
  const cancelAction = cancelJobAction.bind(null, job.id)
  const canCancel =
    job.status === "queued" ||
    job.status === "running" ||
    job.status === "waiting_provider"

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white">
              {job.type}
            </h1>
            <JobStatusBadge status={job.status} />
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Inspect payloads, provider metadata, queue timing, errors, and use safe controls for cancellation or retry.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/projects/${job.project_id}`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
          >
            Open project
          </Link>

          {canCancel ? (
            <form action={cancelAction} className="flex items-center gap-2">
              <input
                name="reason"
                defaultValue="Cancelled from debug UI"
                className="hidden"
              />
              <FormSubmitButton variant="secondary" pendingLabel="Cancelling…">
                Cancel job
              </FormSubmitButton>
            </form>
          ) : null}

          {job.status === "failed" || job.status === "cancelled" ? (
            <form action={retryAction}>
              <FormSubmitButton pendingLabel="Retrying…">Retry job</FormSubmitButton>
            </form>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Attempts</p>
          <p className="mt-2 text-sm font-medium text-white">
            {job.attempts}/{job.max_attempts}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Started</p>
          <p className="mt-2 text-sm font-medium text-white">
            {formatTimestamp(job.started_at)}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Finished</p>
          <p className="mt-2 text-sm font-medium text-white">
            {formatTimestamp(job.finished_at)}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Next attempt</p>
          <p className="mt-2 text-sm font-medium text-white">
            {formatTimestamp(job.next_attempt_at)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Cancel requested</p>
          <p className="mt-2 text-sm font-medium text-white">
            {formatTimestamp(job.cancel_requested_at)}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {job.cancel_reason ?? "n/a"}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Provider job id</p>
          <p className="mt-2 break-all text-sm font-medium text-white">
            {job.provider_job_id ?? "n/a"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Payload</p>
          <pre className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-slate-200">
{JSON.stringify(job.payload, null, 2)}
          </pre>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Result</p>
          <pre className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-slate-200">
{JSON.stringify(job.result, null, 2)}
          </pre>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Error</p>
          <pre className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-slate-200">
{JSON.stringify(job.error, null, 2)}
          </pre>
        </div>
      </div>
    </section>
  )
}
