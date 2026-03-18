import type { JobStatus } from "@/server/database/types"

type JobStatusBadgeProps = {
  status: JobStatus
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const styles =
    status === "failed"
      ? "border-rose-400/20 bg-rose-500/10 text-rose-100"
      : status === "succeeded"
        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
        : status === "running"
          ? "border-amber-400/20 bg-amber-500/10 text-amber-100"
          : "border-white/10 bg-white/[0.05] text-slate-300"

  return (
    <span className={`rounded-full border px-3 py-1 text-xs ${styles}`}>
      {status}
    </span>
  )
}
