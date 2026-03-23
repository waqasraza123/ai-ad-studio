import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"
import {
  buildDeliveryReminderNotificationBody,
  buildDeliveryReminderNotificationKind,
  buildDeliveryReminderNotificationTitle,
  shouldGenerateDeliveryReminderNotification,
  type DeliveryReminderNotificationBucket
} from "./delivery-follow-up-reminder-notification"

export type DeliveryWorkspaceReminderRow = {
  canonical_export_id: string
  follow_up_due_on: string
  follow_up_last_notification_bucket: string | null
  follow_up_last_notification_date: string | null
  follow_up_note: string | null
  id: string
  owner_id: string
  project_id: string
  title: string
}

export type DeliveryReminderNotificationInsertRecord = {
  action_url: string
  body: string
  export_id: string
  job_id: null
  kind: string
  metadata: {
    deliveryWorkspaceId: string
    followUpDueOn: string
    reminderBucket: DeliveryReminderNotificationBucket
  }
  owner_id: string
  project_id: string
  severity: "info" | "warning"
  title: string
}

export type DeliveryWorkspaceReminderCheckpoint = {
  reminderBucket: DeliveryReminderNotificationBucket
  todayDateKey: string
  updatedAtIsoString: string
  workspaceId: string
}

type DeliveryFollowUpReminderSweepLoadResult = {
  data: DeliveryWorkspaceReminderRow[] | null
  error: unknown | null
}

type DeliveryFollowUpReminderSweepMutationResult = {
  error: unknown | null
}

export type DeliveryFollowUpReminderSweepResult = {
  failureCount: number
  failures: string[]
  notifiedCount: number
  scannedCount: number
  todayDateKey: string
}

export type DeliveryFollowUpReminderSweepStore = {
  createReminderNotification(
    notification: DeliveryReminderNotificationInsertRecord
  ): Promise<DeliveryFollowUpReminderSweepMutationResult>
  loadReminderScheduledWorkspaces(input: {
    todayDateKey: string
  }): Promise<DeliveryFollowUpReminderSweepLoadResult>
  persistReminderNotificationCheckpoint(
    checkpoint: DeliveryWorkspaceReminderCheckpoint
  ): Promise<DeliveryFollowUpReminderSweepMutationResult>
}

