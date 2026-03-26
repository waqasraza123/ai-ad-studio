import {
  getDeliveryWorkspaceReminderBucketClasses,
  getDeliveryWorkspaceReminderBucketLabel
} from "@/features/delivery/lib/delivery-workspace-follow-up"
import type { DeliveryReminderSupportRecord } from "@/features/delivery/lib/delivery-reminder-support"

type DeliveryReminderFollowUpContextCalloutProps = {
  record: DeliveryReminderSupportRecord
}

function formatDate(value: string | null) {
  return value ?? "—"
}

function formatDateTime(value: string) {
  return value.replace("T", " ").replace(".000Z", "Z")
}

export function DeliveryReminderFollowUpContextCallout({
  record
}: DeliveryReminderFollowUpContextCalloutProps) {
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
        Use the current reminder context above to reconcile the workspace
        follow-up state below.
      </p>
    </div>
  )
}
