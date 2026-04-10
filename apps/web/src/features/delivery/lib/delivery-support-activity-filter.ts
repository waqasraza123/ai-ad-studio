import {
  isDeliveryReminderRepairActivityMetadata
} from "./delivery-reminder-repair-activity"
import {
  isDeliveryReminderSupportNoteActivityMetadata
} from "./delivery-reminder-support-note"
import {
  isDeliveryReminderMismatchResolutionActivityMetadata
} from "./delivery-reminder-mismatch-resolution"
import type { AppMessageKey } from "@/lib/i18n/messages/en"

export type DeliverySupportActivityFilter =
  | "all"
  | "failed_reminder_repairs"
  | "reminder_repairs"
  | "support_handoff_notes"

export type DeliverySupportActivityFilterSummary = {
  allCount: number
  failedReminderRepairsCount: number
  reminderRepairsCount: number
  supportHandoffNotesCount: number
}

const validDeliverySupportActivityFilters = new Set<DeliverySupportActivityFilter>([
  "all",
  "reminder_repairs",
  "failed_reminder_repairs",
  "support_handoff_notes"
])

export function normalizeDeliverySupportActivityFilter(
  value: string | null | undefined
): DeliverySupportActivityFilter {
  if (!value) {
    return "all"
  }

  return validDeliverySupportActivityFilters.has(
    value as DeliverySupportActivityFilter
  )
    ? (value as DeliverySupportActivityFilter)
    : "all"
}

export function getDeliverySupportActivityFilterLabel(
  filter: DeliverySupportActivityFilter
) {
  if (filter === "reminder_repairs") {
    return "Reminder repairs"
  }

  if (filter === "failed_reminder_repairs") {
    return "Failed reminder repairs"
  }

  if (filter === "support_handoff_notes") {
    return "Support handoff notes"
  }

  return "All support events"
}

export function getDeliverySupportActivityFilterLabelKey(
  filter: DeliverySupportActivityFilter
): AppMessageKey {
  if (filter === "reminder_repairs") {
    return "delivery.supportActivityFilter.reminder_repairs"
  }

  if (filter === "failed_reminder_repairs") {
    return "delivery.supportActivityFilter.failed_reminder_repairs"
  }

  if (filter === "support_handoff_notes") {
    return "delivery.supportActivityFilter.support_handoff_notes"
  }

  return "delivery.supportActivityFilter.all"
}

type FilterableActivityRecord = {
  metadata: unknown
}

function getActivityEntries(record: Record<string, unknown>): FilterableActivityRecord[] {
  const activityEntries = record["activityEntries"]
  if (Array.isArray(activityEntries)) {
    return activityEntries as FilterableActivityRecord[]
  }

  const activityTimeline = record["activityTimeline"]
  if (Array.isArray(activityTimeline)) {
    return activityTimeline as FilterableActivityRecord[]
  }

  return []
}

function replaceActivityEntries<TRecord extends Record<string, unknown>>(
  record: TRecord,
  activityEntries: FilterableActivityRecord[]
): TRecord {
  if (Array.isArray(record["activityEntries"])) {
    return {
      ...record,
      activityEntries
    }
  }

  if (Array.isArray(record["activityTimeline"])) {
    return {
      ...record,
      activityTimeline: activityEntries
    }
  }

  return record
}

function isSupportOriginatedActivity(activity: FilterableActivityRecord) {
  return (
    isDeliveryReminderRepairActivityMetadata(activity.metadata) ||
    isDeliveryReminderSupportNoteActivityMetadata(activity.metadata)
  )
}

function getSupportActivityCategory(
  activity: FilterableActivityRecord
): "failed_reminder_repairs" | "reminder_repairs" | "support_handoff_notes" | null {
  if (isDeliveryReminderSupportNoteActivityMetadata(activity.metadata)) {
    return "support_handoff_notes"
  }

  if (isDeliveryReminderRepairActivityMetadata(activity.metadata)) {
    return activity.metadata.repairOutcome === "error"
      ? "failed_reminder_repairs"
      : "reminder_repairs"
  }

  return null
}

export function doesDeliveryActivityMatchSupportFilter(
  activity: FilterableActivityRecord,
  filter: DeliverySupportActivityFilter
) {
  const category = getSupportActivityCategory(activity)

  if (filter === "all") {
    return isSupportOriginatedActivity(activity)
  }

  if (!category) {
    return false
  }

  if (filter === "failed_reminder_repairs") {
    return category === "failed_reminder_repairs"
  }

  if (filter === "reminder_repairs") {
    return (
      category === "reminder_repairs" ||
      category === "failed_reminder_repairs"
    )
  }

  return category === "support_handoff_notes"
}

export function summarizeDeliverySupportActivityFilter<
  TRecord extends Record<string, unknown>
>(records: TRecord[]): DeliverySupportActivityFilterSummary {
  let allCount = 0
  let reminderRepairsCount = 0
  let failedReminderRepairsCount = 0
  let supportHandoffNotesCount = 0

  for (const record of records) {
    for (const activity of getActivityEntries(record)) {
      const category = getSupportActivityCategory(activity)

      if (category === "reminder_repairs") {
        allCount += 1
        reminderRepairsCount += 1
        continue
      }

      if (category === "failed_reminder_repairs") {
        allCount += 1
        reminderRepairsCount += 1
        failedReminderRepairsCount += 1
        continue
      }

      if (category === "support_handoff_notes") {
        allCount += 1
        supportHandoffNotesCount += 1
        continue
      }

      if (isDeliveryReminderMismatchResolutionActivityMetadata(activity.metadata)) {
        continue
      }
    }
  }

  return {
    allCount,
    failedReminderRepairsCount,
    reminderRepairsCount,
    supportHandoffNotesCount
  }
}

export function filterDeliveryWorkspaceOverviewsBySupportActivityFilter<
  TRecord extends Record<string, unknown>
>(records: TRecord[], filter: DeliverySupportActivityFilter): TRecord[] {
  if (filter === "all") {
    return records.filter((record) =>
      getActivityEntries(record).some((activity) =>
        doesDeliveryActivityMatchSupportFilter(activity, "all")
      )
    )
  }

  return records.flatMap((record) => {
    const activityEntries = getActivityEntries(record).filter((activity) =>
      doesDeliveryActivityMatchSupportFilter(activity, filter)
    )

    if (activityEntries.length === 0) {
      return []
    }

    return [replaceActivityEntries(record, activityEntries)]
  })
}
