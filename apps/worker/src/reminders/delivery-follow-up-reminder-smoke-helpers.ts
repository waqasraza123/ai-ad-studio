export type SmokeWorkspaceRecord = {
  canonical_export_id: string | null
  follow_up_due_on: string | null
  follow_up_last_notification_bucket: string | null
  follow_up_last_notification_date: string | null
  follow_up_note: string | null
  follow_up_status: string | null
  id: string
  owner_id: string
  project_id: string
  status: string
  title: string
}

export type SmokeNotificationRecord = {
  body: string
  id: string
  kind: string
  metadata: Record<string, unknown> | null
  title: string
}

export function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function getDateKeyOffset(date: Date, dayOffset: number) {
  const shiftedDate = new Date(date.getTime())
  shiftedDate.setUTCDate(shiftedDate.getUTCDate() + dayOffset)

  return getDateKey(shiftedDate)
}

export function buildSmokeProofNote(marker: string) {
  return `Delivery reminder smoke proof marker ${marker}`
}

export function assertSmokeWorkspaceEligible(input: {
  label: string
  workspace: SmokeWorkspaceRecord
}) {
  if (input.workspace.status !== "active") {
    throw new Error(
      `${input.label} workspace must be active. Received status ${input.workspace.status} for ${input.workspace.id}`
    )
  }

  if (!input.workspace.canonical_export_id) {
    throw new Error(
      `${input.label} workspace must have canonical_export_id set. Workspace ${input.workspace.id} is not eligible`
    )
  }

  if (!input.workspace.owner_id) {
    throw new Error(
      `${input.label} workspace must have owner_id set. Workspace ${input.workspace.id} is not eligible`
    )
  }

  if (!input.workspace.project_id) {
    throw new Error(
      `${input.label} workspace must have project_id set. Workspace ${input.workspace.id} is not eligible`
    )
  }
}

export function assertReminderCheckpoint(input: {
  expectedReminderBucket: "due_today" | "overdue"
  todayDateKey: string
  workspace: SmokeWorkspaceRecord
}) {
  if (
    input.workspace.follow_up_last_notification_bucket !==
    input.expectedReminderBucket
  ) {
    throw new Error(
      `Expected workspace ${input.workspace.id} to have follow_up_last_notification_bucket ${input.expectedReminderBucket}, received ${input.workspace.follow_up_last_notification_bucket}`
    )
  }

  if (input.workspace.follow_up_last_notification_date !== input.todayDateKey) {
    throw new Error(
      `Expected workspace ${input.workspace.id} to have follow_up_last_notification_date ${input.todayDateKey}, received ${input.workspace.follow_up_last_notification_date}`
    )
  }
}

export function assertExactNotificationCount(input: {
  expectedCount: number
  label: string
  notifications: SmokeNotificationRecord[]
}) {
  if (input.notifications.length !== input.expectedCount) {
    throw new Error(
      `Expected ${input.expectedCount} ${input.label} notifications, received ${input.notifications.length}`
    )
  }
}
