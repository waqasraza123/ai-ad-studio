import type { DeliveryReminderMismatchLifecycleOutcome } from "@/features/delivery/lib/delivery-reminder-mismatch-outcome"
import { getDeliveryReminderMismatchLifecycleMessage } from "@/features/delivery/lib/delivery-reminder-mismatch-outcome"

type DeliveryReminderMismatchOutcomeBannerProps = {
  outcome: DeliveryReminderMismatchLifecycleOutcome
}

export function DeliveryReminderMismatchOutcomeBanner({
  outcome
}: DeliveryReminderMismatchOutcomeBannerProps) {
  const isSuccess = outcome.status === "success"

  return (
    <div
      className={`rounded-[1.25rem] border px-4 py-3 text-sm ${
        isSuccess
          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
          : "border-rose-400/30 bg-rose-500/10 text-rose-100"
      }`}
    >
      {getDeliveryReminderMismatchLifecycleMessage(outcome)}
    </div>
  )
}
