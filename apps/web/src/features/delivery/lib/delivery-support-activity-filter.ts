import {
  isDeliveryReminderRepairActivityMetadata
} from "@/features/delivery/lib/delivery-reminder-repair-activity"
import {
  isDeliveryReminderSupportNoteActivityMetadata
} from "@/features/delivery/lib/delivery-reminder-support-note"

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

type FilterableActivityRecord = {
  metadata: unknown
}

type FilterableWorkspaceOverviewRecord<TActivity extends FilterableActivityRecord> = {
  activityEntries?: TActivity[]
  activityTimeline?: TActivity[]
}

function getActivityEntries<TActivity extends FilterableActivityRecord>(
  record: FilterableWorkspaceOverviewRecord<TActivity>
): TActivity[] {
  if (Array.isArray(record.activityEntries)) {
    return record.activityEntries
  }

  if (Array.isArray(record.activityTimeline)) {
    return record.activityTimeline
  }

  return []
}

function replaceActivityEntries<TActivity extends FilterableActivityRecord, TRecord extends FilterableWorkspaceOverviewRecord<TActivity>>(
  record: TRecord,
  activityEntries: TActivity[]
): TRecord {
  if (Array.isArray(record.activityEntries)) {
    return {
      ...record,
      activityEntries
    }
  }

  if (Array.isArray(record.activityTimeline)) {
    return {
      ...record,
      activityTimeline: activityEntries
    }
  }

  return record
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

  if (!category) {
    return false
  }

  if (filter === "all") {
    return true
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
  TActivity extends FilterableActivityRecord,
  TRecord extends FilterableWorkspaceOverviewRecord<TActivity>
>(records: TRecord[]): DeliverySupportActivityFilterSummary {
  let reminderRepairsCount = 0
  let failedReminderRepairsCount = 0
  let supportHandoffNotesCount = 0

  for (const record of records) {
    for (const activity of getActivityEntries(record)) {
      const category = getSupportActivityCategory(activity)

      if (category === "reminder_repairs") {
        reminderRepairsCount += 1
        continue
      }

      if (category === "failed_reminder_repairs") {
        reminderRepairsCount += 1
        failedReminderRepairsCount += 1
        continue
      }

      if (category === "support_handoff_notes") {
        supportHandoffNotesCount += 1
      }
    }
  }

  return {
    allCount:
      reminderRepairsCount +
      failedReminderRepairsCount +
      supportHandoffNotesCount,
    failedReminderRepairsCount,
    reminderRepairsCount,
    supportHandoffNotesCount
  }
}

export function filterDeliveryWorkspaceOverviewsBySupportActivityFilter<
  TActivity extends FilterableActivityRecord,
  TRecord extends FilterableWorkspaceOverviewRecord<TActivity>
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
