import { describe, expect, it } from "vitest"
import {
  runDeliveryFollowUpReminderSweep,
  type DeliveryFollowUpReminderSweepStore,
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
  atomicWriteResultsByWorkspaceId?: Record<
    string,
    { created: boolean; reminder_bucket: string | null }
  >
  atomicWriteErrorsByWorkspaceId?: Record<string, unknown>
  loadError?: unknown
  workspaces?: DeliveryWorkspaceReminderRow[]
}) {
  const atomicWriteAttempts: {
    exportId: string
    notificationBody: string
    notificationKind: string
    notificationSeverity: "info" | "warning"
    notificationTitle: string
    ownerId: string
    projectId: string
    todayDateKey: string
    updatedAtIsoString: string
    workspaceId: string
  }[] = []

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

    async createReminderNotificationAtomically(payload) {
      atomicWriteAttempts.push(payload)

      return {
        data: [
          input?.atomicWriteResultsByWorkspaceId?.[payload.workspaceId] ?? {
            created: true,
            reminder_bucket:
              payload.notificationKind === "delivery_follow_up_overdue"
                ? "overdue"
                : "due_today"
          }
        ],
        error:
          input?.atomicWriteErrorsByWorkspaceId?.[payload.workspaceId] ?? null
      }
    }
  }

  return {
    atomicWriteAttempts,
    store
  }
}

describe("runDeliveryFollowUpReminderSweep", () => {
  it("creates a due-today atomic reminder notification", async () => {
    const { atomicWriteAttempts, store } = createReminderSweepStoreDouble({
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

    expect(atomicWriteAttempts).toEqual([
      {
        exportId: "export-1",
        notificationBody:
          "Delivery follow-up is due today for Spring launch delivery. Scheduled date: 2026-03-23. Send a quick WhatsApp follow-up.",
        notificationKind: "delivery_follow_up_due_today",
        notificationSeverity: "info",
        notificationTitle: "Delivery follow-up due today",
        ownerId: "owner-1",
        projectId: "project-1",
        todayDateKey: "2026-03-23",
        updatedAtIsoString: "2026-03-23T10:15:00.000Z",
        workspaceId: "workspace-due-today"
      }
    ])
  })

  it("creates an overdue atomic reminder notification", async () => {
    const { atomicWriteAttempts, store } = createReminderSweepStoreDouble({
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

    expect(atomicWriteAttempts).toEqual([
      {
        exportId: "export-1",
        notificationBody:
          "Delivery follow-up is overdue for Launch delivery. Scheduled date: 2026-03-22.",
        notificationKind: "delivery_follow_up_overdue",
        notificationSeverity: "warning",
        notificationTitle: "Delivery follow-up overdue",
        ownerId: "owner-1",
        projectId: "project-1",
        todayDateKey: "2026-03-23",
        updatedAtIsoString: "2026-03-23T10:15:00.000Z",
        workspaceId: "workspace-overdue"
      }
    ])
  })

  it("skips a workspace that was already notified in the same bucket today", async () => {
    const { atomicWriteAttempts, store } = createReminderSweepStoreDouble({
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

    expect(atomicWriteAttempts).toEqual([])
  })

  it("does not increment notified count when the atomic write returns created false", async () => {
    const { atomicWriteAttempts, store } = createReminderSweepStoreDouble({
      atomicWriteResultsByWorkspaceId: {
        "workspace-raced": {
          created: false,
          reminder_bucket: "due_today"
        }
      },
      workspaces: [
        createWorkspaceReminderRow({
          id: "workspace-raced"
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

    expect(atomicWriteAttempts).toHaveLength(1)
  })

  it("collects atomic write failures and continues processing later workspaces", async () => {
    const { atomicWriteAttempts, store } = createReminderSweepStoreDouble({
      atomicWriteErrorsByWorkspaceId: {
        "workspace-failed": new Error("rpc failed")
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
      failures: ["workspace-failed: Failed to create atomic reminder notification"],
      notifiedCount: 1,
      scannedCount: 2,
      todayDateKey: "2026-03-23"
    })

    expect(atomicWriteAttempts.map((attempt) => attempt.workspaceId)).toEqual([
      "workspace-failed",
      "workspace-overdue"
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
