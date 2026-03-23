const DEFAULT_DELIVERY_FOLLOW_UP_REMINDER_SWEEP_INTERVAL_MS = 60_000

export function getDeliveryFollowUpReminderSweepIntervalMilliseconds() {
  const parsedValue = Number(
    process.env.WORKER_DELIVERY_FOLLOW_UP_REMINDER_SWEEP_INTERVAL_MS ??
      `${DEFAULT_DELIVERY_FOLLOW_UP_REMINDER_SWEEP_INTERVAL_MS}`
  )

  if (Number.isInteger(parsedValue) && parsedValue > 0) {
    return parsedValue
  }

  return DEFAULT_DELIVERY_FOLLOW_UP_REMINDER_SWEEP_INTERVAL_MS
}

export function shouldRunDeliveryFollowUpReminderSweep(input: {
  intervalMilliseconds: number
  lastSweepStartedAtMs: number | null
  nowMs: number
}) {
  if (input.lastSweepStartedAtMs === null) {
    return true
  }

  return input.nowMs - input.lastSweepStartedAtMs >= input.intervalMilliseconds
}
