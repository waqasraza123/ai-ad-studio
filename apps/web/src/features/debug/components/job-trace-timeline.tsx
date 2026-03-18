import type { JobTraceRecord } from "@/server/database/types"

type JobTraceTimelineProps = {
  traces: JobTraceRecord[]
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

export function JobTraceTimeline({ traces }: JobTraceTimelineProps) {
  if (traces.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
        No trace entries recorded for this job yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {traces.map((trace) => (
        <div
          key={trace.id}
          className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-white">{trace.stage}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                {trace.trace_type}
              </p>
            </div>
            <p className="text-xs text-slate-400">{formatTimestamp(trace.created_at)}</p>
          </div>

          <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-slate-200">
{JSON.stringify(trace.payload, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  )
}
