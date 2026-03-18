import Link from "next/link"
import type { JobRecord, ProjectRecord } from "@/server/database/types"
import { JobStatusBadge } from "./job-status-badge"

type JobDebugListProps = {
  jobs: JobRecord[]
  projectsById: Map<string, ProjectRecord>
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

export function JobDebugList({ jobs, projectsById }: JobDebugListProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-sm text-slate-400">
        No jobs yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => {
        const project = projectsById.get(job.project_id)

        return (
          <Link
            key={job.id}
            href={`/dashboard/debug/jobs/${job.id}`}
            className="block rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20 hover:bg-white/[0.06]"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-white">{job.type}</p>
                  <JobStatusBadge status={job.status} />
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {project?.name ?? "Unknown project"}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {formatTimestamp(job.created_at)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                  attempts {job.attempts}/{job.max_attempts}
                </span>
                {job.provider ? (
                  <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-100">
                    {job.provider}
                  </span>
                ) : null}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
