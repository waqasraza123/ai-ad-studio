import { describe, expect, it } from "vitest"
import {
  runDeliveryFollowUpReminderSweep,
  type DeliveryFollowUpReminderSweepStore,
  type DeliveryReminderNotificationInsertRecord,
  type DeliveryWorkspaceReminderCheckpoint,
  type DeliveryWorkspaceReminderRow
} from "./run-delivery-follow-up-reminder-sweep"

function createWorkspaceReminderRow(
  overrides: Partial<DeliveryWorkspaceReminderRow> = {}
): DeliveryWorkspaceReminderRow {
  return {
    canonical_export_id: overrides.canonical_export_id ?? "export-1",
    follow_up_due_on: overrides.follow_up_due_on ?? "2026-03-23",
    follow_up_last_notification_bucket:
      overrides.follow_up_last_notification_bucket ?? null,
    follow_up_last_notification_date:
      overrides.follow_up_last_notification_date ?? null,
    follow_up_note: overrides.follow_up_note ?? null,
    id: overrides.id ?? "workspace-1",
    owner_id: overrides.owner_id ?? "owner-1",
    project_id: overrides.project_id ?? "project-1",
    title: overrides.title ?? "Launch delivery"
  }
}

function createReminderSweepStoreDouble(input?: {
  checkpointFailuresByWorkspaceId?: Record<string, unknown>
  loadError?: unknown
  notificationFailuresByWorkspaceId?: Record<string, unknown>
  workspaces?: DeliveryWorkspaceReminderRow[]
}) {
  const notificationAttempts: DeliveryReminderNotificationInsertRecord[] = []
  const checkpointAttempts: DeliveryWorkspaceReminderCheckpoint[] = []

  const store: DeliveryFollowUpReminderSweepStore = {
    async loadReminderScheduledWorkspaces() {
      if (input?.loadError) {
        return {
          data: null,
          error: input.loadError
        }
      }

      return {
        data: input?.workspaces ?? [],
        error: null
      }
    },

    async createReminderNotification(notification) {
      notificationAttempts.push(notification)

      return {
        error:
          input?.notificationFailuresByWorkspaceId?.[
            notification.metadata.deliveryWorkspaceId
          ] ?? null
      }
    },

    async persistReminderNotificationCheckpoint(checkpoint) {
      checkpointAttempts.push(checkpoint)

      return {
        error:
          input?.checkpointFailuresByWorkspaceId?.[checkpoint.workspaceId] ?? null
      }
    }
  }

  return {
    checkpointAttempts,
    notificationAttempts,
    store
  }
}