function getRequiredEnvironmentValue(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is required`)
  }

  return value
}

function createPrivilegedSupabaseClient() {
  return createClient(
    getRequiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnvironmentValue("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

function createDeliveryFollowUpReminderSweepStore(): DeliveryFollowUpReminderSweepStore {
  const supabase = createPrivilegedSupabaseClient()

  return {
    async loadReminderScheduledWorkspaces(input) {
      const { data, error } = await supabase
        .from("delivery_workspaces")
        .select(
          "id, owner_id, project_id, canonical_export_id, title, follow_up_note, follow_up_due_on, follow_up_last_notification_bucket, follow_up_last_notification_date"
        )
        .eq("status", "active")
        .eq("follow_up_status", "reminder_scheduled")
        .not("follow_up_due_on", "is", null)
        .lte("follow_up_due_on", input.todayDateKey)

      return {
        data: (data ?? []) as DeliveryWorkspaceReminderRow[],
        error
      }
    },

    async createReminderNotification(notification) {
      const { error } = await supabase.from("notifications").insert(notification)

      return { error }
    },

    async persistReminderNotificationCheckpoint(checkpoint) {
      const { error } = await supabase
        .from("delivery_workspaces")
        .update({
          follow_up_last_notification_bucket: checkpoint.reminderBucket,
          follow_up_last_notification_date: checkpoint.todayDateKey,
          updated_at: checkpoint.updatedAtIsoString
        })
        .eq("id", checkpoint.workspaceId)

      return { error }
    }
  }
}

function resolveReminderBucket(input: {
  followUpDueOn: string
  todayDateKey: string
}): DeliveryReminderNotificationBucket | null {
  if (input.followUpDueOn < input.todayDateKey) {
    return "overdue"
  }

  if (input.followUpDueOn === input.todayDateKey) {
    return "due_today"
  }

  return null
}

function buildReminderNotificationRecord(input: {
  reminderBucket: DeliveryReminderNotificationBucket
  workspace: DeliveryWorkspaceReminderRow
}): DeliveryReminderNotificationInsertRecord {
  return {
    action_url:
      "/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity",
    body: buildDeliveryReminderNotificationBody({
      followUpDueOn: input.workspace.follow_up_due_on,
      followUpNote: input.workspace.follow_up_note,
      reminderBucket: input.reminderBucket,
      workspaceTitle: input.workspace.title
    }),
    export_id: input.workspace.canonical_export_id,
    job_id: null,
    kind: buildDeliveryReminderNotificationKind(input.reminderBucket),
    metadata: {
      deliveryWorkspaceId: input.workspace.id,
      followUpDueOn: input.workspace.follow_up_due_on,
      reminderBucket: input.reminderBucket
    },
    owner_id: input.workspace.owner_id,
    project_id: input.workspace.project_id,
    severity: input.reminderBucket === "overdue" ? "warning" : "info",
    title: buildDeliveryReminderNotificationTitle(input.reminderBucket)
  }
}

function buildReminderCheckpoint(input: {
  reminderBucket: DeliveryReminderNotificationBucket
  todayDateKey: string
  updatedAtIsoString: string
  workspaceId: string
}): DeliveryWorkspaceReminderCheckpoint {
  return {
    reminderBucket: input.reminderBucket,
    todayDateKey: input.todayDateKey,
    updatedAtIsoString: input.updatedAtIsoString,
    workspaceId: input.workspaceId
  }
}

async function runDeliveryFollowUpReminderSweepWithStore(input: {
  store: DeliveryFollowUpReminderSweepStore
  todayDateKey: string
  updatedAtIsoString: string
}): Promise<DeliveryFollowUpReminderSweepResult> {
  const { data, error } = await input.store.loadReminderScheduledWorkspaces({
    todayDateKey: input.todayDateKey
  })

  if (error) {
    throw new Error("Failed to load reminder-scheduled delivery workspaces")
  }

  const workspaces = data ?? []
  const failures: string[] = []
  let notifiedCount = 0

  for (const workspace of workspaces) {
    try {
      const reminderBucket = resolveReminderBucket({
        followUpDueOn: workspace.follow_up_due_on,
        todayDateKey: input.todayDateKey
      })

      if (!reminderBucket) {
        continue
      }

      const shouldNotify = shouldGenerateDeliveryReminderNotification({
        followUpLastNotificationBucket: workspace.follow_up_last_notification_bucket,
        followUpLastNotificationDate: workspace.follow_up_last_notification_date,
        reminderBucket,
        todayDateKey: input.todayDateKey
      })

      if (!shouldNotify) {
        continue
      }

      const notification = buildReminderNotificationRecord({
        reminderBucket,
        workspace
      })
      const { error: notificationError } =
        await input.store.createReminderNotification(notification)

      if (notificationError) {
        throw new Error("Failed to create reminder notification")
      }

      const checkpoint = buildReminderCheckpoint({
        reminderBucket,
        todayDateKey: input.todayDateKey,
        updatedAtIsoString: input.updatedAtIsoString,
        workspaceId: workspace.id
      })
      const { error: checkpointError } =
        await input.store.persistReminderNotificationCheckpoint(checkpoint)

      if (checkpointError) {
        throw new Error("Failed to persist reminder notification checkpoint")
      }

      notifiedCount += 1
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown reminder sweep error"
      failures.push(`${workspace.id}: ${message}`)
    }
  }

  return {
    failureCount: failures.length,
    failures,
    notifiedCount,
    scannedCount: workspaces.length,
    todayDateKey: input.todayDateKey
  }
}

export async function runDeliveryFollowUpReminderSweep(input?: {
  now?: Date
  store?: DeliveryFollowUpReminderSweepStore
}) {
  const now = input?.now ?? new Date()

  return runDeliveryFollowUpReminderSweepWithStore({
    store: input?.store ?? createDeliveryFollowUpReminderSweepStore(),
    todayDateKey: now.toISOString().slice(0, 10),
    updatedAtIsoString: now.toISOString()
  })
}

const currentFilePath = fileURLToPath(import.meta.url)

if (process.argv[1] === currentFilePath) {
  void runDeliveryFollowUpReminderSweep()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error)
      process.exitCode = 1
    })
}
