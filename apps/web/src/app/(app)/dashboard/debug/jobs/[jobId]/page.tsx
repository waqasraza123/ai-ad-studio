import { notFound } from "next/navigation"
import { JobDebugDetail } from "@/features/debug/components/job-debug-detail"
import { JobTraceTimeline } from "@/features/debug/components/job-trace-timeline"
import { getFormErrorMessage } from "@/lib/form-error-messages"
import { getServerI18n } from "@/lib/i18n/server"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  getJobByIdForOwner,
  listJobTracesByJobIdForOwner
} from "@/server/debug/job-debug-repository"

type DebugJobDetailPageProps = {
  params: Promise<{
    jobId: string
  }>
  searchParams: Promise<{
    error?: string
  }>
}

export default async function DebugJobDetailPage({
  params,
  searchParams
}: DebugJobDetailPageProps) {
  const { t } = await getServerI18n()
  const { jobId } = await params
  const resolvedSearchParams = await searchParams
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

  const formErrorMessage = getFormErrorMessage(resolvedSearchParams.error)

  return (
    <div className="space-y-6">
      {formErrorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {formErrorMessage}
        </div>
      ) : null}
      <JobDebugDetail job={job} />

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          {t("debug.jobs.traceTimeline")}
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
          {t("debug.jobs.traceHeading")}
        </h2>
        <div className="mt-6">
          <JobTraceTimeline traces={traces} />
        </div>
      </section>
    </div>
  )
}
