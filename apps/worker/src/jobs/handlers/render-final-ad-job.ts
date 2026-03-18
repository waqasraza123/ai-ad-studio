import type { SupabaseClient } from "@supabase/supabase-js"
import { randomUUID } from "node:crypto"
import { join } from "node:path"
import { writeFile } from "node:fs/promises"
import { downloadObjectToFile, uploadFileArtifactToR2 } from "@/lib/storage/r2"
import { buildCaptionTimeline } from "@/media/captions/build-caption-timeline"
import { renderMultiSceneAd } from "@/media/ffmpeg/render-multi-scene-ad"
import { getMediaDurationSeconds } from "@/media/ffmpeg/media-metadata"
import { createRenderWorkspace, cleanupRenderWorkspace } from "@/media/temp/temp-paths"
import { buildStructuredScenePlan } from "@/planning/scene-planner"
import { OpenAiTtsProvider } from "@/providers/openai-tts-provider"
import { RunwayVideoProvider } from "@/providers/runway-video-provider"
import {
  createRenderAsset,
  createSceneVideoAssets,
  createVoiceoverAsset,
  deleteSceneVideoAssetsByProjectId
} from "@/repositories/assets-repository"
import { listConceptsByProjectId } from "@/repositories/concepts-repository"
import { createExportRecord } from "@/repositories/exports-repository"
import { createJobTraces } from "@/repositories/job-traces-repository"
import { listProjectAssetsByProjectId } from "@/repositories/projects-assets-repository"
import { getProjectById, updateProjectStatus } from "@/repositories/projects-repository"
import { createUsageEvents } from "@/repositories/usage-events-repository"
import type { WorkerJobRecord } from "@/repositories/jobs-repository"
import { getWorkerEnvironment } from "@/lib/env"
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

