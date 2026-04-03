import { describe, expect, it } from "vitest"
import type { DeliveryWorkspaceRecord } from "@/server/database/types"
import type { DeliveryReminderNotificationRecord } from "@/server/notifications/delivery-reminder-notification-repository"
import {
  buildDeliveryReminderSupportRecords,
  summarizeDeliveryReminderSupportRecords
} from "./delivery-reminder-support"

function createWorkspaceRecord(
  overrides: Partial<DeliveryWorkspaceRecord>
): DeliveryWorkspaceRecord {
  return {
    id: overrides.id ?? "workspace-1",
    owner_id: overrides.owner_id ?? "owner-1",
    project_id: overrides.project_id ?? "project-1",
    render_batch_id: overrides.render_batch_id ?? "batch-1",
    canonical_export_id: overrides.canonical_export_id ?? "export-1",
    title: overrides.title ?? "Workspace",
    summary: overrides.summary ?? "Summary",
    handoff_notes: overrides.handoff_notes ?? "Notes",
    approval_summary: overrides.approval_summary ?? {
      approved_count: 0,
      rejected_count: 0,
      pending_count: 0,
      responded_count: 0,
      review_note: null,
      finalization_note: null,
      decided_at: null,
      finalized_at: null
    },
    token: overrides.token ?? "token-1",
    status: overrides.status ?? "active",
    follow_up_status: overrides.follow_up_status ?? "reminder_scheduled",
    follow_up_note: overrides.follow_up_note ?? null,
    follow_up_due_on: overrides.follow_up_due_on ?? "2026-03-25",
    follow_up_updated_at: overrides.follow_up_updated_at ?? null,
    follow_up_last_notification_bucket:
      overrides.follow_up_last_notification_bucket ?? "due_today",
    follow_up_last_notification_date:
      overrides.follow_up_last_notification_date ?? "2026-03-25",
    reminder_mismatch_resolution_note:
      overrides.reminder_mismatch_resolution_note ?? null,
    reminder_mismatch_resolved_notification_id:
      overrides.reminder_mismatch_resolved_notification_id ?? null,
    reminder_mismatch_resolved_at: overrides.reminder_mismatch_resolved_at ?? null,
    created_at: overrides.created_at ?? "2026-03-24T08:00:00.000Z",
    updated_at: overrides.updated_at ?? "2026-03-25T09:00:00.000Z"
  }
}

function createReminderNotification(
  overrides: Partial<DeliveryReminderNotificationRecord> = {}
): DeliveryReminderNotificationRecord {
  return {
    body: overrides.body ?? "Delivery follow-up is due today for Workspace.",
    created_at: overrides.created_at ?? "2026-03-25T09:30:00.000Z",
    id: overrides.id ?? "notification-1",
    kind: overrides.kind ?? "delivery_follow_up_due_today",
    metadata: overrides.metadata ?? {
      deliveryWorkspaceId: "workspace-1",
      followUpDueOn: "2026-03-25",
      reminderBucket: "due_today"
    },
    title: overrides.title ?? "Delivery follow-up due today"
  }
}

