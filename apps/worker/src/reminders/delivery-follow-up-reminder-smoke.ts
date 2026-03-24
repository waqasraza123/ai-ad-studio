import { fileURLToPath } from "node:url"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import { runDeliveryFollowUpReminderSweep } from "./run-delivery-follow-up-reminder-sweep"
import {
  assertExactNotificationCount,
  assertReminderCheckpoint,
  assertSmokeWorkspaceEligible,
  buildSmokeProofNote,
  getDateKey,
  getDateKeyOffset,
  type SmokeNotificationRecord,
  type SmokeWorkspaceRecord
} from "./delivery-follow-up-reminder-smoke-helpers"

function getRequiredEnvironmentValue(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is required`)
  }

  return value
}

function assertSmokeConfirmation() {
  const confirmationValue = getRequiredEnvironmentValue(
    "DELIVERY_REMINDER_SMOKE_CONFIRM"
  )

  if (confirmationValue !== "I_UNDERSTAND_THIS_MUTATES_WORKSPACES") {
    throw new Error(
      "DELIVERY_REMINDER_SMOKE_CONFIRM must equal I_UNDERSTAND_THIS_MUTATES_WORKSPACES"
    )
  }
}

function createSmokeMarker(input: {
  label: "due_today" | "overdue"
  now: Date
  workspaceId: string
}) {
  return `delivery-reminder-smoke:${input.label}:${input.workspaceId}:${input.now.toISOString()}`
}

async function loadWorkspace(input: {
  supabase: ReturnType<typeof createSupabaseAdminClient>
  workspaceId: string
}) {
  const { data, error } = await input.supabase
    .from("delivery_workspaces")
    .select(
      "id, title, status, owner_id, project_id, canonical_export_id, follow_up_status, follow_up_note, follow_up_due_on, follow_up_last_notification_bucket, follow_up_last_notification_date"
    )
    .eq("id", input.workspaceId)
    .single()

  if (error || !data) {
    throw new Error(
      `Failed to load delivery workspace ${input.workspaceId}: ${error?.message ?? "Unknown error"}`
    )
  }

  return data as SmokeWorkspaceRecord
}

async function prepareWorkspaceForSmoke(input: {
  followUpDueOn: string
  followUpNote: string
  supabase: ReturnType<typeof createSupabaseAdminClient>
  workspaceId: string
}) {
  const { error } = await input.supabase
    .from("delivery_workspaces")
    .update({
      follow_up_due_on: input.followUpDueOn,
      follow_up_last_notification_bucket: null,
      follow_up_last_notification_date: null,
      follow_up_note: input.followUpNote,
      follow_up_status: "reminder_scheduled"
    })
    .eq("id", input.workspaceId)

  if (error) {
    throw new Error(
      `Failed to prepare delivery workspace ${input.workspaceId} for smoke proof: ${error.message}`
    )
  }
}

async function loadSmokeNotifications(input: {
  kind: "delivery_follow_up_due_today" | "delivery_follow_up_overdue"
  marker: string
  ownerId: string
  projectId: string
  reminderBucket: "due_today" | "overdue"
  supabase: ReturnType<typeof createSupabaseAdminClient>
  workspaceId: string
}) {
  const { data, error } = await input.supabase
    .from("notifications")
    .select("id, kind, title, body, metadata")
    .eq("owner_id", input.ownerId)
    .eq("project_id", input.projectId)
    .eq("kind", input.kind)
    .contains("metadata", {
      deliveryWorkspaceId: input.workspaceId,
      reminderBucket: input.reminderBucket
    })
    .ilike("body", `%${input.marker}%`)

  if (error) {
    throw new Error(
      `Failed to load smoke notifications for workspace ${input.workspaceId}: ${error.message}`
    )
  }

  return (data ?? []) as SmokeNotificationRecord[]
}

async function runDeliveryFollowUpReminderSmokeProof() {
  assertSmokeConfirmation()

  const dueTodayWorkspaceId = getRequiredEnvironmentValue(
    "DELIVERY_REMINDER_SMOKE_DUE_TODAY_WORKSPACE_ID"
  )
  const overdueWorkspaceId = getRequiredEnvironmentValue(
    "DELIVERY_REMINDER_SMOKE_OVERDUE_WORKSPACE_ID"
  )

  if (dueTodayWorkspaceId === overdueWorkspaceId) {
    throw new Error(
      "DELIVERY_REMINDER_SMOKE_DUE_TODAY_WORKSPACE_ID and DELIVERY_REMINDER_SMOKE_OVERDUE_WORKSPACE_ID must be different"
    )
  }

  const now = new Date()
  const todayDateKey = getDateKey(now)
  const overdueDateKey = getDateKeyOffset(now, -1)
  const supabase = createSupabaseAdminClient()

  const dueTodayWorkspaceBefore = await loadWorkspace({
    supabase,
    workspaceId: dueTodayWorkspaceId
  })
  const overdueWorkspaceBefore = await loadWorkspace({
    supabase,
    workspaceId: overdueWorkspaceId
  })

  assertSmokeWorkspaceEligible({
    label: "due_today",
    workspace: dueTodayWorkspaceBefore
  })
  assertSmokeWorkspaceEligible({
    label: "overdue",
    workspace: overdueWorkspaceBefore
  })

  const dueTodayMarker = createSmokeMarker({
    label: "due_today",
    now,
    workspaceId: dueTodayWorkspaceId
  })
  const overdueMarker = createSmokeMarker({
    label: "overdue",
    now,
    workspaceId: overdueWorkspaceId
  })

  await prepareWorkspaceForSmoke({
    followUpDueOn: todayDateKey,
    followUpNote: buildSmokeProofNote(dueTodayMarker),
    supabase,
    workspaceId: dueTodayWorkspaceId
  })
  await prepareWorkspaceForSmoke({
    followUpDueOn: overdueDateKey,
    followUpNote: buildSmokeProofNote(overdueMarker),
    supabase,
    workspaceId: overdueWorkspaceId
  })

  const firstSweepResult = await runDeliveryFollowUpReminderSweep({
    now
  })

  const dueTodayWorkspaceAfterFirstSweep = await loadWorkspace({
    supabase,
    workspaceId: dueTodayWorkspaceId
  })
  const overdueWorkspaceAfterFirstSweep = await loadWorkspace({
    supabase,
    workspaceId: overdueWorkspaceId
  })

  assertReminderCheckpoint({
    expectedReminderBucket: "due_today",
    todayDateKey,
    workspace: dueTodayWorkspaceAfterFirstSweep
  })
  assertReminderCheckpoint({
    expectedReminderBucket: "overdue",
    todayDateKey,
    workspace: overdueWorkspaceAfterFirstSweep
  })

  const dueTodayNotificationsAfterFirstSweep = await loadSmokeNotifications({
    kind: "delivery_follow_up_due_today",
    marker: dueTodayMarker,
    ownerId: dueTodayWorkspaceAfterFirstSweep.owner_id,
    projectId: dueTodayWorkspaceAfterFirstSweep.project_id,
    reminderBucket: "due_today",
    supabase,
    workspaceId: dueTodayWorkspaceAfterFirstSweep.id
  })
  const overdueNotificationsAfterFirstSweep = await loadSmokeNotifications({
    kind: "delivery_follow_up_overdue",
    marker: overdueMarker,
    ownerId: overdueWorkspaceAfterFirstSweep.owner_id,
    projectId: overdueWorkspaceAfterFirstSweep.project_id,
    reminderBucket: "overdue",
    supabase,
    workspaceId: overdueWorkspaceAfterFirstSweep.id
  })

  assertExactNotificationCount({
    expectedCount: 1,
    label: "due_today",
    notifications: dueTodayNotificationsAfterFirstSweep
  })
  assertExactNotificationCount({
    expectedCount: 1,
    label: "overdue",
    notifications: overdueNotificationsAfterFirstSweep
  })

  const secondSweepResult = await runDeliveryFollowUpReminderSweep({
    now
  })

  const dueTodayWorkspaceAfterSecondSweep = await loadWorkspace({
    supabase,
    workspaceId: dueTodayWorkspaceId
  })
  const overdueWorkspaceAfterSecondSweep = await loadWorkspace({
    supabase,
    workspaceId: overdueWorkspaceId
  })

  assertReminderCheckpoint({
    expectedReminderBucket: "due_today",
    todayDateKey,
    workspace: dueTodayWorkspaceAfterSecondSweep
  })
  assertReminderCheckpoint({
    expectedReminderBucket: "overdue",
    todayDateKey,
    workspace: overdueWorkspaceAfterSecondSweep
  })

  const dueTodayNotificationsAfterSecondSweep = await loadSmokeNotifications({
    kind: "delivery_follow_up_due_today",
    marker: dueTodayMarker,
    ownerId: dueTodayWorkspaceAfterSecondSweep.owner_id,
    projectId: dueTodayWorkspaceAfterSecondSweep.project_id,
    reminderBucket: "due_today",
    supabase,
    workspaceId: dueTodayWorkspaceAfterSecondSweep.id
  })
  const overdueNotificationsAfterSecondSweep = await loadSmokeNotifications({
    kind: "delivery_follow_up_overdue",
    marker: overdueMarker,
    ownerId: overdueWorkspaceAfterSecondSweep.owner_id,
    projectId: overdueWorkspaceAfterSecondSweep.project_id,
    reminderBucket: "overdue",
    supabase,
    workspaceId: overdueWorkspaceAfterSecondSweep.id
  })

  assertExactNotificationCount({
    expectedCount: 1,
    label: "due_today after second sweep",
    notifications: dueTodayNotificationsAfterSecondSweep
  })
  assertExactNotificationCount({
    expectedCount: 1,
    label: "overdue after second sweep",
    notifications: overdueNotificationsAfterSecondSweep
  })

  console.log(
    JSON.stringify(
      {
        dueToday: {
          marker: dueTodayMarker,
          notificationCountAfterFirstSweep:
            dueTodayNotificationsAfterFirstSweep.length,
          notificationCountAfterSecondSweep:
            dueTodayNotificationsAfterSecondSweep.length,
          workspaceId: dueTodayWorkspaceId
        },
        firstSweepResult,
        overdue: {
          marker: overdueMarker,
          notificationCountAfterFirstSweep:
            overdueNotificationsAfterFirstSweep.length,
          notificationCountAfterSecondSweep:
            overdueNotificationsAfterSecondSweep.length,
          workspaceId: overdueWorkspaceId
        },
        secondSweepResult,
        todayDateKey
      },
      null,
      2
    )
  )
}

const currentFilePath = fileURLToPath(import.meta.url)

if (process.argv[1] === currentFilePath) {
  void runDeliveryFollowUpReminderSmokeProof().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
