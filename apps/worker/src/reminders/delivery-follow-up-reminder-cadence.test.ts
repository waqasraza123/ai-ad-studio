import { afterEach, describe, expect, it } from "vitest"
import {
  getDeliveryFollowUpReminderSweepIntervalMilliseconds,
  shouldRunDeliveryFollowUpReminderSweep
} from "./delivery-follow-up-reminder-cadence"

const originalReminderSweepInterval =
  process.env.WORKER_DELIVERY_FOLLOW_UP_REMINDER_SWEEP_INTERVAL_MS

afterEach(() => {
  if (originalReminderSweepInterval === undefined) {
    delete process.env.WORKER_DELIVERY_FOLLOW_UP_REMINDER_SWEEP_INTERVAL_MS
    return
  }

  process.env.WORKER_DELIVERY_FOLLOW_UP_REMINDER_SWEEP_INTERVAL_MS =
    originalReminderSweepInterval
})

describe("getDeliveryFollowUpReminderSweepIntervalMilliseconds", () => {
  it("returns the default interval when the environment value is missing", () => {
    delete process.env.WORKER_DELIVERY_FOLLOW_UP_REMINDER_SWEEP_INTERVAL_MS

    expect(getDeliveryFollowUpReminderSweepIntervalMilliseconds()).toBe(60_000)
  })

  it("returns the configured interval when the environment value is valid", () => {
    process.env.WORKER_DELIVERY_FOLLOW_UP_REMINDER_SWEEP_INTERVAL_MS = "120000"

    expect(getDeliveryFollowUpReminderSweepIntervalMilliseconds()).toBe(120_000)
  })

  it("falls back to the default interval when the environment value is invalid", () => {
    process.env.WORKER_DELIVERY_FOLLOW_UP_REMINDER_SWEEP_INTERVAL_MS = "invalid"

    expect(getDeliveryFollowUpReminderSweepIntervalMilliseconds()).toBe(60_000)
  })
})

describe("shouldRunDeliveryFollowUpReminderSweep", () => {
  it("returns true when the sweep has never run", () => {
    expect(
      shouldRunDeliveryFollowUpReminderSweep({
        intervalMilliseconds: 60_000,
        lastSweepStartedAtMs: null,
        nowMs: 1_000
      })
    ).toBe(true)
  })

  it("returns false when the interval has not elapsed yet", () => {
    expect(
      shouldRunDeliveryFollowUpReminderSweep({
        intervalMilliseconds: 60_000,
        lastSweepStartedAtMs: 100_000,
        nowMs: 159_999
      })
    ).toBe(false)
  })

  it("returns true when the interval has elapsed", () => {
    expect(
      shouldRunDeliveryFollowUpReminderSweep({
        intervalMilliseconds: 60_000,
        lastSweepStartedAtMs: 100_000,
        nowMs: 160_000
      })
    ).toBe(true)
  })
})
