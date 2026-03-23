import { createClient } from "@supabase/supabase-js"
import {
  buildDeliveryReminderNotificationBody,
  buildDeliveryReminderNotificationKind,
  buildDeliveryReminderNotificationTitle,
  shouldGenerateDeliveryReminderNotification,
  type DeliveryReminderNotificationBucket
} from "./delivery-follow-up-reminder-notification"

type DeliveryWorkspaceReminderRow = {
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

export async function runDeliveryFollowUpReminderSweep() {
  const supabase = createPrivilegedSupabaseClient()
  const todayDateKey = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from("delivery_workspaces")
    .select(
      "id, owner_id, project_id, canonical_export_id, title, follow_up_note, follow_up_due_on, follow_up_last_notification_bucket, follow_up_last_notification_date"
    )
    .eq("status", "active")
    .eq("follow_up_status", "reminder_scheduled")
    .not("follow_up_due_on", "is", null)
    .lte("follow_up_due_on", todayDateKey)

  if (error) {
    throw new Error("Failed to load reminder-scheduled delivery workspaces")
  }

  const workspaces = (data ?? []) as DeliveryWorkspaceReminderRow[]
  const failures: string[] = []
  let notifiedCount = 0

  for (const workspace of workspaces) {
    try {
      const reminderBucket = resolveReminderBucket({
        followUpDueOn: workspace.follow_up_due_on,
        todayDateKey
      })

      if (!reminderBucket) {
        continue
      }

      const shouldNotify = shouldGenerateDeliveryReminderNotification({
        followUpLastNotificationBucket: workspace.follow_up_last_notification_bucket,
        followUpLastNotificationDate: workspace.follow_up_last_notification_date,
        reminderBucket,
        todayDateKey
      })

      if (!shouldNotify) {
        continue
      }

      const notificationTitle =
        buildDeliveryReminderNotificationTitle(reminderBucket)
      const notificationBody = buildDeliveryReminderNotificationBody({
        followUpDueOn: workspace.follow_up_due_on,
        followUpNote: workspace.follow_up_note,
        reminderBucket,
        workspaceTitle: workspace.title
      })
      const notificationKind = buildDeliveryReminderNotificationKind(
        reminderBucket
      )

      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          action_url:
            "/dashboard/delivery?activity=needs_follow_up&status=active&sort=latest_activity",
          body: notificationBody,
          export_id: workspace.canonical_export_id,
          job_id: null,
          kind: notificationKind,
          metadata: {
            deliveryWorkspaceId: workspace.id,
            followUpDueOn: workspace.follow_up_due_on,
            reminderBucket
          },
          owner_id: workspace.owner_id,
          project_id: workspace.project_id,
          severity: reminderBucket === "overdue" ? "warning" : "info",
          title: notificationTitle
        })

      if (notificationError) {
        throw new Error("Failed to create reminder notification")
      }

      const { error: updateError } = await supabase
        .from("delivery_workspaces")
        .update({
          follow_up_last_notification_bucket: reminderBucket,
          follow_up_last_notification_date: todayDateKey,
          updated_at: new Date().toISOString()
        })
        .eq("id", workspace.id)

      if (updateError) {
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
    todayDateKey
  }
}

if (process.argv[1]?.includes("run-delivery-follow-up-reminder-sweep")) {
  runDeliveryFollowUpReminderSweep()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))

      if (result.failureCount > 0) {
        process.exitCode = 1
      }
    })
    .catch((error) => {
      console.error(error)
      process.exitCode = 1
    })
}
