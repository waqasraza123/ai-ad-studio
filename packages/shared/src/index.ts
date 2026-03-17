export const applicationName = "AI Ad Studio"

export const supportedAspectRatio = "9:16"

export const supportedDurationSeconds = 10

export type JobStatus =
  | "queued"
  | "running"
  | "waiting_provider"
  | "succeeded"
  | "failed"
  | "cancelled"
