import { describe, expect, it } from "vitest"
import {
  doesDeliveryActivityMatchSupportFilter,
  filterDeliveryWorkspaceOverviewsBySupportActivityFilter,
  getDeliverySupportActivityFilterLabel,
  normalizeDeliverySupportActivityFilter,
  summarizeDeliverySupportActivityFilter
} from "./delivery-support-activity-filter"

function createReminderRepairActivity(input?: {
  repairOutcome?: "error" | "success"
}) {
  return {
    metadata: {
      clearReminderReason: null,
      errorCode: null,
      nextFollowUpDueOn: "2026-03-28",
      nextFollowUpStatus: "reminder_scheduled",
      previousFollowUpDueOn: "2026-03-27",
      previousFollowUpStatus: "reminder_scheduled",
      reminderBucket: "overdue",
      reminderNotificationId: "notification-1",
      repairAction: "reschedule_tomorrow",
      repairOutcome: input?.repairOutcome ?? "success",
      source: "reminder_support_repair"
    }
  }
}

function createSupportNoteActivity() {
  return {
    metadata: {
      linkedRepairAction: "clear_reminder_scheduling",
      note: "Waiting on revised assets",
      reminderBucket: "overdue",
      reminderNotificationId: "notification-1",
      source: "reminder_support_note"
    }
  }
}

function createGenericActivity() {
  return {
    metadata: {
      source: "something_else"
    }
  }
}

describe("normalizeDeliverySupportActivityFilter", () => {
  it("returns all for missing or invalid values", () => {
    expect(normalizeDeliverySupportActivityFilter(undefined)).toBe("all")
    expect(normalizeDeliverySupportActivityFilter("invalid")).toBe("all")
  })

  it("returns valid filter values", () => {
    expect(normalizeDeliverySupportActivityFilter("reminder_repairs")).toBe(
      "reminder_repairs"
    )
    expect(
      normalizeDeliverySupportActivityFilter("failed_reminder_repairs")
    ).toBe("failed_reminder_repairs")
    expect(
      normalizeDeliverySupportActivityFilter("support_handoff_notes")
    ).toBe("support_handoff_notes")
  })
})

describe("getDeliverySupportActivityFilterLabel", () => {
  it("returns the expected labels", () => {
    expect(getDeliverySupportActivityFilterLabel("all")).toBe(
      "All support events"
    )
    expect(getDeliverySupportActivityFilterLabel("reminder_repairs")).toBe(
      "Reminder repairs"
    )
    expect(
      getDeliverySupportActivityFilterLabel("failed_reminder_repairs")
    ).toBe("Failed reminder repairs")
    expect(
      getDeliverySupportActivityFilterLabel("support_handoff_notes")
    ).toBe("Support handoff notes")
  })
})

describe("doesDeliveryActivityMatchSupportFilter", () => {
  it("matches reminder repair activities", () => {
    expect(
      doesDeliveryActivityMatchSupportFilter(
        createReminderRepairActivity(),
        "reminder_repairs"
      )
    ).toBe(true)
  })

  it("matches failed reminder repairs only for the failed filter", () => {
    expect(
      doesDeliveryActivityMatchSupportFilter(
        createReminderRepairActivity({
          repairOutcome: "error"
        }),
        "failed_reminder_repairs"
      )
    ).toBe(true)
  })

  it("matches support handoff notes", () => {
    expect(
      doesDeliveryActivityMatchSupportFilter(
        createSupportNoteActivity(),
        "support_handoff_notes"
      )
    ).toBe(true)
  })

  it("does not match unrelated activities", () => {
    expect(
      doesDeliveryActivityMatchSupportFilter(createGenericActivity(), "all")
    ).toBe(false)
  })
})

describe("summarizeDeliverySupportActivityFilter", () => {
  it("summarizes support-originated activity counts", () => {
    expect(
      summarizeDeliverySupportActivityFilter([
        {
          activityEntries: [
            createReminderRepairActivity(),
            createReminderRepairActivity({
              repairOutcome: "error"
            }),
            createSupportNoteActivity(),
            createGenericActivity()
          ]
        }
      ])
    ).toEqual({
      allCount: 3,
      failedReminderRepairsCount: 1,
      reminderRepairsCount: 2,
      supportHandoffNotesCount: 1
    })
  })

  it("does not double-count failed reminder repairs in the all summary", () => {
    expect(
      summarizeDeliverySupportActivityFilter([
        {
          activityEntries: [
            createReminderRepairActivity({
              repairOutcome: "error"
            })
          ]
        }
      ])
    ).toEqual({
      allCount: 1,
      failedReminderRepairsCount: 1,
      reminderRepairsCount: 1,
      supportHandoffNotesCount: 0
    })
  })
})

describe("filterDeliveryWorkspaceOverviewsBySupportActivityFilter", () => {
  it("returns only workspaces and activity entries that match the active filter", () => {
    const records = [
      {
        activityEntries: [
          createReminderRepairActivity(),
          createGenericActivity()
        ],
        workspace: {
          id: "workspace-a"
        }
      },
      {
        activityEntries: [createSupportNoteActivity()],
        workspace: {
          id: "workspace-b"
        }
      }
    ]

    expect(
      filterDeliveryWorkspaceOverviewsBySupportActivityFilter(
        records,
        "support_handoff_notes"
      )
    ).toEqual([
      {
        activityEntries: [createSupportNoteActivity()],
        workspace: {
          id: "workspace-b"
        }
      }
    ])
  })
})
