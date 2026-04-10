import type { JobStatus } from "@/server/database/types"
import { getServerI18n } from "@/lib/i18n/server"

type JobStatusBadgeProps = {
  status: JobStatus
}

export async function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const { t } = await getServerI18n()
  const styles =
    status === "failed"
      ? "border-rose-400/20 bg-rose-500/10 text-rose-100"
      : status === "succeeded"
        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
        : status === "running"
          ? "border-amber-400/20 bg-amber-500/10 text-amber-100"
          : status === "cancelled"
            ? "border-slate-400/20 bg-slate-500/10 text-slate-200"
            : "border-white/10 bg-white/[0.05] text-slate-300"

  return (
    <span className={`rounded-full border px-3 py-1 text-xs ${styles}`}>
      {status === "queued"
        ? t("debug.jobs.status.queued")
        : status === "running"
          ? t("debug.jobs.status.running")
          : status === "waiting_provider"
            ? t("debug.jobs.status.waiting_provider")
            : status === "succeeded"
              ? t("debug.jobs.status.succeeded")
              : status === "failed"
                ? t("debug.jobs.status.failed")
                : t("debug.jobs.status.cancelled")}
    </span>
  )
}