function uniqueNonEmpty<T>(values: T[]) {
  return [...new Set(values.filter(Boolean))]
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

export async function handleRenderFinalAdJob(
  supabase: SupabaseClient,
  job: WorkerJobRecord
) {
  const project = await getProjectById(supabase, job.project_id)

  if (!project) {
    throw new Error("Project not found for final render")
  }

  if (!project.selected_concept_id) {
    throw new Error("No selected concept found for final render")
  }

  const [concepts, projectAssets, template] = await Promise.all([
    listConceptsByProjectId(supabase, job.project_id),
    listProjectAssetsByProjectId(supabase, job.project_id),
    getProjectTemplate(supabase, {
      ownerId: project.owner_id,
      templateId: project.template_id
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
    const variantKey = readVariantKey(job.payload.variantKey)
    const platformPreset = readPlatformPreset(job.payload.platformPreset)
    const aspectRatios = readAspectRatios(job.payload.aspectRatios)

    await createJobTraces(supabase, [
      {
        job_id: job.id,
        owner_id: job.owner_id,
        payload: {
          aspectRatios,
          platformPreset,
          templateId: template.id,
          templateStyleKey: template.style_key,
          variantKey
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

    const normalizedSceneImagePaths =
      sceneReferenceImagePaths.length >= 3
        ? sceneReferenceImagePaths.slice(0, 3)
        : [
            sceneReferenceImagePaths[0],
            sceneReferenceImagePaths[1] ?? sceneReferenceImagePaths[0],
            sceneReferenceImagePaths[2] ?? sceneReferenceImagePaths[0]
          ]

    const ttsProvider = new OpenAiTtsProvider()
    await ttsProvider.generateVoiceover({
      outputFilePath: voiceoverFilePath,
      script: selectedConcept.script
    })

    const voiceoverDurationSeconds = await getMediaDurationSeconds(voiceoverFilePath)
    const captionTimeline = buildCaptionTimeline({
      script: selectedConcept.script,
      totalDurationSeconds: Math.min(10, voiceoverDurationSeconds)
    })

    await createJobTraces(supabase, [
      {
        job_id: job.id,
        owner_id: job.owner_id,
        payload: {
          captionCueCount: captionTimeline.length,
          voiceoverDurationSeconds
        },
        project_id: job.project_id,
        stage: "voiceover_and_captions_ready",
        trace_type: "provider_response"
      }
    ])

    const environment = getWorkerEnvironment()
    const videoProvider = new RunwayVideoProvider(environment.RUNWAYML_API_SECRET)

    const scenePlansByAspectRatio = aspectRatios.map((aspectRatio) => ({
      aspectRatio,
      scenePlan: buildStructuredScenePlan({
        angle: selectedConcept.angle,
        aspectRatio,
        callToAction:
          typeof job.payload.callToAction === "string" ? job.payload.callToAction : null,
        hook: selectedConcept.hook,
        platformPreset,
        productName: project.name,
        script: selectedConcept.script,
        templateCtaPreset: template.cta_preset,
        templateScenePack: template.scene_pack,
        variantKey,
        visualDirection: selectedConcept.visual_direction
      })
    }))

    const primaryScenePlan = scenePlansByAspectRatio[0]!.scenePlan

    await deleteSceneVideoAssetsByProjectId(supabase, project.id)

    const sceneResults = await Promise.all(
      normalizedSceneImagePaths.map(async (imagePath, index) => {
        const imageBytes = await import("node:fs/promises").then(({ readFile }) =>
          readFile(imagePath)
        )
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
        const plannedScene = primaryScenePlan[index] ?? primaryScenePlan[0]

        const generated = await videoProvider.generateSceneVideo({
          durationSeconds: plannedScene.durationSeconds,
          promptImage,
          promptText: plannedScene.promptText
        })

        const localSceneFilePath = join(workspacePath, `scene-${index + 1}.mp4`)
        await downloadRemoteVideoToFile({
          filePath: localSceneFilePath,
          videoUrl: generated.videoUrl
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
            motionStyle: plannedScene.motionStyle,
            purpose: plannedScene.purpose,
            runwayTaskId: generated.taskId,
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
          sceneCount: sceneResults.length,
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
      sceneResults.map((scene, index) => ({
        kind: "scene_video",
        metadata: scene.metadata,
        mime_type: "video/mp4",
        owner_id: project.owner_id,
        project_id: project.id,
        storage_key: scene.storageKey,
        duration_ms: primaryScenePlan[index]?.durationSeconds
          ? primaryScenePlan[index]!.durationSeconds * 1000
          : 3000,
        height: 1280,
        width: 720
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
        script: selectedConcept.script
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
      scenePlansByAspectRatio.map(async ({ aspectRatio, scenePlan }) => {
        const outputFilePath = join(
          workspacePath,
          `final-export-${aspectRatio.replace(":", "x")}.mp4`
        )

        await renderMultiSceneAd({
          aspectRatio,
          audioFilePath: voiceoverFilePath,
          captionTimeline,
          ctaHeadlinePrefix: template.cta_preset.headline_prefix,
          ctaSubheadlineText: template.cta_preset.subheadline_text,
          ctaText:
            typeof job.payload.callToAction === "string" && job.payload.callToAction.trim().length > 0
              ? job.payload.callToAction.trim()
              : "Shop now",
          emphasisStyle: template.cta_preset.emphasis_style,
          outputFilePath,
          projectName: project.name,
          sceneVideoFilePaths: sceneResults.map((scene) => scene.localSceneFilePath),
          workspacePath
        })

        const { height, width } = getCanvasSize(aspectRatio)
        const storageKey = `projects/${project.id}/exports/${aspectRatio.replace(":", "x")}-${randomUUID()}.mp4`

        await uploadFileArtifactToR2({
          contentType: "video/mp4",
          filePath: outputFilePath,
          storageKey
        })

        const renderMetadata = {
          aspectRatio,
          captionCueCount: captionTimeline.length,
          ctaPreset: template.cta_preset,
          platformPreset,
          previewDataUrl,
          renderMode: "ffmpeg_runway_scene_video_composition",
          sceneCount: sceneResults.length,
          scenePlan,
          selectedConceptId: selectedConcept.id,
          templateId: template.id,
          templateName: template.name,
          templateStyleKey: template.style_key,
          variantKey,
          voiceoverProvider: "openai_tts"
        }

        const renderAsset = await createRenderAsset(supabase, {
          kind: "export_video",
          metadata: renderMetadata,
          mime_type: "video/mp4",
          owner_id: project.owner_id,
          project_id: project.id,
          storage_key: storageKey,
          duration_ms: 10000,
          height,
          width
        })

        const exportRecord = await createExportRecord(supabase, {
          assetId: renderAsset.id,
          aspectRatio,
          conceptId: selectedConcept.id,
          ownerId: project.owner_id,
          platformPreset,
          projectId: project.id,
          renderMetadata,
          variantKey
        })

        exportUsageEvents.push(
          {
            estimated_cost_usd: 0.15,
            event_type: "scene_video_generation",
            export_id: exportRecord.id,
            metadata: {
              sceneCount: sceneResults.length,
              templateId: template.id
            },
            owner_id: project.owner_id,
            project_id: project.id,
            provider: "runway",
            units: sceneResults.length
          },
          {
            estimated_cost_usd: 0.004,
            event_type: "voiceover_generation",
            export_id: exportRecord.id,
            metadata: {
              durationSeconds: voiceoverDurationSeconds,
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
              platformPreset,
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
          storageKey
        }
      })
    )

    await createUsageEvents(supabase, exportUsageEvents)

    await createJobTraces(supabase, [
      {
        job_id: job.id,
        owner_id: job.owner_id,
        payload: {
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
      exportsCreated,
      projectId: project.id,
      sceneCount: sceneResults.length,
      templateId: template.id,
      templateStyleKey: template.style_key,
      variantKey
    }
  } finally {
    await cleanupRenderWorkspace(workspacePath)
  }
}
