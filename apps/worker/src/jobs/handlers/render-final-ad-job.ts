import type { SupabaseClient } from "@supabase/supabase-js"
import { randomUUID } from "node:crypto"
import { readFile, stat, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { getEffectiveOwnerBillingLimits } from "@/billing/billing-limits"
import { getProjectBrandKit } from "@/brand-kits/brand-kit-service"
import { getWorkerEnvironment } from "@/lib/env"
import { downloadObjectToFile, uploadFileArtifactToR2 } from "@/lib/storage/r2"
import { buildCaptionTimeline, type CaptionCue } from "@/media/captions/build-caption-timeline"
import { renderMultiSceneAd } from "@/media/ffmpeg/render-multi-scene-ad"
import { getMediaDurationSeconds } from "@/media/ffmpeg/media-metadata"
import { cleanupRenderWorkspace, createRenderWorkspace } from "@/media/temp/temp-paths"
import type { PlannedScene } from "@/planning/scene-planner"
import { buildStructuredScenePlan } from "@/planning/scene-planner"
import { OpenAiTtsProvider } from "@/providers/openai-tts-provider"
import { createSceneVideoProvider } from "@/providers/provider-factories"
import { getRenderPackForPlatform } from "@/render-packs/render-pack-service"
import {
  createRenderAsset,
  createSceneVideoAssets,
  createVoiceoverAsset,
  deleteSceneVideoAssetsByProjectId
} from "@/repositories/assets-repository"
import { listConceptsByProjectId } from "@/repositories/concepts-repository"
import { createExportRecord } from "@/repositories/exports-repository"
import { createJobTraces } from "@/repositories/job-traces-repository"
import type { WorkerJobRecord } from "@/repositories/jobs-repository"
import { listProjectAssetsByProjectId } from "@/repositories/projects-assets-repository"
import { getProjectById, updateProjectStatus } from "@/repositories/projects-repository"
import {
  getRenderBatchByJobId,
  markRenderBatchFailed,
  markRenderBatchReady,
  markRenderBatchRunning
} from "@/repositories/render-batches-repository"
import { createUsageEvents } from "@/repositories/usage-events-repository"
import { getProjectTemplate } from "@/templates/template-service"

type RenderVariantKey = "default" | "caption_heavy" | "cta_heavy"
type ExportAspectRatio = "9:16" | "1:1" | "16:9"
type PlatformPresetKey =
  | "default"
  | "instagram_reels"
  | "instagram_feed"
  | "youtube_shorts"
  | "youtube_landscape"

function decodeDataUri(input: string) {
  const [header, payload] = input.split(",", 2)

  if (!header || !payload) {
    throw new Error("Invalid data URI")
  }

  const mimeType = header
    .replace("data:", "")
    .replace(";base64", "")
    .replace(";charset=utf-8", "")

  if (header.includes(";base64")) {
    return {
      bytes: Buffer.from(payload, "base64"),
      mimeType
    }
  }

  return {
    bytes: Buffer.from(decodeURIComponent(payload), "utf8"),
    mimeType
  }
}

function extensionFromMimeType(mimeType: string) {
  if (mimeType.includes("svg")) return "svg"
  if (mimeType.includes("png")) return "png"
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg"
  if (mimeType.includes("webp")) return "webp"
  return "img"
}

function readVariantKey(value: unknown): RenderVariantKey {
  if (value === "caption_heavy" || value === "cta_heavy") {
    return value
  }

  return "default"
}

function readBatchVariantKeys(value: unknown, fallback: RenderVariantKey): RenderVariantKey[] {
  if (!Array.isArray(value)) {
    return [fallback]
  }

  const normalized = value.filter(
    (variantKey): variantKey is RenderVariantKey =>
      variantKey === "default" ||
      variantKey === "caption_heavy" ||
      variantKey === "cta_heavy"
  )

  return normalized.length > 0 ? [...new Set(normalized)] : [fallback]
}

function readPlatformPreset(value: unknown): PlatformPresetKey {
  if (
    value === "instagram_reels" ||
    value === "instagram_feed" ||
    value === "youtube_shorts" ||
    value === "youtube_landscape"
  ) {
    return value
  }

  return "default"
}

function readAspectRatios(value: unknown): ExportAspectRatio[] {
  if (!Array.isArray(value)) {
    return ["9:16"]
  }

  const normalized = value.filter(
    (aspectRatio): aspectRatio is ExportAspectRatio =>
      aspectRatio === "9:16" || aspectRatio === "1:1" || aspectRatio === "16:9"
  )

  return normalized.length > 0 ? normalized : ["9:16"]
}

function getCanvasSize(aspectRatio: ExportAspectRatio) {
  if (aspectRatio === "1:1") {
    return {
      height: 1080,
      width: 1080
    }
  }

  if (aspectRatio === "16:9") {
    return {
      height: 1080,
      width: 1920
    }
  }

  return {
    height: 1920,
    width: 1080
  }
}

function splitIntoChunks(value: string, wordsPerChunk: number) {
  const words = value.trim().split(/\s+/).filter(Boolean)
  const chunks: string[] = []

  for (let index = 0; index < words.length; index += wordsPerChunk) {
    chunks.push(words.slice(index, index + wordsPerChunk).join(" "))
  }

  return chunks.length > 0 ? chunks : [value.trim()]
}

function buildVariantCaptionTimeline(input: {
  script: string
  totalDurationSeconds: number
  variantKey: RenderVariantKey
  ctaText: string
}): CaptionCue[] {
  if (input.variantKey === "default") {
    return buildCaptionTimeline({
      script: input.script,
      totalDurationSeconds: input.totalDurationSeconds
    })
  }

  if (input.variantKey === "caption_heavy") {
    const segments = splitIntoChunks(input.script, 3)
    const segmentDuration = input.totalDurationSeconds / segments.length

    return segments.map((segment, index) => ({
      endSeconds: Number(((index + 1) * segmentDuration).toFixed(3)),
      startSeconds: Number((index * segmentDuration).toFixed(3)),
      text: segment
    }))
  }

  const baseTimeline = buildCaptionTimeline({
    script: input.script,
    totalDurationSeconds: Math.max(1, input.totalDurationSeconds - 0.8)
  })

  const trimmedBase = baseTimeline.slice(0, Math.max(1, baseTimeline.length - 1))
  const finalStartSeconds = Math.max(
    0,
    Number((input.totalDurationSeconds - 0.9).toFixed(3))
  )

  return [
    ...trimmedBase,
    {
      endSeconds: Number(input.totalDurationSeconds.toFixed(3)),
      startSeconds: finalStartSeconds,
      text: input.ctaText
    }
  ]
}

function resolveVariantCtaTiming(input: {
  ctaCardSeconds: number
  ctaStartSeconds: number
  variantKey: RenderVariantKey
}) {
  if (input.variantKey === "cta_heavy") {
    const ctaCardSeconds = Math.min(2.2, input.ctaCardSeconds + 0.4)
    return {
      ctaCardSeconds,
      ctaStartSeconds: Number((10 - ctaCardSeconds).toFixed(3))
    }
  }

  if (input.variantKey === "caption_heavy") {
    return {
      ctaCardSeconds: input.ctaCardSeconds,
      ctaStartSeconds: Number((10 - input.ctaCardSeconds).toFixed(3))
    }
  }

  return {
    ctaCardSeconds: input.ctaCardSeconds,
    ctaStartSeconds: input.ctaStartSeconds
  }
}

function resolveVariantEmphasisStyle(
  emphasisStyle: "clean" | "bold" | "minimal",
  variantKey: RenderVariantKey
) {
  if (variantKey === "cta_heavy") {
    return "bold" as const
  }

  if (variantKey === "caption_heavy") {
    return "minimal" as const
  }

  return emphasisStyle
}

async function materializePreviewImage(input: {
  previewDataUrl: string
  workspacePath: string
}) {
  if (input.previewDataUrl.startsWith("data:")) {
    const decoded = decodeDataUri(input.previewDataUrl)
    const filePath = join(
      input.workspacePath,
      `preview-frame.${extensionFromMimeType(decoded.mimeType)}`
    )

    await writeFile(filePath, decoded.bytes)

    return filePath
  }

  const response = await fetch(input.previewDataUrl)

  if (!response.ok) {
    throw new Error("Failed to download preview image for render")
  }

  const contentType = response.headers.get("content-type") || "image/png"
  const filePath = join(
    input.workspacePath,
    `preview-frame.${extensionFromMimeType(contentType)}`
  )
  const arrayBuffer = await response.arrayBuffer()

  await writeFile(filePath, Buffer.from(arrayBuffer))

  return filePath
}

function uniqueNonEmpty(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
}

function buildNormalizedSceneImagePaths(sceneReferenceImagePaths: string[]) {
  const [first, second, third] = sceneReferenceImagePaths

  if (!first) {
    throw new Error("At least one scene reference image is required")
  }

  return [
    first,
    second ?? first,
    third ?? first
  ] as const
}

function getPlannedScene(scenePlan: PlannedScene[], index: number) {
  const plannedScene = scenePlan[index] ?? scenePlan[0]

  if (!plannedScene) {
    throw new Error("Scene plan must contain at least one scene")
  }

  return plannedScene
}

async function downloadRemoteVideoToFile(input: {
  filePath: string
  videoUrl: string
}) {
  const response = await fetch(input.videoUrl)

  if (!response.ok) {
    throw new Error("Failed to download generated scene video")
  }

  const arrayBuffer = await response.arrayBuffer()
  await writeFile(input.filePath, Buffer.from(arrayBuffer))
}

function getSceneVideoGenerationCost(provider: string) {
  if (provider === "runway") {
    return 0.15
  }

  return 0
}

export async function handleRenderFinalAdJob(
  supabase: SupabaseClient,
  job: WorkerJobRecord
) {
  const renderBatch = await getRenderBatchByJobId(supabase, job.id)
  const project = await getProjectById(supabase, job.project_id)
  const billingLimits = await getEffectiveOwnerBillingLimits(supabase, job.owner_id)

  if (!project) {
    throw new Error("Project not found for final render")
  }

  if (!project.selected_concept_id) {
    throw new Error("No selected concept found for final render")
  }

  const [concepts, projectAssets, template, brandKit] = await Promise.all([
    listConceptsByProjectId(supabase, job.project_id),
    listProjectAssetsByProjectId(supabase, job.project_id),
    getProjectTemplate(supabase, {
      ownerId: project.owner_id,
      templateId: project.template_id
    }),
    getProjectBrandKit(supabase, {
      brandKitId: project.brand_kit_id,
      ownerId: project.owner_id
    })
  ])

  const selectedConcept =
    concepts.find((concept) => concept.id === project.selected_concept_id) ?? null

  if (!selectedConcept) {
    throw new Error("Selected concept record not found for final render")
  }

  const previewAsset = (job.payload.previewAsset as Record<string, unknown> | undefined) ?? null
  const previewDataUrl =
    previewAsset && typeof previewAsset.previewDataUrl === "string"
      ? previewAsset.previewDataUrl
      : null

  if (!previewDataUrl) {
    throw new Error("Selected concept preview data was not included in the render job")
  }

  const workspacePath = await createRenderWorkspace(`ai-ad-studio-render-${project.id}`)
  const voiceoverFilePath = join(workspacePath, "voiceover.mp3")

  try {
    const fallbackVariantKey = readVariantKey(job.payload.variantKey)
    const batchVariantKeys =
      renderBatch?.variant_keys ??
      readBatchVariantKeys(job.payload.batchVariantKeys, fallbackVariantKey)
    const primaryVariantKey =
      batchVariantKeys.includes("default") ? "default" : batchVariantKeys[0]!
    const platformPreset = readPlatformPreset(job.payload.platformPreset)
    const aspectRatios = renderBatch?.aspect_ratios ?? readAspectRatios(job.payload.aspectRatios)

    if (renderBatch) {
      await markRenderBatchRunning(supabase, renderBatch.id)
    }

    await createJobTraces(supabase, [
      {
        job_id: job.id,
        owner_id: job.owner_id,
        payload: {
          aspectRatios,
          batchId: renderBatch?.id ?? null,
          batchVariantKeys,
          brandKitId: brandKit.id,
          brandKitName: brandKit.name,
          platformPreset,
          templateId: template.id,
          templateStyleKey: template.style_key
        },
        project_id: job.project_id,
        stage: "render_requested",
        trace_type: "lifecycle"
      }
    ])

    const previewImagePath = await materializePreviewImage({
      previewDataUrl,
      workspacePath
    })

    const productAssets = projectAssets.filter(
      (asset) => asset.kind === "product_image"
    )

    const downloadedProductImagePaths = await Promise.all(
      productAssets.slice(0, 2).map(async (asset, index) => {
        const targetPath = join(
          workspacePath,
          `product-image-${index + 1}.${extensionFromMimeType(asset.mime_type)}`
        )

        await downloadObjectToFile({
          filePath: targetPath,
          storageKey: asset.storage_key
        })

        return targetPath
      })
    )

    const sceneReferenceImagePaths = uniqueNonEmpty([
      previewImagePath,
      ...downloadedProductImagePaths
    ])

    const normalizedSceneImagePaths = buildNormalizedSceneImagePaths(
      sceneReferenceImagePaths
    )

    const ttsProvider = new OpenAiTtsProvider()
    await ttsProvider.generateVoiceover({
      outputFilePath: voiceoverFilePath,
      script: selectedConcept.script
    })

    const voiceoverDurationSeconds = await getMediaDurationSeconds(voiceoverFilePath)

    const environment = getWorkerEnvironment()
    const videoProvider = createSceneVideoProvider(environment)

    const variantPlans = await Promise.all(
      batchVariantKeys.map(async (variantKey) => {
        const aspectPlans = await Promise.all(
          aspectRatios.map(async (aspectRatio) => {
            const renderPack = await getRenderPackForPlatform(supabase, {
              ownerId: project.owner_id,
              platformPreset,
              aspectRatio
            })

            return {
              aspectRatio,
              renderPack,
              scenePlan: buildStructuredScenePlan({
                angle: selectedConcept.angle,
                aspectRatio,
                brandPalette: brandKit.palette,
                brandTypography: brandKit.typography,
                callToAction:
                  typeof job.payload.callToAction === "string" ? job.payload.callToAction : null,
                hook: selectedConcept.hook,
                platformPreset,
                productName: project.name,
                renderSafeZone: renderPack.safe_zone,
                script: selectedConcept.script,
                templateCtaPreset: template.cta_preset,
                templateScenePack: template.scene_pack,
                variantKey,
                visualDirection: selectedConcept.visual_direction
              }),
              variantKey
            }
          })
        )

        return {
          aspectPlans,
          variantKey
        }
      })
    )

    const primaryAspectPlan =
      variantPlans.find((entry) => entry.variantKey === primaryVariantKey)?.aspectPlans[0] ??
      variantPlans[0]?.aspectPlans[0] ??
      null

    if (!primaryAspectPlan || primaryAspectPlan.scenePlan.length === 0) {
      throw new Error("Primary scene plan was not generated")
    }

    const primaryScenePlan = primaryAspectPlan.scenePlan
    const primaryRenderPack = primaryAspectPlan.renderPack

    const primaryCtaText =
      typeof job.payload.callToAction === "string" && job.payload.callToAction.trim().length > 0
        ? job.payload.callToAction.trim()
        : "Shop now"

    await createJobTraces(supabase, [
      {
        job_id: job.id,
        owner_id: job.owner_id,
        payload: {
          batchId: renderBatch?.id ?? null,
          batchVariantKeys,
          primaryRenderPackId: primaryRenderPack.id,
          primaryVariantKey
        },
        project_id: job.project_id,
        stage: "batch_variation_plan_ready",
        trace_type: "batch"
      }
    ])

    await deleteSceneVideoAssetsByProjectId(supabase, project.id)

    const sceneResults = await Promise.all(
      normalizedSceneImagePaths.map(async (imagePath, index) => {
        const imageBytes = await readFile(imagePath)
        const imageExtension = imagePath.split(".").pop()?.toLowerCase() ?? "png"
        const imageMimeType =
          imageExtension === "webp"
            ? "image/webp"
            : imageExtension === "jpg" || imageExtension === "jpeg"
              ? "image/jpeg"
              : imageExtension === "svg"
                ? "image/svg+xml"
                : "image/png"

        const promptImage = `data:${imageMimeType};base64,${imageBytes.toString("base64")}`
        const plannedScene = getPlannedScene(primaryScenePlan, index)

        const generated = await videoProvider.generateSceneVideo({
          aspectRatio: primaryAspectPlan.aspectRatio,
          durationSeconds: plannedScene.durationSeconds,
          promptImage,
          promptText: plannedScene.promptText
        })

        const localSceneFilePath = join(workspacePath, `scene-${index + 1}.mp4`)
        await downloadRemoteVideoToFile({
          filePath: localSceneFilePath,
          videoUrl: generated.artifactUrl
        })

        const sceneStorageKey = `projects/${project.id}/scenes/${randomUUID()}.mp4`
        await uploadFileArtifactToR2({
          contentType: "video/mp4",
          filePath: localSceneFilePath,
          storageKey: sceneStorageKey
        })

        return {
          localSceneFilePath,
          metadata: {
            batchId: renderBatch?.id ?? null,
            batchVariantKeys,
            brandKitId: brandKit.id,
            brandKitName: brandKit.name,
            motionStyle: plannedScene.motionStyle,
            model: generated.model,
            purpose: plannedScene.purpose,
            renderPackId: primaryRenderPack.id,
            renderPackName: primaryRenderPack.name,
            provider: generated.provider,
            providerMetadata: generated.metadata ?? null,
            externalJobId: generated.externalJobId ?? null,
            runwayTaskId:
              generated.provider === "runway" && typeof generated.externalJobId === "string"
                ? generated.externalJobId
                : null,
            sceneIndex: index,
            sourceConceptId: selectedConcept.id,
            templateId: template.id,
            templateStyleKey: template.style_key
          },
          storageKey: sceneStorageKey
        }
      })
    )

    await createJobTraces(supabase, [
      {
        job_id: job.id,
        owner_id: job.owner_id,
        payload: {
          batchId: renderBatch?.id ?? null,
          brandKitId: brandKit.id,
          brandKitName: brandKit.name,
          renderPackId: primaryRenderPack.id,
          renderPackName: primaryRenderPack.name,
          sceneCount: sceneResults.length,
          sceneVideoModel: sceneResults[0]?.metadata.model ?? null,
          sceneVideoProvider: sceneResults[0]?.metadata.provider ?? null,
          templateId: template.id,
          templateStyleKey: template.style_key
        },
        project_id: job.project_id,
        stage: "scene_videos_generated",
        trace_type: "provider_response"
      }
    ])

    await createSceneVideoAssets(
      supabase,
      await Promise.all(sceneResults.map(async (scene, index) => {
        const plannedScene = getPlannedScene(primaryScenePlan, index)
        const sceneStats = await stat(scene.localSceneFilePath)

        return {
          kind: "scene_video",
          metadata: {
            ...scene.metadata,
            sizeBytes: sceneStats.size,
            watermarked: billingLimits.plan.watermark_exports
          },
          mime_type: "video/mp4",
          owner_id: project.owner_id,
          project_id: project.id,
          storage_key: scene.storageKey,
          duration_ms: plannedScene.durationSeconds * 1000,
          height: 1280,
          width: 720
        }
      }))
    )

    const voiceoverStorageKey = `projects/${project.id}/voiceover/${randomUUID()}.mp3`
    await uploadFileArtifactToR2({
      contentType: "audio/mpeg",
      filePath: voiceoverFilePath,
      storageKey: voiceoverStorageKey
    })

    await createVoiceoverAsset(supabase, {
      kind: "voiceover_audio",
      metadata: {
        provider: "openai_tts",
        script: selectedConcept.script,
        sizeBytes: (await stat(voiceoverFilePath)).size
      },
      mime_type: "audio/mpeg",
      owner_id: project.owner_id,
      project_id: project.id,
      storage_key: voiceoverStorageKey,
      duration_ms: Math.round(voiceoverDurationSeconds * 1000)
    })

    const exportUsageEvents: {
      estimated_cost_usd: number
      event_type: string
      export_id: string | null
      metadata: Record<string, unknown>
      owner_id: string
      project_id: string
      provider: string
      units: number
    }[] = []

    const exportsCreated = await Promise.all(
      variantPlans.flatMap(({ aspectPlans, variantKey }) =>
        aspectPlans.map(async ({ aspectRatio, renderPack, scenePlan }) => {
          const variantTiming = resolveVariantCtaTiming({
            ctaCardSeconds: renderPack.cta_timing.cta_card_seconds,
            ctaStartSeconds: renderPack.cta_timing.cta_start_seconds,
            variantKey
          })

          const variantCaptionTimeline = buildVariantCaptionTimeline({
            ctaText:
              variantKey === "cta_heavy"
                ? `${template.cta_preset.headline_prefix} ${primaryCtaText}`.trim()
                : primaryCtaText,
            script: selectedConcept.script,
            totalDurationSeconds: variantTiming.ctaStartSeconds,
            variantKey
          })

          const outputFilePath = join(
            workspacePath,
            `final-export-${variantKey}-${aspectRatio.replace(":", "x")}.mp4`
          )

          await renderMultiSceneAd({
            aspectRatio,
            audioFilePath: voiceoverFilePath,
            brandBackground: brandKit.palette.background,
            brandForeground: brandKit.palette.foreground,
            brandPrimary: brandKit.palette.primary,
            brandSecondary: brandKit.palette.secondary,
            captionLayout: renderPack.caption_layout,
            captionTimeline: variantCaptionTimeline,
            ctaHeadlinePrefix: template.cta_preset.headline_prefix,
            ctaSubheadlineText: template.cta_preset.subheadline_text,
            ctaText: primaryCtaText,
            ctaCardSeconds: variantTiming.ctaCardSeconds,
            ctaStartSeconds: variantTiming.ctaStartSeconds,
            emphasisStyle: resolveVariantEmphasisStyle(
              template.cta_preset.emphasis_style,
              variantKey
            ),
            headingFontFamily: brandKit.typography.heading_family,
            outputFilePath,
            projectName: project.name,
            safeZone: renderPack.safe_zone,
            sceneVideoFilePaths: sceneResults.map((scene) => scene.localSceneFilePath),
            watermarkText: billingLimits.plan.watermark_exports
              ? "AI Ad Studio Free"
              : null,
            workspacePath
          })

          const { height, width } = getCanvasSize(aspectRatio)
          const totalDurationSeconds = variantTiming.ctaStartSeconds + variantTiming.ctaCardSeconds
          const storageKey = `projects/${project.id}/exports/${variantKey}-${aspectRatio.replace(":", "x")}-${randomUUID()}.mp4`
          const outputStats = await stat(outputFilePath)

          await uploadFileArtifactToR2({
            contentType: "video/mp4",
            filePath: outputFilePath,
            storageKey
          })

          const renderMetadata = {
            aspectRatio,
            batchId: renderBatch?.id ?? null,
            batchVariantKeys,
            brandKitId: brandKit.id,
            brandKitName: brandKit.name,
            brandPalette: brandKit.palette,
            brandTypography: brandKit.typography,
            captionCueCount: variantCaptionTimeline.length,
            captionLayout: renderPack.caption_layout,
            ctaPreset: template.cta_preset,
            ctaTiming: variantTiming,
            platformPreset,
            previewDataUrl,
            previewModel:
              previewAsset && typeof previewAsset.model === "string" ? previewAsset.model : null,
            previewProvider:
              previewAsset && typeof previewAsset.provider === "string"
                ? previewAsset.provider
                : null,
            renderMode: "ffmpeg_scene_video_composition",
            renderPackId: renderPack.id,
            renderPackName: renderPack.name,
            safeZone: renderPack.safe_zone,
            sceneCount: sceneResults.length,
            sceneVideoModel: sceneResults[0]?.metadata.model ?? null,
            sceneVideoProvider: sceneResults[0]?.metadata.provider ?? null,
            scenePlan,
            selectedConceptId: selectedConcept.id,
            templateId: template.id,
            templateName: template.name,
            templateStyleKey: template.style_key,
            variantKey,
            voiceoverProvider: "openai_tts",
            sizeBytes: outputStats.size,
            watermarked: billingLimits.plan.watermark_exports
          }

          const renderAsset = await createRenderAsset(supabase, {
            kind: "export_video",
            metadata: renderMetadata,
            mime_type: "video/mp4",
            owner_id: project.owner_id,
            project_id: project.id,
            storage_key: storageKey,
            duration_ms: Math.round(totalDurationSeconds * 1000),
            height,
            width
          })

          const exportRecord = await createExportRecord(supabase, {
            assetId: renderAsset.id,
            aspectRatio,
            conceptId: selectedConcept.id,
            ownerId: project.owner_id,
            platformPreset,
            previewAssetId:
              previewAsset && typeof previewAsset.id === "string"
                ? previewAsset.id
                : null,
            projectId: project.id,
            renderMetadata,
            variantKey
          })

          exportUsageEvents.push(
            {
              estimated_cost_usd: getSceneVideoGenerationCost(
                String(sceneResults[0]?.metadata.provider ?? "runway")
              ),
              event_type: "scene_video_generation",
              export_id: exportRecord.id,
              metadata: {
                batchId: renderBatch?.id ?? null,
                batchVariantKey: variantKey,
                brandKitId: brandKit.id,
                model: sceneResults[0]?.metadata.model ?? null,
                provider: sceneResults[0]?.metadata.provider ?? null,
                renderPackId: renderPack.id,
                sceneCount: sceneResults.length,
                templateId: template.id
              },
              owner_id: project.owner_id,
              project_id: project.id,
              provider: String(sceneResults[0]?.metadata.provider ?? "runway"),
              units: sceneResults.length
            },
            {
              estimated_cost_usd: 0.004,
              event_type: "voiceover_generation",
              export_id: exportRecord.id,
              metadata: {
                batchId: renderBatch?.id ?? null,
                batchVariantKey: variantKey,
                brandKitId: brandKit.id,
                durationSeconds: voiceoverDurationSeconds,
                renderPackId: renderPack.id,
                templateId: template.id
              },
              owner_id: project.owner_id,
              project_id: project.id,
              provider: "openai",
              units: Math.round(voiceoverDurationSeconds)
            },
            {
              estimated_cost_usd: 0.01,
              event_type: "final_render_composition",
              export_id: exportRecord.id,
              metadata: {
                aspectRatio,
                batchId: renderBatch?.id ?? null,
                batchVariantKey: variantKey,
                brandKitId: brandKit.id,
                platformPreset,
                renderPackId: renderPack.id,
                templateId: template.id,
                variantKey
              },
              owner_id: project.owner_id,
              project_id: project.id,
              provider: "ffmpeg",
              units: 1
            }
          )

          return {
            aspectRatio,
            exportId: exportRecord.id,
            renderPackId: renderPack.id,
            renderPackName: renderPack.name,
            variantKey
          }
        })
      )
    )

    await createUsageEvents(supabase, exportUsageEvents)

    if (renderBatch) {
      await markRenderBatchReady(supabase, {
        batchId: renderBatch.id,
        exportCount: exportsCreated.length
      })
    }

    await createJobTraces(supabase, [
      {
        job_id: job.id,
        owner_id: job.owner_id,
        payload: {
          batchId: renderBatch?.id ?? null,
          batchVariantKeys,
          brandKitId: brandKit.id,
          brandKitName: brandKit.name,
          exportsCreated,
          templateId: template.id,
          templateStyleKey: template.style_key
        },
        project_id: job.project_id,
        stage: "exports_created",
        trace_type: "provider_response"
      }
    ])

    await updateProjectStatus(supabase, {
      projectId: project.id,
      status: "export_ready"
    })

    return {
      batchId: renderBatch?.id ?? null,
      batchVariantKeys,
      brandKitId: brandKit.id,
      brandKitName: brandKit.name,
      exportsCreated,
      projectId: project.id,
      sceneCount: sceneResults.length,
      templateId: template.id,
      templateStyleKey: template.style_key
    }
  } catch (error) {
    if (renderBatch) {
      await markRenderBatchFailed(supabase, renderBatch.id)
    }

    throw error
  } finally {
    await cleanupRenderWorkspace(workspacePath)
  }
}
