import type { ConceptRecord, JobRecord } from "@/server/database/types"

export function toConceptCardViewModel(concept: ConceptRecord) {
  return {
    angle: concept.angle,
    hook: concept.hook,
    id: concept.id,
    script: concept.script,
    status: concept.status,
    title: concept.title
  }
}

export function toConceptGenerationState(jobs: JobRecord[], conceptsCount: number) {
  const latestGenerateConceptsJob = jobs.find((job) => job.type === "generate_concepts")

  if (latestGenerateConceptsJob?.status === "queued") {
    return {
      description:
        "A concept generation job has been queued. Start the worker to process it.",
      label: "Queued"
    }
  }

  if (latestGenerateConceptsJob?.status === "running") {
    return {
      description:
        "The worker is currently drafting and persisting the concept set.",
      label: "Running"
    }
  }

  if (latestGenerateConceptsJob?.status === "failed") {
    return {
      description:
        "The last concept generation attempt failed. You can trigger another run.",
      label: "Failed"
    }
  }

  if (conceptsCount > 0) {
    return {
      description:
        "The concept set is ready. Preview image generation and selection land next.",
      label: "Ready"
    }
  }

  return {
    description:
      "Generate exactly three concept directions from the saved brief using the durable jobs flow.",
    label: "Idle"
  }
}
