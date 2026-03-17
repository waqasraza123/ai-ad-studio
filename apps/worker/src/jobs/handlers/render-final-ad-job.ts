import type { SupabaseClient } from "@supabase/supabase-js"
import { randomUUID } from "node:crypto"
import { uploadTextArtifactToR2 } from "@/lib/storage/r2"
import { createRenderAsset } from "@/repositories/assets-repository"
import { listConceptsByProjectId } from "@/repositories/concepts-repository"
import { createExportRecord } from "@/repositories/exports-repository"
import { getProjectById, updateProjectStatus } from "@/repositories/projects-repository"
import type { WorkerJobRecord } from "@/repositories/jobs-repository"

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function createPreviewSvg(input: {
  conceptAngle: string
  conceptTitle: string
  projectName: string
}) {
  const projectName = escapeXml(input.projectName.slice(0, 32))
  const conceptTitle = escapeXml(input.conceptTitle.slice(0, 32))
  const conceptAngle = escapeXml(input.conceptAngle.slice(0, 28))

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" fill="none">
      <defs>
        <linearGradient id="bg" x1="180" y1="40" x2="1120" y2="720" gradientUnits="userSpaceOnUse">
          <stop stop-color="#0F172A"/>
          <stop offset="0.42" stop-color="#3730A3"/>
          <stop offset="1" stop-color="#020617"/>
        </linearGradient>
        <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(330 140) rotate(47.7) scale(560 560)">
          <stop stop-color="#818CF8" stop-opacity="0.95"/>
          <stop offset="1" stop-color="#818CF8" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1280" height="720" rx="40" fill="url(#bg)"/>
      <rect width="1280" height="720" rx="40" fill="url(#glow)"/>
      <rect x="58" y="58" width="1164" height="604" rx="32" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)"/>
      <text x="96" y="122" fill="#A5B4FC" font-size="26" font-family="Arial, sans-serif" letter-spacing="4.2">FINAL RENDER SCAFFOLD</text>
      <text x="96" y="228" fill="#F8FAFC" font-size="58" font-weight="700" font-family="Arial, sans-serif">${projectName}</text>
      <text x="96" y="308" fill="#E2E8F0" font-size="34" font-family="Arial, sans-serif">${conceptTitle}</text>
      <text x="96" y="364" fill="#CBD5E1" font-size="28" font-family="Arial, sans-serif">${conceptAngle}</text>
      <rect x="96" y="420" width="360" height="132" rx="24" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.14)"/>
      <text x="128" y="478" fill="#FFFFFF" font-size="30" font-family="Arial, sans-serif">Mock export artifact</text>
      <text x="128" y="524" fill="#CBD5E1" font-size="22" font-family="Arial, sans-serif">Storage-backed render lifecycle proven</text>
    </svg>
  `.trim()
}

function createDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
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

  const svg = createPreviewSvg({
    conceptAngle: selectedConcept.angle,
    conceptTitle: selectedConcept.title,
    projectName: project.name
  })

  const storageKey = `projects/${project.id}/exports/${randomUUID()}.svg`

  await uploadTextArtifactToR2({
    body: svg,
    contentType: "image/svg+xml",
    storageKey
  })

  const renderAsset = await createRenderAsset(supabase, {
    kind: "export_video",
    metadata: {
      previewDataUrl: createDataUrl(svg),
      renderMode: "mock_export_preview",
      selectedConceptId: selectedConcept.id
    },
    mime_type: "image/svg+xml",
    owner_id: project.owner_id,
    project_id: project.id,
    storage_key: storageKey
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
}
