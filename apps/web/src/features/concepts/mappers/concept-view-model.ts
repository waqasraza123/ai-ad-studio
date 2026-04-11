import type {
  AssetRecord,
  ConceptRecord,
  JobRecord,
  PlatformPresetKey,
  RenderVariantKey
} from "@/server/database/types"
import type { AppMessageKey } from "@/lib/i18n/messages/en"

export type PipelineState = {
  descriptionKey: AppMessageKey
  labelKey: AppMessageKey
  status: "failed" | "idle" | "queued" | "ready" | "running" | "waiting"
}

export type PreviewPipelineState = PipelineState & {
  isBlocked: boolean
}

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
}): {
  angle: string
  hook: string
  id: string
  isSelected: boolean
  previewDataUrl: string | null
  riskFlags: string[]
  safetyNotes: string | null
  script: string
  statusKey: AppMessageKey
  title: string
  wasSafetyModified: boolean
} {
  return {
    angle: input.concept.angle,
    hook: input.concept.hook,
    id: input.concept.id,
    isSelected: input.selectedConceptId === input.concept.id,
    previewDataUrl: input.previewAsset ? readPreviewDataUrl(input.previewAsset) : null,
    riskFlags: input.concept.risk_flags,
    safetyNotes: input.concept.safety_notes,
    script: input.concept.script,
    statusKey: getConceptStatusLabelKey(input.concept.status),
    title: input.concept.title,
    wasSafetyModified: input.concept.was_safety_modified
  }
}

export function getConceptStatusLabelKey(
  status: ConceptRecord["status"]
): AppMessageKey {
  if (status === "preview_generating") {
    return "concepts.status.preview_generating"
  }

  if (status === "preview_ready") {
    return "concepts.status.preview_ready"
  }

  if (status === "selected") {
    return "concepts.status.selected"
  }

  if (status === "render_queued") {
    return "concepts.status.render_queued"
  }

  if (status === "rendered") {
    return "concepts.status.rendered"
  }

  if (status === "failed") {
    return "common.status.failed"
  }

  return "concepts.status.planned"
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

export function toConceptGenerationState(
  jobs: JobRecord[],
  conceptsCount: number
): PipelineState {
  const latestGenerateConceptsJob = jobs.find((job) => job.type === "generate_concepts")

  if (latestGenerateConceptsJob?.status === "queued") {
    return {
      descriptionKey: "concepts.state.generation.queued.description",
      labelKey: "common.status.queued",
      status: "queued"
    } satisfies PipelineState
  }

  if (latestGenerateConceptsJob?.status === "running") {
    return {
      descriptionKey: "concepts.state.generation.running.description",
      labelKey: "common.status.running",
      status: "running"
    } satisfies PipelineState
  }

  if (latestGenerateConceptsJob?.status === "failed") {
    return {
      descriptionKey: "concepts.state.generation.failed.description",
      labelKey: "common.status.failed",
      status: "failed"
    } satisfies PipelineState
  }

  if (conceptsCount > 0) {
    return {
      descriptionKey: "concepts.state.generation.ready.description",
      labelKey: "common.status.ready",
      status: "ready"
    } satisfies PipelineState
  }

  return {
    descriptionKey: "concepts.state.generation.idle.description",
    labelKey: "common.status.idle",
    status: "idle"
  } satisfies PipelineState
}

export function toConceptPreviewState(input: {
  concepts: ConceptRecord[]
  jobs: JobRecord[]
  previewAssetsCount: number
}): PreviewPipelineState {
  const latestPreviewJob = input.jobs.find(
    (job) => job.type === "generate_concept_preview"
  )

  if (latestPreviewJob?.status === "queued") {
    return {
      descriptionKey: "concepts.state.preview.queued.description",
      isBlocked: true,
      labelKey: "common.status.queued",
      status: "queued"
    }
  }

  if (latestPreviewJob?.status === "running") {
    return {
      descriptionKey: "concepts.state.preview.running.description",
      isBlocked: true,
      labelKey: "common.status.running",
      status: "running"
    }
  }

  if (latestPreviewJob?.status === "failed") {
    return {
      descriptionKey: "concepts.state.preview.failed.description",
      isBlocked: false,
      labelKey: "common.status.failed",
      status: "failed"
    }
  }

  if (input.previewAssetsCount > 0) {
    return {
      descriptionKey: "concepts.state.preview.ready.description",
      isBlocked: false,
      labelKey: "common.status.ready",
      status: "ready"
    }
  }

  if (input.concepts.length === 0) {
    return {
      descriptionKey: "concepts.state.preview.waiting.description",
      isBlocked: true,
      labelKey: "common.status.waiting",
      status: "waiting"
    }
  }

  return {
    descriptionKey: "concepts.state.preview.idle.description",
    isBlocked: false,
    labelKey: "common.status.idle",
    status: "idle"
  }
}

export function toRenderState(input: {
  hasLatestExport: boolean
  jobs: JobRecord[]
  selectedConceptTitle: string | null
}): PipelineState {
  const latestRenderJob = input.jobs.find((job) => job.type === "render_final_ad")

  if (latestRenderJob?.status === "queued") {
    return {
      descriptionKey: "renders.state.queued.description",
      labelKey: "common.status.queued",
      status: "queued"
    } satisfies PipelineState
  }

  if (latestRenderJob?.status === "running") {
    return {
      descriptionKey: "renders.state.running.description",
      labelKey: "common.status.running",
      status: "running"
    } satisfies PipelineState
  }

  if (latestRenderJob?.status === "failed") {
    return {
      descriptionKey: "renders.state.failed.description",
      labelKey: "common.status.failed",
      status: "failed"
    } satisfies PipelineState
  }

  if (input.hasLatestExport) {
    return {
      descriptionKey: "renders.state.ready.description",
      labelKey: "common.status.ready",
      status: "ready"
    } satisfies PipelineState
  }

  if (!input.selectedConceptTitle) {
    return {
      descriptionKey: "renders.state.waiting.description",
      labelKey: "common.status.waiting",
      status: "waiting"
    } satisfies PipelineState
  }

  return {
    descriptionKey: "renders.state.idle.description",
    labelKey: "common.status.idle",
    status: "idle"
  } satisfies PipelineState
}

export function getLatestVariantKey(
  variantKey: RenderVariantKey | null | undefined
): RenderVariantKey {
  if (variantKey === "caption_heavy" || variantKey === "cta_heavy") {
    return variantKey
  }

  return "default"
}

export function getLatestPlatformPreset(
  platformPreset: PlatformPresetKey | null | undefined
): PlatformPresetKey {
  if (
    platformPreset === "instagram_reels" ||
    platformPreset === "instagram_feed" ||
    platformPreset === "youtube_shorts" ||
    platformPreset === "youtube_landscape"
  ) {
    return platformPreset
  }

  return "default"
}