describe("buildDeliveryReminderSupportRecords", () => {
  it("builds an in-sync record when workspace checkpoint matches the notification", () => {
    const records = buildDeliveryReminderSupportRecords({
      notifications: [createReminderNotification()],
      workspaces: [
        createWorkspaceRecord({
          follow_up_last_notification_bucket: "due_today",
          follow_up_last_notification_date: "2026-03-25",
          id: "workspace-1"
        })
      ]
    })

    expect(records).toEqual([
      {
        checkpointState: "in_sync",
        notificationBody: "Delivery follow-up is due today for Workspace.",
        notificationCreatedAt: "2026-03-25T09:30:00.000Z",
        notificationFollowUpDueOn: "2026-03-25",
        notificationId: "notification-1",
        notificationKind: "delivery_follow_up_due_today",
        notificationTitle: "Delivery follow-up due today",
        reminderBucket: "due_today",
        workspaceFollowUpDueOn: "2026-03-25",
        workspaceFollowUpStatus: "reminder_scheduled",
        workspaceId: "workspace-1",
        workspaceLastNotificationBucket: "due_today",
        workspaceLastNotificationDate: "2026-03-25",
        workspaceTitle: "Workspace"
      }
    ])
  })

  it("marks a record as checkpoint mismatch when the workspace checkpoint no longer matches", () => {
    const records = buildDeliveryReminderSupportRecords({
      notifications: [
        createReminderNotification({
          kind: "delivery_follow_up_overdue",
          metadata: {
            deliveryWorkspaceId: "workspace-1",
            followUpDueOn: "2026-03-24",
            reminderBucket: "overdue"
          }
        })
      ],
      workspaces: [
        createWorkspaceRecord({
          follow_up_last_notification_bucket: "due_today",
          follow_up_last_notification_date: "2026-03-25",
          id: "workspace-1"
        })
      ]
    })

    expect(records[0]?.checkpointState).toBe("checkpoint_mismatch")
    expect(records[0]?.reminderBucket).toBe("overdue")
  })


  it("marks a record as resolved when the workspace resolution points at the same notification", () => {
    const records = buildDeliveryReminderSupportRecords({
      notifications: [createReminderNotification()],
      workspaces: [
        createWorkspaceRecord({
          id: "workspace-1",
          reminder_mismatch_resolved_at: "2026-03-26T10:00:00.000Z",
          reminder_mismatch_resolved_notification_id: "notification-1",
          reminder_mismatch_resolution_note: "Operator confirmed resolution"
        })
      ]
    })

    expect(records[0]?.checkpointState).toBe("resolved")
  })

  it("marks a record as workspace missing when the referenced workspace cannot be resolved", () => {
    const records = buildDeliveryReminderSupportRecords({
      notifications: [
        createReminderNotification({
          metadata: {
            deliveryWorkspaceId: "workspace-missing",
            followUpDueOn: "2026-03-25",
            reminderBucket: "due_today"
          }
        })
      ],
      workspaces: []
    })

    expect(records).toEqual([
      {
        checkpointState: "workspace_missing",
        notificationBody: "Delivery follow-up is due today for Workspace.",
        notificationCreatedAt: "2026-03-25T09:30:00.000Z",
        notificationFollowUpDueOn: "2026-03-25",
        notificationId: "notification-1",
        notificationKind: "delivery_follow_up_due_today",
        notificationTitle: "Delivery follow-up due today",
        reminderBucket: "due_today",
        workspaceFollowUpDueOn: null,
        workspaceFollowUpStatus: null,
        workspaceId: "workspace-missing",
        workspaceLastNotificationBucket: null,
        workspaceLastNotificationDate: null,
        workspaceTitle: null
      }
    ])
  })

  it("falls back to the notification kind when reminderBucket metadata is missing", () => {
    const records = buildDeliveryReminderSupportRecords({
      notifications: [
        createReminderNotification({
          kind: "delivery_follow_up_overdue",
          metadata: {
            deliveryWorkspaceId: "workspace-1",
            followUpDueOn: "2026-03-24"
          }
        })
      ],
      workspaces: [
        createWorkspaceRecord({
          follow_up_last_notification_bucket: "overdue",
          follow_up_last_notification_date: "2026-03-25",
          id: "workspace-1"
        })
      ]
    })

    expect(records[0]?.reminderBucket).toBe("overdue")
    expect(records[0]?.checkpointState).toBe("in_sync")
  })
})

describe("summarizeDeliveryReminderSupportRecords", () => {
  it("summarizes bucket totals and checkpoint states", () => {
    const records = buildDeliveryReminderSupportRecords({
      notifications: [
        createReminderNotification({
          id: "notification-a"
        }),
        createReminderNotification({
          id: "notification-b",
          kind: "delivery_follow_up_overdue",
          metadata: {
            deliveryWorkspaceId: "workspace-2",
            followUpDueOn: "2026-03-24",
            reminderBucket: "overdue"
          }
        }),
        createReminderNotification({
          id: "notification-c",
          metadata: {
            deliveryWorkspaceId: "workspace-missing",
            followUpDueOn: "2026-03-25",
            reminderBucket: "due_today"
          }
        })
      ],
      workspaces: [
        createWorkspaceRecord({
          id: "workspace-1"
        }),
        createWorkspaceRecord({
          follow_up_last_notification_bucket: "due_today",
          follow_up_last_notification_date: "2026-03-25",
          id: "workspace-2"
        })
      ]
    })

    expect(summarizeDeliveryReminderSupportRecords(records)).toEqual({
      checkpointMismatchCount: 1,
      dueTodayCount: 2,
      inSyncCount: 1,
      overdueCount: 1,
      resolvedCount: 0,
      totalCount: 3,
      workspaceMissingCount: 1
    })
  })
})
