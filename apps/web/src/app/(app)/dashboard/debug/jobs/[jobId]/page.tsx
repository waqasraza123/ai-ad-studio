import { notFound } from "next/navigation"
import { JobDebugDetail } from "@/features/debug/components/job-debug-detail"
import { JobTraceTimeline } from "@/features/debug/components/job-trace-timeline"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  getJobByIdForOwner,
  listJobTracesByJobIdForOwner
} from "@/server/debug/job-debug-repository"

type DebugJobDetailPageProps = {
  params: Promise<{
    jobId: string
  }>
}

export default async function DebugJobDetailPage({
  params
}: DebugJobDetailPageProps) {
  const { jobId } = await params
  const user = await getAuthenticatedUser()

  if (!user) {
    notFound()
  }

  const [job, traces] = await Promise.all([
    getJobByIdForOwner(jobId, user.id),
    listJobTracesByJobIdForOwner(jobId, user.id)
  ])

  if (!job) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <JobDebugDetail job={job} />

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          Trace timeline
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
          Step-level job traces
        </h2>
        <div className="mt-6">
          <JobTraceTimeline traces={traces} />
        </div>
      </section>
    </div>
  )
}
