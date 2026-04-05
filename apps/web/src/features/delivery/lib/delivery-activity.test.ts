import { describe, expect, it } from "vitest"
import type { DeliveryWorkspaceEventRecord } from "@/server/database/types"
import {
  resolveDeliveryWorkspaceEventPresentation,
  summarizeDeliveryWorkspaceActivity
} from "./delivery-activity"

function createEvent(
  overrides: Partial<DeliveryWorkspaceEventRecord>
): DeliveryWorkspaceEventRecord {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    delivery_workspace_id: overrides.delivery_workspace_id ?? "workspace-1",
    owner_id: overrides.owner_id ?? "owner-1",
    project_id: overrides.project_id ?? "project-1",
    export_id: overrides.export_id ?? null,
    event_type: overrides.event_type ?? "viewed",
    actor_label: overrides.actor_label ?? null,
    metadata: overrides.metadata ?? {},
    created_at: overrides.created_at ?? "2026-03-21T00:00:00.000Z"
  }
}

describe("summarizeDeliveryWorkspaceActivity", () => {
  it("tracks delivered, viewed, downloaded, and acknowledged state", () => {
    const summary = summarizeDeliveryWorkspaceActivity([
      createEvent({
        event_type: "delivered",
        created_at: "2026-03-21T10:00:00.000Z"
      }),
      createEvent({
        event_type: "viewed",
        created_at: "2026-03-21T11:00:00.000Z"
      }),
      createEvent({
        event_type: "downloaded",
        created_at: "2026-03-21T12:00:00.000Z",
        export_id: "export-1"
      }),
      createEvent({
        event_type: "downloaded",
        created_at: "2026-03-21T13:00:00.000Z",
        export_id: "export-2"
      }),
      createEvent({
        event_type: "acknowledged",
        created_at: "2026-03-21T14:00:00.000Z",
        actor_label: "Client Team",
        metadata: {
          note: "Received and reviewed."
        }
      })
    ])

    expect(summary).toEqual({
      acknowledgedAt: "2026-03-21T14:00:00.000Z",
      acknowledgedBy: "Client Team",
      acknowledgementNote: "Received and reviewed.",
      deliveredAt: "2026-03-21T10:00:00.000Z",
      downloadCount: 2,
      lastDownloadedAt: "2026-03-21T13:00:00.000Z",
      lastViewedAt: "2026-03-21T11:00:00.000Z"
    })
  })

  it("keeps the earliest delivered timestamp and latest viewed/downloaded/acknowledged timestamps", () => {
    const summary = summarizeDeliveryWorkspaceActivity([
      createEvent({
        event_type: "delivered",
        created_at: "2026-03-21T12:00:00.000Z"
      }),
      createEvent({
        event_type: "delivered",
        created_at: "2026-03-21T09:00:00.000Z"
      }),
      createEvent({
        event_type: "viewed",
        created_at: "2026-03-21T10:00:00.000Z"
      }),
      createEvent({
        event_type: "viewed",
        created_at: "2026-03-21T15:00:00.000Z"
      }),
      createEvent({
        event_type: "downloaded",
        created_at: "2026-03-21T11:00:00.000Z"
      }),
      createEvent({
        event_type: "downloaded",
        created_at: "2026-03-21T16:00:00.000Z"
      }),
      createEvent({
        event_type: "acknowledged",
        created_at: "2026-03-21T13:00:00.000Z",
        actor_label: "Old Contact",
        metadata: {
          note: "First acknowledgement"
        }
      }),
      createEvent({
        event_type: "acknowledged",
        created_at: "2026-03-21T17:00:00.000Z",
        actor_label: "New Contact",
        metadata: {
          note: "Latest acknowledgement"
        }
      })
    ])

    expect(summary.deliveredAt).toBe("2026-03-21T09:00:00.000Z")
    expect(summary.lastViewedAt).toBe("2026-03-21T15:00:00.000Z")
    expect(summary.lastDownloadedAt).toBe("2026-03-21T16:00:00.000Z")
    expect(summary.downloadCount).toBe(2)
    expect(summary.acknowledgedAt).toBe("2026-03-21T17:00:00.000Z")
    expect(summary.acknowledgedBy).toBe("New Contact")
    expect(summary.acknowledgementNote).toBe("Latest acknowledgement")
  })
})

describe("resolveDeliveryWorkspaceEventPresentation", () => {
  it("renders reminder mismatch reopen activity metadata", () => {
    const presentation = resolveDeliveryWorkspaceEventPresentation(
      createEvent({
        event_type: "acknowledged",
        metadata: {
          errorCode: null,
          reminderBucket: "overdue",
          reminderNotificationId: "notification-1",
          reopenNote: "Needs another review pass.",
          reopenOutcome: "success",
          source: "reminder_mismatch_reopened"
        }
      })
    )

    expect(presentation).toEqual({
      badgeClassName: "border-amber-400/30 bg-amber-500/10 text-amber-200",
      badgeLabel: "Mismatch reopened",
      description:
        "Reopened resolved reminder mismatch from overdue reminder context. Needs another review pass.",
      title: "Reopened previously resolved reminder mismatch"
    })
  })
})
