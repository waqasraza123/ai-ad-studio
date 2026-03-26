import type { DeliveryReminderSupportRecord } from "./delivery-reminder-support"

export type DeliveryReminderSupportFilter =
  | "all"
  | "checkpoint_mismatch"
  | "workspace_missing"
  | "overdue"

const validDeliveryReminderSupportFilters = new Set<DeliveryReminderSupportFilter>([
  "all",
  "checkpoint_mismatch",
  "workspace_missing",
  "overdue"
])

export function normalizeDeliveryReminderSupportFilter(
  value: string | null | undefined
): DeliveryReminderSupportFilter {
  if (!value) {
    return "all"
  }

  return validDeliveryReminderSupportFilters.has(
    value as DeliveryReminderSupportFilter
  )
    ? (value as DeliveryReminderSupportFilter)
    : "all"
}

export function getDeliveryReminderSupportFilterLabel(
  filter: DeliveryReminderSupportFilter
) {
  if (filter === "checkpoint_mismatch") {
    return "Checkpoint mismatches"
  }

  if (filter === "workspace_missing") {
    return "Missing workspaces"
  }

  if (filter === "overdue") {
    return "Overdue reminders"
  }

  return "All recent"
}

export function filterDeliveryReminderSupportRecords(
  records: DeliveryReminderSupportRecord[],
  filter: DeliveryReminderSupportFilter
) {
  if (filter === "checkpoint_mismatch") {
    return records.filter(
      (record) => record.checkpointState === "checkpoint_mismatch"
    )
  }

  if (filter === "workspace_missing") {
    return records.filter((record) => record.checkpointState === "workspace_missing")
  }

  if (filter === "overdue") {
    return records.filter((record) => record.reminderBucket === "overdue")
  }

  return records
}
