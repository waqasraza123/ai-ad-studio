import type { SupabaseClient } from "@supabase/supabase-js"
import { randomUUID } from "node:crypto"
import { join } from "node:path"
import { writeFile } from "node:fs/promises"
import { uploadFileArtifactToR2 } from "@/lib/storage/r2"
import { createRenderWorkspace, cleanupRenderWorkspace } from "@/media/temp/temp-paths"
import { renderSelectedConceptVideo } from "@/media/ffmpeg/render-selected-concept"
import { createRenderAsset } from "@/repositories/assets-repository"
import { listConceptsByProjectId } from "@/repositories/concepts-repository"
import { createExportRecord } from "@/repositories/exports-repository"
import { getProjectById, updateProjectStatus } from "@/repositories/projects-repository"
import type { WorkerJobRecord } from "@/repositories/jobs-repository"

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

function createCaptionLines(input: {
  angle: string
  callToAction: string | null
  hook: string
}) {
  const lines = [
    input.hook.trim(),
    input.angle.trim(),
    input.callToAction?.trim() || "Shop now"
  ]

  return lines
    .filter((line) => line.length > 0)
    .map((line) => (line.length > 46 ? `${line.slice(0, 43)}...` : line))
    .slice(0, 3)
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

  const concepts = await listConceptsByProjectId(supabase, job.project_id)
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
  const inputFilePath = await materializePreviewImage({
    previewDataUrl,
    workspacePath
  })
  const outputFilePath = join(workspacePath, "final-export.mp4")

  try {
    await renderSelectedConceptVideo({
      captionLines: createCaptionLines({
        angle: selectedConcept.angle,
        callToAction:
          typeof job.payload.callToAction === "string" ? job.payload.callToAction : null,
        hook: selectedConcept.hook
      }),
      inputFilePath,
      outputFilePath
    })

    const storageKey = `projects/${project.id}/exports/${randomUUID()}.mp4`

    await uploadFileArtifactToR2({
      contentType: "video/mp4",
      filePath: outputFilePath,
      storageKey
    })

    const renderAsset = await createRenderAsset(supabase, {
      kind: "export_video",
      metadata: {
        previewDataUrl,
        renderMode: "ffmpeg_static_composition",
        selectedConceptId: selectedConcept.id
      },
      mime_type: "video/mp4",
      owner_id: project.owner_id,
      project_id: project.id,
      storage_key: storageKey,
      duration_ms: 10000,
      height: 1920,
      width: 1080
    })

    const exportRecord = await createExportRecord(supabase, {
      assetId: renderAsset.id,
      conceptId: selectedConcept.id,
      ownerId: project.owner_id,
      projectId: project.id
    })

    await updateProjectStatus(supabase, {
      projectId: project.id,
      status: "export_ready"
    })

    return {
      exportId: exportRecord.id,
      projectId: project.id,
      storageKey
    }
  } finally {
    await cleanupRenderWorkspace(workspacePath)
  }
}
