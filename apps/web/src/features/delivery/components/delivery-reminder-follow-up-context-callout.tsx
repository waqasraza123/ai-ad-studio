import { deliveryReminderMismatchReopenNoteFieldName, deliveryReminderMismatchReopenNoteMaxLength } from "@/features/delivery/lib/delivery-reminder-mismatch-reopen"
import { reopenDeliveryWorkspaceReminderMismatchFromSupport, resolveDeliveryWorkspaceReminderMismatchFromSupport } from "@/features/delivery/actions/manage-delivery-workspace-follow-up"
import {
  repairDeliveryWorkspaceReminderFromSupport,
  resolveDeliveryWorkspaceReminderMismatchFromSupport
} from "@/features/delivery/actions/manage-delivery-workspace-follow-up"
import { DeliveryReminderRepairActionButton } from "@/features/delivery/components/delivery-reminder-repair-action-button"
import type { DeliveryReminderSupportFilter } from "@/features/delivery/lib/delivery-reminder-support-filter"
import type { DeliverySupportActivityFilter } from "@/features/delivery/lib/delivery-support-activity-filter"
import type { DeliveryReminderSupportRecord } from "@/features/delivery/lib/delivery-reminder-support"
import {
  doesDeliveryReminderRepairOutcomeMatchRecord,
  getDeliveryReminderRepairOutcomeMessage,
  type DeliveryReminderRepairOutcome
} from "@/features/delivery/lib/delivery-reminder-repair-outcome"
import {
  buildDeliveryReminderFollowUpFormHref
} from "@/features/delivery/lib/delivery-reminder-support-links"
import {
  deliveryReminderClearReasonFieldName,
  deliveryReminderClearReasonMaxLength
} from "@/features/delivery/lib/delivery-reminder-repair-reason"
import {
  deliveryReminderMismatchResolutionNoteFieldName,
  deliveryReminderMismatchResolutionNoteMaxLength
} from "@/features/delivery/lib/delivery-reminder-mismatch-resolution"
import {
  getDeliveryWorkspaceReminderBucketClasses,
  getDeliveryWorkspaceReminderBucketLabel
} from "@/features/delivery/lib/delivery-workspace-follow-up"

type DeliveryReminderFollowUpContextCalloutProps = {
  activeReminderSupportFilter: DeliveryReminderSupportFilter
  activeSupportActivityFilter: DeliverySupportActivityFilter
  currentFollowUpNote: string | null
  record: DeliveryReminderSupportRecord
  repairOutcome?: DeliveryReminderRepairOutcome | null
}

function formatDate(value: string | null) {
  return value ?? "—"
}

function formatDateTime(value: string) {
  return value.replace("T", " ").replace(".000Z", "Z")
}

