import Link from "next/link"
import type { DeliveryReminderMismatchLifecycleFilter } from "@/features/delivery/lib/delivery-reminder-mismatch-lifecycle-filter"
import type { DeliveryReminderSupportFilter } from "@/features/delivery/lib/delivery-reminder-support-filter"
import {
  buildDeliverySupportActivityFilterHref
} from "@/features/delivery/lib/delivery-reminder-support-links"
import {
  getDeliverySupportActivityFilterLabelKey,
  type DeliverySupportActivityFilter,
  type DeliverySupportActivityFilterSummary
} from "@/features/delivery/lib/delivery-support-activity-filter"
import { getServerI18n } from "@/lib/i18n/server"

type DeliverySupportActivityFilterBarProps = {
  activeFilter: DeliverySupportActivityFilter
  currentDashboardSearchParams: {
    activity?: string | null
    focusFollowUpForm?: boolean | null
    focusReminderNotificationId?: string | null
    focusWorkspaceId?: string | null
    reminderMismatchLifecycleFilter?: DeliveryReminderMismatchLifecycleFilter | null
    reminderSupportFilter?: DeliveryReminderSupportFilter | null
    sort?: string | null
    status?: string | null
  }
  summary: DeliverySupportActivityFilterSummary
}

const filterOptions: {
  countKey:
    | "allCount"
    | "failedReminderRepairsCount"
    | "reminderRepairsCount"
    | "supportHandoffNotesCount"
  value: DeliverySupportActivityFilter
}[] = [
  { countKey: "allCount", value: "all" },
  { countKey: "reminderRepairsCount", value: "reminder_repairs" },
  { countKey: "failedReminderRepairsCount", value: "failed_reminder_repairs" },
  { countKey: "supportHandoffNotesCount", value: "support_handoff_notes" }
]

function getFilterClasses(isActive: boolean) {
  return isActive
    ? "border-violet-400/30 bg-violet-500/10 text-violet-200"
    : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.05]"
}

export async function DeliverySupportActivityFilterBar({
  activeFilter,
  currentDashboardSearchParams,
  summary
}: DeliverySupportActivityFilterBarProps) {
  const { t } = await getServerI18n()

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-white">
            {t("delivery.supportActivity.title")}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {t("delivery.supportActivity.description")}
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
          {t("delivery.supportActivity.count", { count: summary.allCount })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filterOptions.map((filterOption) => {
          const isActive = filterOption.value === activeFilter
          const count = summary[filterOption.countKey]

          return (
            <Link
              key={filterOption.value}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${getFilterClasses(
                isActive
              )}`}
              href={buildDeliverySupportActivityFilterHref({
                activity: currentDashboardSearchParams.activity ?? null,
                focusFollowUpForm:
                  currentDashboardSearchParams.focusFollowUpForm ?? null,
                focusReminderNotificationId:
                  currentDashboardSearchParams.focusReminderNotificationId ??
                  null,
                focusWorkspaceId:
                  currentDashboardSearchParams.focusWorkspaceId ?? null,
                reminderMismatchLifecycleFilter:
                  currentDashboardSearchParams.reminderMismatchLifecycleFilter ??
                  null,
                reminderSupportFilter:
                  currentDashboardSearchParams.reminderSupportFilter ?? null,
                sort: currentDashboardSearchParams.sort ?? null,
                status: currentDashboardSearchParams.status ?? null,
                supportActivityFilter: filterOption.value
              })}
            >
              <span>{t(getDeliverySupportActivityFilterLabelKey(filterOption.value))}</span>
              <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5">
                {count}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
