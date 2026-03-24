import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"
import {
  buildDeliveryReminderNotificationBody,
  buildDeliveryReminderNotificationKind,
  buildDeliveryReminderNotificationTitle,
  shouldGenerateDeliveryReminderNotification,
  type DeliveryReminderNotificationBucket
} from "./delivery-follow-up-reminder-notification"
import {
  createEmptyDeliveryFollowUpReminderBucketTotals,
  incrementDeliveryFollowUpReminderBucketTotals,
  type DeliveryFollowUpReminderBucketTotals
} from "./delivery-follow-up-reminder-observability"

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

type DeliveryFollowUpReminderSweepLoadResult = {
  data: DeliveryWorkspaceReminderRow[] | null
  error: unknown | null
}

type DeliveryFollowUpReminderAtomicWriteResult = {
  data: { created: boolean; reminder_bucket: string | null }[] | null
  error: unknown | null
}

export type DeliveryFollowUpReminderSweepResult = {
  failureCount: number
  failures: string[]
  notifiedCount: number
  reminderBucketTotals: DeliveryFollowUpReminderBucketTotals
  scannedCount: number
  skippedCount: number
  todayDateKey: string
}

export type DeliveryFollowUpReminderSweepStore = {
  createReminderNotificationAtomically(input: {
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
  }): Promise<DeliveryFollowUpReminderAtomicWriteResult>
  loadReminderScheduledWorkspaces(input: {
    todayDateKey: string
  }): Promise<DeliveryFollowUpReminderSweepLoadResult>
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

    async createReminderNotificationAtomically(input) {
      const { data, error } = await supabase.rpc(
        "create_delivery_follow_up_reminder_notification",
        {
          p_delivery_workspace_id: input.workspaceId,
          p_export_id: input.exportId,
          p_notification_body: input.notificationBody,
          p_notification_kind: input.notificationKind,
          p_notification_severity: input.notificationSeverity,
          p_notification_title: input.notificationTitle,
          p_owner_id: input.ownerId,
          p_project_id: input.projectId,
          p_today_date: input.todayDateKey,
          p_updated_at: input.updatedAtIsoString
        }
      )

      return {
        data: (data ?? null) as
          | { created: boolean; reminder_bucket: string | null }[]
          | null,
        error
      }
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
  const reminderBucketTotals =
    createEmptyDeliveryFollowUpReminderBucketTotals()
  let notifiedCount = 0
  let skippedCount = 0

  for (const workspace of workspaces) {
    let reminderBucket: DeliveryReminderNotificationBucket | null = null

    try {
      reminderBucket = resolveReminderBucket({
        followUpDueOn: workspace.follow_up_due_on,
        todayDateKey: input.todayDateKey
      })

      if (!reminderBucket) {
        skippedCount += 1
        continue
      }

      incrementDeliveryFollowUpReminderBucketTotals({
        field: "scannedCount",
        reminderBucket,
        reminderBucketTotals
      })

      const shouldNotify = shouldGenerateDeliveryReminderNotification({
        followUpLastNotificationBucket: workspace.follow_up_last_notification_bucket,
        followUpLastNotificationDate: workspace.follow_up_last_notification_date,
        reminderBucket,
        todayDateKey: input.todayDateKey
      })

      if (!shouldNotify) {
        skippedCount += 1

        incrementDeliveryFollowUpReminderBucketTotals({
          field: "skippedCount",
          reminderBucket,
          reminderBucketTotals
        })

        continue
      }

      const { data: atomicWriteResult, error: atomicWriteError } =
        await input.store.createReminderNotificationAtomically({
          exportId: workspace.canonical_export_id,
          notificationBody: buildDeliveryReminderNotificationBody({
            followUpDueOn: workspace.follow_up_due_on,
            followUpNote: workspace.follow_up_note,
            reminderBucket,
            workspaceTitle: workspace.title
          }),
          notificationKind: buildDeliveryReminderNotificationKind(reminderBucket),
          notificationSeverity: reminderBucket === "overdue" ? "warning" : "info",
          notificationTitle: buildDeliveryReminderNotificationTitle(reminderBucket),
          ownerId: workspace.owner_id,
          projectId: workspace.project_id,
          todayDateKey: input.todayDateKey,
          updatedAtIsoString: input.updatedAtIsoString,
          workspaceId: workspace.id
        })

      if (atomicWriteError) {
        throw new Error("Failed to create atomic reminder notification")
      }

      const mutationRecord = atomicWriteResult?.[0]

      if (mutationRecord?.created) {
        notifiedCount += 1

        incrementDeliveryFollowUpReminderBucketTotals({
          field: "notifiedCount",
          reminderBucket,
          reminderBucketTotals
        })

        continue
      }

      skippedCount += 1

      incrementDeliveryFollowUpReminderBucketTotals({
        field: "skippedCount",
        reminderBucket,
        reminderBucketTotals
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown reminder sweep error"

      failures.push(`${workspace.id}: ${message}`)

      if (reminderBucket) {
        incrementDeliveryFollowUpReminderBucketTotals({
          field: "failedCount",
          reminderBucket,
          reminderBucketTotals
        })
      }
    }
  }

  return {
    failureCount: failures.length,
    failures,
    notifiedCount,
    reminderBucketTotals,
    scannedCount: workspaces.length,
    skippedCount,
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