export function DeliveryReminderFollowUpContextCallout({
  activeReminderSupportFilter,
  activeSupportActivityFilter,
  currentFollowUpNote,
  record,
  repairOutcome = null
}: DeliveryReminderFollowUpContextCalloutProps) {
  if (!record.workspaceId) {
    return null
  }

  const returnToHref = buildDeliveryReminderFollowUpFormHref({
    notificationId: record.notificationId,
    reminderSupportFilter: activeReminderSupportFilter,
    supportActivityFilter: activeSupportActivityFilter,
    workspaceId: record.workspaceId
  })

  const matchingRepairOutcome = doesDeliveryReminderRepairOutcomeMatchRecord({
    outcome: repairOutcome,
    record
  })
    ? repairOutcome
    : null

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

      {matchingRepairOutcome ? (
        <div
          className={`mt-4 rounded-[1rem] border px-3 py-2 text-sm ${
            matchingRepairOutcome.status === "success"
              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
              : "border-rose-400/30 bg-rose-500/10 text-rose-100"
          }`}
        >
          {getDeliveryReminderRepairOutcomeMessage(matchingRepairOutcome)}
        </div>
      ) : null}

      <p className="mt-4 text-sm text-amber-50/90">
        This follow-up form is focused from a reminder checkpoint mismatch row.
        You can repair reminder scheduling here without leaving the current
        workspace view.
      </p>

      {record.checkpointState === "resolved" ? (
  <form
    action={reopenDeliveryWorkspaceReminderMismatchFromSupport}
    className="mt-4 rounded-[1rem] border border-white/10 bg-black/10 p-4"
  >
    <input name="workspaceId" type="hidden" value={record.workspaceId ?? ""} />
    <input
      name="focusedReminderNotificationId"
      type="hidden"
      value={record.notificationId}
    />
    <input
      name="focusedReminderBucket"
      type="hidden"
      value={record.reminderBucket}
    />
    <input name="returnToHref" type="hidden" value={returnToHref} />

    <div className="rounded-[1rem] border border-cyan-400/30 bg-cyan-500/10 px-3 py-3 text-sm text-cyan-100">
      This reminder mismatch is currently marked as resolved for this
      notification context.
    </div>

    <div className="mt-4 space-y-2">
      <label
        className="block text-sm font-medium text-white"
        htmlFor={`${record.notificationId}-mismatch-reopen-note`}
      >
        Optional mismatch reopen note
      </label>
      <textarea
        className="min-h-[88px] w-full rounded-[1rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40 focus:bg-white/[0.06]"
        id={`${record.notificationId}-mismatch-reopen-note`}
        maxLength={deliveryReminderMismatchReopenNoteMaxLength}
        name={deliveryReminderMismatchReopenNoteFieldName}
        placeholder="Optional context explaining why the resolved mismatch should be reopened."
      />
    </div>

    <div className="mt-3 flex flex-wrap gap-2">
      <button
        className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition hover:border-amber-300/40 hover:bg-amber-500/15"
        type="submit"
      >
        Reopen mismatch
      </button>
    </div>
  </form>
) : record.checkpointState === "checkpoint_mismatch" ? (
        <form
          action={resolveDeliveryWorkspaceReminderMismatchFromSupport}
          className="mt-4 rounded-[1rem] border border-white/10 bg-black/10 p-4"
        >
          <input name="workspaceId" type="hidden" value={record.workspaceId ?? ""} />
          <input
            name="focusedReminderNotificationId"
            type="hidden"
            value={record.notificationId}
          />
          <input
            name="focusedReminderBucket"
            type="hidden"
            value={record.reminderBucket}
          />
          <input name="returnToHref" type="hidden" value={returnToHref} />

          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-white"
              htmlFor={`${record.notificationId}-mismatch-resolution-note`}
            >
              Optional mismatch resolution note
            </label>
            <textarea
              className="min-h-[88px] w-full rounded-[1rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:bg-white/[0.06]"
              id={`${record.notificationId}-mismatch-resolution-note`}
              maxLength={deliveryReminderMismatchResolutionNoteMaxLength}
              name={deliveryReminderMismatchResolutionNoteFieldName}
              placeholder="Optional context explaining why this mismatch is considered resolved."
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200 transition hover:border-cyan-300/40 hover:bg-cyan-500/15"
              type="submit"
            >
              Mark mismatch as resolved
            </button>
          </div>
        </form>
      ) : null}

      <form
        action={repairDeliveryWorkspaceReminderFromSupport}
        className="mt-4 flex flex-wrap gap-2"
      >
        <input name="workspaceId" type="hidden" value={record.workspaceId} />
        <input name="returnToHref" type="hidden" value={returnToHref} />
        <input
          name="focusedReminderNotificationId"
          type="hidden"
          value={record.notificationId}
        />
        <input
          name="focusedReminderBucket"
          type="hidden"
          value={record.reminderBucket}
        />
        <input
          name="currentFollowUpNote"
          type="hidden"
          value={currentFollowUpNote ?? ""}
        />

        <DeliveryReminderRepairActionButton
          className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200 transition hover:border-cyan-300/40 hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          label="Reschedule for tomorrow"
          value="reschedule_tomorrow"
        />
      </form>

      <form
        action={repairDeliveryWorkspaceReminderFromSupport}
        className="mt-4 rounded-[1rem] border border-white/10 bg-black/10 p-4"
      >
        <input name="workspaceId" type="hidden" value={record.workspaceId} />
        <input name="returnToHref" type="hidden" value={returnToHref} />
        <input
          name="focusedReminderNotificationId"
          type="hidden"
          value={record.notificationId}
        />
        <input
          name="focusedReminderBucket"
          type="hidden"
          value={record.reminderBucket}
        />
        <input
          name="currentFollowUpNote"
          type="hidden"
          value={currentFollowUpNote ?? ""}
        />

        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-white"
            htmlFor={`${record.notificationId}-clear-reason`}
          >
            Reason for clearing reminder scheduling
          </label>
          <textarea
            className="min-h-[96px] w-full rounded-[1rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40 focus:bg-white/[0.06]"
            id={`${record.notificationId}-clear-reason`}
            maxLength={deliveryReminderClearReasonMaxLength}
            name={deliveryReminderClearReasonFieldName}
            placeholder="Explain why reminder scheduling should be cleared."
            required
          />
          <p className="text-xs text-amber-100/70">
            This reason is required and will be written into the delivery
            activity audit trail.
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <DeliveryReminderRepairActionButton
            className="inline-flex items-center rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-200 transition hover:border-rose-300/40 hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-60"
            label="Clear reminder scheduling"
            value="clear_reminder_scheduling"
          />
        </div>
      </form>
    </div>
  )
}
