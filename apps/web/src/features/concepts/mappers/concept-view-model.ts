import type {
  AssetRecord,
  ConceptRecord,
  JobRecord,
  RenderVariantKey
} from "@/server/database/types"

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
    riskFlags: input.concept.risk_flags,
    safetyNotes: input.concept.safety_notes,
    script: input.concept.script,
    status: input.concept.status,
    title: input.concept.title,
    wasSafetyModified: input.concept.was_safety_modified
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
        "The worker is currently drafting, safety-reviewing, and persisting the concept set.",
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
        "The concept set is ready and has passed the safety review layer.",
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
        "Preview visuals are ready. Select the strongest concept to move into final rendering.",
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
      "Generate one preview image per concept. This flow persists the preview assets for later rendering.",
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
        "A final render job is queued. Keep the worker running to process the selected render variant.",
      label: "Queued"
    }
  }

  if (latestRenderJob?.status === "running") {
    return {
      description:
        "The worker is planning scenes, generating motion, and building the final export artifact.",
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
        "An export exists. Open it to validate variant behavior, scene planning, and safety-aware metadata.",
      label: "Ready"
    }
  }

  if (!input.selectedConceptTitle) {
    return {
      description:
        "Select a concept before triggering the final render job.",
      label: "Waiting"
    }
  }

  return {
    description:
      "Trigger a durable render job for the selected concept and chosen variant to produce the final export.",
    label: "Idle"
  }
}

export function getLatestVariantKey(
  variantKey: RenderVariantKey | null | undefined
): RenderVariantKey {
  if (variantKey === "caption_heavy" || variantKey === "cta_heavy") {
    return variantKey
  }

  return "default"
}
