import type { DeliveryFocusedWorkspaceStatusSummary } from "@/features/delivery/lib/delivery-focused-workspace-status"
import { getServerI18n } from "@/lib/i18n/server"

type DeliveryFocusedWorkspaceStatusRowProps = {
  summary: DeliveryFocusedWorkspaceStatusSummary
}

function StatusItem(input: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {input.label}
      </p>
      <p className="mt-2 text-sm font-medium text-white">
        {input.value}
      </p>
    </div>
  )
}

export async function DeliveryFocusedWorkspaceStatusRow({
  summary
}: DeliveryFocusedWorkspaceStatusRowProps) {
  const { t } = await getServerI18n()

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-white">
            {t("delivery.focusedStatus.title")}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {t("delivery.focusedStatus.description")}
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
          {summary.workspaceTitle}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatusItem
          label={t("delivery.focusedStatus.followUpStatus")}
          value={summary.followUpStatusLabel}
        />
        <StatusItem
          label={t("delivery.focusedStatus.followUpDueDate")}
          value={summary.followUpDueOnLabel}
        />
        <StatusItem
          label={t("delivery.focusedStatus.lastCheckpoint")}
          value={summary.reminderCheckpointLabel}
        />
        <StatusItem
          label={t("delivery.focusedStatus.latestSupportEvent")}
          value={summary.latestSupportEventLabel}
        />
      </div>
    </section>
  )
}
