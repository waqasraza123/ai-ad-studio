import {
  repairDeliveryWorkspaceReminderFromSupport
} from "@/features/delivery/actions/manage-delivery-workspace-follow-up"
import type { DeliveryReminderSupportFilter } from "@/features/delivery/lib/delivery-reminder-support-filter"
import type { DeliveryReminderSupportRecord } from "@/features/delivery/lib/delivery-reminder-support"
import {
  buildDeliveryReminderFollowUpFormHref
} from "@/features/delivery/lib/delivery-reminder-support-links"
import {
  deliveryReminderRepairActionFieldName
} from "@/features/delivery/lib/delivery-reminder-repair"
import {
  getDeliveryWorkspaceReminderBucketClasses,
  getDeliveryWorkspaceReminderBucketLabel
} from "@/features/delivery/lib/delivery-workspace-follow-up"

type DeliveryReminderFollowUpContextCalloutProps = {
  activeReminderSupportFilter: DeliveryReminderSupportFilter
  currentFollowUpNote: string | null
  record: DeliveryReminderSupportRecord
}

function formatDate(value: string | null) {
  return value ?? "—"
}

function formatDateTime(value: string) {
  return value.replace("T", " ").replace(".000Z", "Z")
}

export function DeliveryReminderFollowUpContextCallout({
  activeReminderSupportFilter,
  currentFollowUpNote,
  record
}: DeliveryReminderFollowUpContextCalloutProps) {
  if (!record.workspaceId) {
    return null
  }

  const returnToHref = buildDeliveryReminderFollowUpFormHref({
    notificationId: record.notificationId,
    reminderSupportFilter: activeReminderSupportFilter,
    workspaceId: record.workspaceId
  })

  return (
    <div className="rounded-[1.25rem] border border-amber-400/30 bg-amber-500/10 p-4 text-amber-50">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-100">
          Reminder context
        </span>
        <span
          className={`rounded-full border px-3 py-1 text-xs ${getDeliveryWorkspaceReminderBucketClasses(
            record.reminderBucket
          )}`}
        >
          {getDeliveryWorkspaceReminderBucketLabel(record.reminderBucket)}
        </span>
        <span className="rounded-full border border-white/10 bg-black/10 px-3 py-1 text-xs text-slate-200">
          {formatDateTime(record.notificationCreatedAt)}
        </span>
      </div>

      <h4 className="mt-3 text-sm font-semibold text-white">
        {record.notificationTitle}
      </h4>
      <p className="mt-2 text-sm leading-6 text-amber-50/90">
        {record.notificationBody}
      </p>

      <dl className="mt-4 grid gap-3 text-sm text-amber-50/90 md:grid-cols-2">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-amber-100/70">Reminder due on</dt>
          <dd className="text-right">{formatDate(record.notificationFollowUpDueOn)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-amber-100/70">Notification id</dt>
          <dd className="text-right font-mono text-xs">{record.notificationId}</dd>
        </div>
      </dl>

      <p className="mt-4 text-sm text-amber-50/90">
        This follow-up form is focused from a reminder checkpoint mismatch row.
        You can repair reminder scheduling here without leaving the current
        workspace view.
      </p>

      <form
        action={repairDeliveryWorkspaceReminderFromSupport}
        className="mt-4 flex flex-wrap gap-2"
      >
        <input name="workspaceId" type="hidden" value={record.workspaceId} />
        <input name="returnToHref" type="hidden" value={returnToHref} />
        <input
          name="currentFollowUpNote"
          type="hidden"
          value={currentFollowUpNote ?? ""}
        />

        <button
          className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200 transition hover:border-cyan-300/40 hover:bg-cyan-500/15"
          name={deliveryReminderRepairActionFieldName}
          type="submit"
          value="reschedule_tomorrow"
        >
          Reschedule for tomorrow
        </button>

        <button
          className="inline-flex items-center rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-200 transition hover:border-rose-300/40 hover:bg-rose-500/15"
          name={deliveryReminderRepairActionFieldName}
          type="submit"
          value="clear_reminder_scheduling"
        >
          Clear reminder scheduling
        </button>
      </form>
    </div>
  )
}
