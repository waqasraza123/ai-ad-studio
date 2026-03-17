import type { AssetRecord, ConceptRecord, JobRecord } from "@/server/database/types"

function readPreviewDataUrl(asset: AssetRecord) {
  const previewDataUrl = asset.metadata.previewDataUrl

  return typeof previewDataUrl === "string" ? previewDataUrl : null
}

function readPreviewConceptId(asset: AssetRecord) {
  const conceptId = asset.metadata.conceptId

  return typeof conceptId === "string" ? conceptId : null
}

export function toConceptCardViewModel(input: {
  concept: ConceptRecord
  previewAsset: AssetRecord | null
  selectedConceptId: string | null
}) {
  return {
    angle: input.concept.angle,
    hook: input.concept.hook,
    id: input.concept.id,
    isSelected: input.selectedConceptId === input.concept.id,
    previewDataUrl: input.previewAsset ? readPreviewDataUrl(input.previewAsset) : null,
    script: input.concept.script,
    status: input.concept.status,
    title: input.concept.title
  }
}

export function mapConceptPreviewAssetsByConceptId(assets: AssetRecord[]) {
  return new Map(
    assets
      .map((asset) => {
        const conceptId = readPreviewConceptId(asset)

        return conceptId ? [conceptId, asset] : null
      })
      .filter((entry): entry is [string, AssetRecord] => entry !== null)
  )
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
        "The concept set is ready. Generate one preview image per concept next.",
      label: "Ready"
    }
  }

  return {
    description:
      "Generate exactly three concept directions from the saved brief using the durable jobs flow.",
    label: "Idle"
  }
}

export function toConceptPreviewState(input: {
  concepts: ConceptRecord[]
  jobs: JobRecord[]
  previewAssetsCount: number
}) {
  const latestPreviewJob = input.jobs.find(
    (job) => job.type === "generate_concept_preview"
  )

  if (latestPreviewJob?.status === "queued") {
    return {
      description:
        "A preview generation job is queued. Start the worker to produce one visual per concept.",
      isBlocked: true,
      label: "Queued"
    }
  }

  if (latestPreviewJob?.status === "running") {
    return {
      description:
        "The worker is generating and persisting concept preview visuals.",
      isBlocked: true,
      label: "Running"
    }
  }

  if (latestPreviewJob?.status === "failed") {
    return {
      description:
        "The last preview generation attempt failed. You can trigger another run.",
      isBlocked: false,
      label: "Failed"
    }
  }

  if (input.previewAssetsCount > 0) {
    return {
      description:
        "Preview visuals are ready. Select the strongest concept to take forward.",
      isBlocked: false,
      label: "Ready"
    }
  }

  if (input.concepts.length === 0) {
    return {
      description:
        "Generate concepts first. Preview generation becomes available after concepts exist.",
      isBlocked: true,
      label: "Waiting"
    }
  }

  return {
    description:
      "Generate one preview image per concept. This stays mocked for now, but the persistence and workflow are real.",
    isBlocked: false,
    label: "Idle"
  }
}

export function toRenderState(input: {
  hasLatestExport: boolean
  jobs: JobRecord[]
  selectedConceptTitle: string | null
}) {
  const latestRenderJob = input.jobs.find((job) => job.type === "render_final_ad")

  if (latestRenderJob?.status === "queued") {
    return {
      description:
        "A final render job is queued. Keep the worker running to scaffold the export flow.",
      label: "Queued"
    }
  }

  if (latestRenderJob?.status === "running") {
    return {
      description:
        "The worker is creating the scaffolded final export artifact and export record.",
      label: "Running"
    }
  }

  if (latestRenderJob?.status === "failed") {
    return {
      description:
        "The last render attempt failed. Check worker logs and trigger another run.",
      label: "Failed"
    }
  }

  if (input.hasLatestExport) {
    return {
      description:
        "A scaffolded export exists. Open it to validate the end-to-end render lifecycle.",
      label: "Ready"
    }
  }

  if (!input.selectedConceptTitle) {
    return {
      description:
        "Select a concept before triggering the final render scaffold.",
      label: "Waiting"
    }
  }

  return {
    description:
      "Trigger a durable render job for the selected concept. This phase creates a mocked export artifact through the real job and export pipeline.",
    label: "Idle"
  }
}
