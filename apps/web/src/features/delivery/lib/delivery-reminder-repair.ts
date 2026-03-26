import type {
  DeliveryFollowUpStatus,
  DeliveryWorkspaceRecord
} from "@/server/database/types"

export const deliveryReminderRepairActionFieldName = "reminderRepairAction"

export type DeliveryReminderRepairAction =
  | "clear_reminder_scheduling"
  | "reschedule_tomorrow"

function getUtcDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function getTomorrowDateKey(date: Date) {
  const tomorrow = new Date(date.getTime())
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

  return getUtcDateKey(tomorrow)
}

export function normalizeDeliveryReminderRepairAction(
  value: FormDataEntryValue | null | undefined
): DeliveryReminderRepairAction | null {
  if (typeof value !== "string") {
    return null
  }

  const normalizedValue = value.trim()

  if (
    normalizedValue === "reschedule_tomorrow" ||
    normalizedValue === "clear_reminder_scheduling"
  ) {
    return normalizedValue
  }

  return null
}

export function buildDeliveryReminderRepairValues(input: {
  action: DeliveryReminderRepairAction
  now?: Date
}): {
  followUpDueOn: string | null
  followUpStatus: DeliveryFollowUpStatus
} {
  const now = input.now ?? new Date()

  if (input.action === "reschedule_tomorrow") {
    return {
      followUpDueOn: getTomorrowDateKey(now),
      followUpStatus:
        "reminder_scheduled" satisfies DeliveryWorkspaceRecord["follow_up_status"]
    }
  }

  return {
    followUpDueOn: null,
    followUpStatus: "none" satisfies DeliveryWorkspaceRecord["follow_up_status"]
  }
}
