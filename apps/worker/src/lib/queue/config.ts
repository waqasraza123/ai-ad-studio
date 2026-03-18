import type { WorkerJobRecord } from "@/repositories/jobs-repository"

export function getOwnerConcurrencyLimit(jobType: WorkerJobRecord["type"]) {
  if (jobType === "render_final_ad") {
    return 1
  }

  if (jobType === "generate_concept_preview") {
    return 1
  }

  return 2
}

export function getRetryDelaySeconds(
  attempts: number,
  jobType: WorkerJobRecord["type"]
) {
  const base =
    jobType === "render_final_ad"
      ? 120
      : jobType === "generate_concept_preview"
        ? 60
        : 30

  const delay = base * Math.max(1, 2 ** Math.max(0, attempts - 1))

  return Math.min(delay, 1800)
}
