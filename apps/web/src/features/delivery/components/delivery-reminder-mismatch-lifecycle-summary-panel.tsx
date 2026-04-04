import type { DeliveryReminderMismatchLifecycleSummary } from "@/features/delivery/lib/delivery-reminder-mismatch-lifecycle-summary"

type DeliveryReminderMismatchLifecycleSummaryPanelProps = {
  summary: DeliveryReminderMismatchLifecycleSummary
}

const summaryItems = [
  {
    description: "Reminder notifications still in unresolved mismatch workflow",
    key: "unresolvedCount",
    label: "Unresolved mismatches"
  },
  {
    description: "Reminder notifications currently marked as resolved",
    key: "resolvedCount",
    label: "Resolved mismatches"
  },
  {
    description: "Successful mismatch reopen activities in the current visible scope",
    key: "reopenedCount",
    label: "Reopened mismatches"
  },
  {
    description: "Failed reopen attempts recorded as support activity",
    key: "failedReopenAttemptsCount",
    label: "Failed reopen attempts"
  }
] as const

export function DeliveryReminderMismatchLifecycleSummaryPanel({
  summary
}: DeliveryReminderMismatchLifecycleSummaryPanelProps) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-white">
          Reminder mismatch lifecycle
        </h2>
        <p className="text-xs text-slate-400">
          Totals reflect the current visible delivery scope and support activity
          filter.
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <div
            className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4"
            key={item.key}
          >
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              {item.label}
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {summary[item.key]}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
