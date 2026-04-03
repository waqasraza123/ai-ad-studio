"use client"

import { useFormStatus } from "react-dom"

type DeliveryReminderRepairActionButtonProps = {
  className: string
  label: string
  value: "clear_reminder_scheduling" | "reschedule_tomorrow"
}

export function DeliveryReminderRepairActionButton({
  className,
  label,
  value
}: DeliveryReminderRepairActionButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      aria-disabled={pending}
      className={className}
      disabled={pending}
      name="reminderRepairAction"
      type="submit"
      value={value}
    >
      {pending ? "Saving..." : label}
    </button>
  )
}
