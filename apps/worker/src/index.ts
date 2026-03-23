import { getWorkerEnvironment, hasWorkerEnvironmentConfiguration } from "@/lib/env"
import { executeJob } from "@/jobs/execute-job"
import { createLongRunningQueueNotifications } from "@/notifications/notification-service"
import { claimNextJob, refreshJobHeartbeat } from "@/repositories/jobs-repository"
import {
  getDeliveryFollowUpReminderSweepIntervalMilliseconds,
  shouldRunDeliveryFollowUpReminderSweep
} from "@/reminders/delivery-follow-up-reminder-cadence"
import { runDeliveryFollowUpReminderSweep } from "@/reminders/run-delivery-follow-up-reminder-sweep"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

function getMissingConfigurationPollIntervalMilliseconds() {
  const parsedValue = Number(process.env.WORKER_POLL_INTERVAL_MS ?? "3000")

  if (Number.isInteger(parsedValue) && parsedValue > 0) {
    return parsedValue
  }

  return 3000
}

async function maybeRunDeliveryFollowUpReminderSweep(input: {
  lastSweepStartedAtMs: number | null
  nowMs: number
}) {
  const reminderSweepIntervalMilliseconds =
    getDeliveryFollowUpReminderSweepIntervalMilliseconds()

  if (
    !shouldRunDeliveryFollowUpReminderSweep({
      intervalMilliseconds: reminderSweepIntervalMilliseconds,
      lastSweepStartedAtMs: input.lastSweepStartedAtMs,
      nowMs: input.nowMs
    })
  ) {
    return input.lastSweepStartedAtMs
  }

  const startedAtMs = input.nowMs

  try {
    const result = await runDeliveryFollowUpReminderSweep()

    if (result.notifiedCount > 0 || result.failureCount > 0) {
      console.log(
        `[worker] Delivery follow-up reminder sweep scanned=${result.scannedCount} notified=${result.notifiedCount} failures=${result.failureCount}`
      )
    }
  } catch (error) {
    console.error("[worker] Delivery follow-up reminder sweep failed", error)
  }

  return startedAtMs
}

async function runWorkerLoop() {
  let hasLoggedMissingConfiguration = false
  let lastDeliveryFollowUpReminderSweepStartedAtMs: number | null = null

  for (;;) {
    if (!hasWorkerEnvironmentConfiguration()) {
      if (!hasLoggedMissingConfiguration) {
        console.log(
          "[worker] Supabase worker environment is not configured. Waiting for credentials."
        )
        hasLoggedMissingConfiguration = true
      }

      await wait(getMissingConfigurationPollIntervalMilliseconds())
      continue
    }

    hasLoggedMissingConfiguration = false

    const environment = getWorkerEnvironment()
    const nowMs = Date.now()

    lastDeliveryFollowUpReminderSweepStartedAtMs =
      await maybeRunDeliveryFollowUpReminderSweep({
        lastSweepStartedAtMs: lastDeliveryFollowUpReminderSweepStartedAtMs,
        nowMs
      })

    const supabase = createSupabaseAdminClient()

    try {
      await createLongRunningQueueNotifications(supabase)

      const job = await claimNextJob(supabase)

      if (!job) {
        await wait(environment.WORKER_POLL_INTERVAL_MS)
        continue
      }

      await refreshJobHeartbeat(supabase, job.id)
      await executeJob(supabase, job)
    } catch (error) {
      console.error(error)
      await wait(environment.WORKER_POLL_INTERVAL_MS)
    }
  }
}

void runWorkerLoop()