describe("runDeliveryFollowUpReminderSweep", () => {
  it("creates a due-today reminder notification and checkpoint", async () => {
    const { checkpointAttempts, notificationAttempts, store } =
      createReminderSweepStoreDouble({
        workspaces: [
          createWorkspaceReminderRow({
            follow_up_note: "  Send a quick WhatsApp follow-up.  ",
            id: "workspace-due-today",
            title: "Spring launch delivery"
          })
        ]
      })

    const result = await runDeliveryFollowUpReminderSweep({
      now: new Date("2026-03-23T10:15:00.000Z"),
      store
    })

    expect(result).toEqual({
      failureCount: 0,
      failures: [],
      notifiedCount: 1,
      scannedCount: 1,
      todayDateKey: "2026-03-23"
    })

    expect(notificationAttempts).toEqual([
      {
        action_url:
          "/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity",
        body: "Delivery follow-up is due today for Spring launch delivery. Scheduled date: 2026-03-23. Send a quick WhatsApp follow-up.",
        export_id: "export-1",
        job_id: null,
        kind: "delivery_follow_up_due_today",
        metadata: {
          deliveryWorkspaceId: "workspace-due-today",
          followUpDueOn: "2026-03-23",
          reminderBucket: "due_today"
        },
        owner_id: "owner-1",
        project_id: "project-1",
        severity: "info",
        title: "Delivery follow-up due today"
      }
    ])

    expect(checkpointAttempts).toEqual([
      {
        reminderBucket: "due_today",
        todayDateKey: "2026-03-23",
        updatedAtIsoString: "2026-03-23T10:15:00.000Z",
        workspaceId: "workspace-due-today"
      }
    ])
  })

  it("creates an overdue reminder notification with warning severity", async () => {
    const { checkpointAttempts, notificationAttempts, store } =
      createReminderSweepStoreDouble({
        workspaces: [
          createWorkspaceReminderRow({
            follow_up_due_on: "2026-03-22",
            id: "workspace-overdue"
          })
        ]
      })

    const result = await runDeliveryFollowUpReminderSweep({
      now: new Date("2026-03-23T10:15:00.000Z"),
      store
    })

    expect(result).toEqual({
      failureCount: 0,
      failures: [],
      notifiedCount: 1,
      scannedCount: 1,
      todayDateKey: "2026-03-23"
    })

    expect(notificationAttempts).toEqual([
      {
        action_url:
          "/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity",
        body: "Delivery follow-up is overdue for Launch delivery. Scheduled date: 2026-03-22.",
        export_id: "export-1",
        job_id: null,
        kind: "delivery_follow_up_overdue",
        metadata: {
          deliveryWorkspaceId: "workspace-overdue",
          followUpDueOn: "2026-03-22",
          reminderBucket: "overdue"
        },
        owner_id: "owner-1",
        project_id: "project-1",
        severity: "warning",
        title: "Delivery follow-up overdue"
      }
    ])

    expect(checkpointAttempts).toEqual([
      {
        reminderBucket: "overdue",
        todayDateKey: "2026-03-23",
        updatedAtIsoString: "2026-03-23T10:15:00.000Z",
        workspaceId: "workspace-overdue"
      }
    ])
  })

  it("skips a workspace that was already notified in the same bucket today", async () => {
    const { checkpointAttempts, notificationAttempts, store } =
      createReminderSweepStoreDouble({
        workspaces: [
          createWorkspaceReminderRow({
            follow_up_last_notification_bucket: "due_today",
            follow_up_last_notification_date: "2026-03-23",
            id: "workspace-already-notified"
          })
        ]
      })

    const result = await runDeliveryFollowUpReminderSweep({
      now: new Date("2026-03-23T10:15:00.000Z"),
      store
    })

    expect(result).toEqual({
      failureCount: 0,
      failures: [],
      notifiedCount: 0,
      scannedCount: 1,
      todayDateKey: "2026-03-23"
    })

    expect(notificationAttempts).toEqual([])
    expect(checkpointAttempts).toEqual([])
  })

  it("collects notification failures and continues processing later workspaces", async () => {
    const { checkpointAttempts, notificationAttempts, store } =
      createReminderSweepStoreDouble({
        notificationFailuresByWorkspaceId: {
          "workspace-failed": new Error("insert failed")
        },
        workspaces: [
          createWorkspaceReminderRow({
            id: "workspace-failed",
            title: "Failed delivery"
          }),
          createWorkspaceReminderRow({
            follow_up_due_on: "2026-03-22",
            id: "workspace-overdue"
          })
        ]
      })

    const result = await runDeliveryFollowUpReminderSweep({
      now: new Date("2026-03-23T10:15:00.000Z"),
      store
    })

    expect(result).toEqual({
      failureCount: 1,
      failures: ["workspace-failed: Failed to create reminder notification"],
      notifiedCount: 1,
      scannedCount: 2,
      todayDateKey: "2026-03-23"
    })

    expect(
      notificationAttempts.map(
        (notification) => notification.metadata.deliveryWorkspaceId
      )
    ).toEqual(["workspace-failed", "workspace-overdue"])

    expect(checkpointAttempts).toEqual([
      {
        reminderBucket: "overdue",
        todayDateKey: "2026-03-23",
        updatedAtIsoString: "2026-03-23T10:15:00.000Z",
        workspaceId: "workspace-overdue"
      }
    ])
  })

  it("collects checkpoint persistence failures", async () => {
    const { checkpointAttempts, notificationAttempts, store } =
      createReminderSweepStoreDouble({
        checkpointFailuresByWorkspaceId: {
          "workspace-checkpoint-failed": new Error("update failed")
        },
        workspaces: [
          createWorkspaceReminderRow({
            id: "workspace-checkpoint-failed"
          })
        ]
      })

    const result = await runDeliveryFollowUpReminderSweep({
      now: new Date("2026-03-23T10:15:00.000Z"),
      store
    })

    expect(result).toEqual({
      failureCount: 1,
      failures: [
        "workspace-checkpoint-failed: Failed to persist reminder notification checkpoint"
      ],
      notifiedCount: 0,
      scannedCount: 1,
      todayDateKey: "2026-03-23"
    })

    expect(notificationAttempts).toHaveLength(1)
    expect(checkpointAttempts).toEqual([
      {
        reminderBucket: "due_today",
        todayDateKey: "2026-03-23",
        updatedAtIsoString: "2026-03-23T10:15:00.000Z",
        workspaceId: "workspace-checkpoint-failed"
      }
    ])
  })

  it("throws when loading reminder-scheduled workspaces fails", async () => {
    const { store } = createReminderSweepStoreDouble({
      loadError: new Error("load failed")
    })

    await expect(
      runDeliveryFollowUpReminderSweep({
        now: new Date("2026-03-23T10:15:00.000Z"),
        store
      })
    ).rejects.toThrow("Failed to load reminder-scheduled delivery workspaces")
  })
})
