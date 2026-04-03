import type { DeliveryReminderRepairOutcome } from "@/features/delivery/lib/delivery-reminder-repair-outcome"
import { getDeliveryReminderRepairActionLabel } from "@/features/delivery/lib/delivery-reminder-repair-outcome"

type DeliveryReminderRepairOutcomeBannerProps = {
  outcome: DeliveryReminderRepairOutcome
}

export function DeliveryReminderRepairOutcomeBanner({
  outcome
}: DeliveryReminderRepairOutcomeBannerProps) {
  const isSuccess = outcome.status === "success"

  return (
    <div
      className={`rounded-[1.25rem] border px-4 py-3 text-sm ${
        isSuccess
          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
          : "border-rose-400/30 bg-rose-500/10 text-rose-100"
      }`}
    >
      {isSuccess
        ? `${getDeliveryReminderRepairActionLabel(
            outcome.action
          )} for workspace ${outcome.workspaceId}.`
        : `Could not complete ${getDeliveryReminderRepairActionLabel(
            outcome.action
          ).toLowerCase()} for workspace ${outcome.workspaceId}.`}
    </div>
  )
}
