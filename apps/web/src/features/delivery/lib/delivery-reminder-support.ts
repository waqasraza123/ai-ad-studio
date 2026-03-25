import type { DeliveryWorkspaceRecord } from "@/server/database/types"
import type {
  DeliveryReminderNotificationKind,
  DeliveryReminderNotificationRecord
} from "@/server/notifications/delivery-reminder-notification-repository"

export type DeliveryReminderSupportCheckpointState =
  | "checkpoint_mismatch"
  | "in_sync"
  | "workspace_missing"

export type DeliveryReminderSupportRecord = {
  checkpointState: DeliveryReminderSupportCheckpointState
  notificationBody: string
  notificationCreatedAt: string
  notificationFollowUpDueOn: string | null
  notificationId: string
  notificationKind: DeliveryReminderNotificationKind
  notificationTitle: string
  reminderBucket: "due_today" | "overdue"
  workspaceFollowUpDueOn: string | null
  workspaceFollowUpStatus: DeliveryWorkspaceRecord["follow_up_status"] | null
  workspaceId: string | null
  workspaceLastNotificationBucket:
    | DeliveryWorkspaceRecord["follow_up_last_notification_bucket"]
    | null
  workspaceLastNotificationDate: string | null
  workspaceTitle: string | null
}

export type DeliveryReminderSupportSummary = {
  checkpointMismatchCount: number
  dueTodayCount: number
  inSyncCount: number
  overdueCount: number
  totalCount: number
  workspaceMissingCount: number
}

function getMetadataRecord(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null
  }

  return metadata as Record<string, unknown>
}

function getReminderBucketFromKind(kind: DeliveryReminderNotificationKind) {
  return kind === "delivery_follow_up_overdue" ? "overdue" : "due_today"
}

function getStringValue(
  record: Record<string, unknown> | null,
  key: string
): string | null {
  const value = record?.[key]
  return typeof value === "string" && value.length > 0 ? value : null
}

function resolveReminderBucket(
  notification: DeliveryReminderNotificationRecord,
  metadata: Record<string, unknown> | null
) {
  const metadataReminderBucket = getStringValue(metadata, "reminderBucket")

  if (
    metadataReminderBucket === "due_today" ||
    metadataReminderBucket === "overdue"
  ) {
    return metadataReminderBucket
  }

  return getReminderBucketFromKind(notification.kind)
}

function resolveCheckpointState(input: {
  notificationCreatedAt: string
  reminderBucket: "due_today" | "overdue"
  workspace: DeliveryWorkspaceRecord | null
}): DeliveryReminderSupportCheckpointState {
  if (!input.workspace) {
    return "workspace_missing"
  }

  const notificationDateKey = input.notificationCreatedAt.slice(0, 10)

  if (
    input.workspace.follow_up_last_notification_bucket === input.reminderBucket &&
    input.workspace.follow_up_last_notification_date === notificationDateKey
  ) {
    return "in_sync"
  }

  return "checkpoint_mismatch"
}

export function buildDeliveryReminderSupportRecords(input: {
  notifications: DeliveryReminderNotificationRecord[]
  workspaces: DeliveryWorkspaceRecord[]
}) {
  const workspacesById = new Map(
    input.workspaces.map((workspace) => [workspace.id, workspace])
  )

  return input.notifications.map((notification) => {
    const metadata = getMetadataRecord(notification.metadata)
    const workspaceId = getStringValue(metadata, "deliveryWorkspaceId")
    const workspace = workspaceId ? workspacesById.get(workspaceId) ?? null : null
    const reminderBucket = resolveReminderBucket(notification, metadata)

    return {
      checkpointState: resolveCheckpointState({
        notificationCreatedAt: notification.created_at,
        reminderBucket,
        workspace
      }),
      notificationBody: notification.body,
      notificationCreatedAt: notification.created_at,
      notificationFollowUpDueOn: getStringValue(metadata, "followUpDueOn"),
      notificationId: notification.id,
      notificationKind: notification.kind,
      notificationTitle: notification.title,
      reminderBucket,
      workspaceFollowUpDueOn: workspace?.follow_up_due_on ?? null,
      workspaceFollowUpStatus: workspace?.follow_up_status ?? null,
      workspaceId,
      workspaceLastNotificationBucket:
        workspace?.follow_up_last_notification_bucket ?? null,
      workspaceLastNotificationDate:
        workspace?.follow_up_last_notification_date ?? null,
      workspaceTitle: workspace?.title ?? null
    } satisfies DeliveryReminderSupportRecord
  })
}

export function summarizeDeliveryReminderSupportRecords(
  records: DeliveryReminderSupportRecord[]
): DeliveryReminderSupportSummary {
  let dueTodayCount = 0
  let overdueCount = 0
  let inSyncCount = 0
  let checkpointMismatchCount = 0
  let workspaceMissingCount = 0

  for (const record of records) {
    if (record.reminderBucket === "due_today") {
      dueTodayCount += 1
    } else {
      overdueCount += 1
    }

    if (record.checkpointState === "in_sync") {
      inSyncCount += 1
      continue
    }

    if (record.checkpointState === "checkpoint_mismatch") {
      checkpointMismatchCount += 1
      continue
    }

    workspaceMissingCount += 1
  }

  return {
    checkpointMismatchCount,
    dueTodayCount,
    inSyncCount,
    overdueCount,
    totalCount: records.length,
    workspaceMissingCount
  }
}
