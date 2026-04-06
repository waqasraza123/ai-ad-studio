"use server"

import { revalidatePath } from "next/cache"
import { MODEST_WORDING_FORM_ERROR_CODE, validateModestText } from "@/lib/modest-wording/index"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirectToLoginWithFormError, redirectWithFormError } from "@/lib/server-action-redirect"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getExportByIdForOwner } from "@/server/exports/export-repository"
import { getProjectByIdForOwner } from "@/server/projects/project-repository"
import { getPromotionEligibilityForExport } from "@/server/promotion/promotion-eligibility"
import {
  getShowcaseItemByExportIdForOwner,
  upsertShowcaseItem
} from "@/server/showcase/showcase-repository"

function buildDefaultSummary(input: {
  aspectRatio: string
  platformPreset: string
  templateName: string | null
}) {
  const templatePart = input.templateName ? ` using the ${input.templateName} template` : ""
  return `Generated ${input.aspectRatio} export for ${input.platformPreset}${templatePart}.`
}

function exportPath(exportId: string) {
  return `/dashboard/exports/${exportId}`
}

export async function publishShowcaseItemAction(exportId: string, formData: FormData) {
  const path = exportPath(exportId)
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  const exportRecord = await getExportByIdForOwner(exportId, user.id)

  if (!exportRecord) {
    redirectWithFormError(path, "export_not_found")
  }

  const eligibility = await getPromotionEligibilityForExport({
    exportRecord,
    ownerId: user.id
  })

  if (!eligibility.eligible) {
    redirectWithFormError(path, "promotion_ineligible")
  }

  const project = await getProjectByIdForOwner(exportRecord.project_id, user.id)

  if (!project) {
    redirectWithFormError(path, "project_not_found")
  }

  const templateName =
    typeof exportRecord.render_metadata.templateName === "string"
      ? exportRecord.render_metadata.templateName
      : null

  const summaryValue = String(formData.get("summary") ?? "").trim()

  if (validateModestText(summaryValue)) {
    redirectWithFormError(path, MODEST_WORDING_FORM_ERROR_CODE)
  }

  try {
    await upsertShowcaseItem({
      exportRecord,
      ownerId: user.id,
      projectName: project.name,
      renderBatchId: eligibility.batchId,
      summary:
        summaryValue ||
        buildDefaultSummary({
          aspectRatio: exportRecord.aspect_ratio,
          platformPreset: exportRecord.platform_preset,
          templateName
        })
    })

    const supabase = await createSupabaseServerClient()

    await supabase.from("job_traces").insert({
      job_id: eligibility.jobId,
      owner_id: user.id,
      payload: {
        exportId,
        renderBatchId: eligibility.batchId
      },
      project_id: eligibility.projectId,
      stage: "winner_promoted_to_showcase",
      trace_type: "promotion"
    })

    await supabase.from("notifications").insert({
      action_url: `/dashboard/exports/${exportId}`,
      body: "A reviewed winner has been published to the public showcase.",
      export_id: exportId,
      job_id: eligibility.jobId,
      kind: "winner_promoted_to_showcase",
      metadata: {
        batchId: eligibility.batchId
      },
      owner_id: user.id,
      project_id: eligibility.projectId,
      severity: "success",
      title: "Winner published to showcase"
    })
  } catch {
    redirectWithFormError(path, "server_error")
  }

  revalidatePath("/dashboard/showcase")
  revalidatePath(path)
  revalidatePath("/showcase")
}

export async function unpublishShowcaseItemAction(exportId: string) {
  const path = exportPath(exportId)
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  const item = await getShowcaseItemByExportIdForOwner(exportId, user.id)

  if (!item) {
    redirectWithFormError(path, "showcase_not_found")
  }

  try {
    const { unpublishShowcaseItem } = await import("@/server/showcase/showcase-repository")

    await unpublishShowcaseItem({
      ownerId: user.id,
      showcaseItemId: item.id
    })
  } catch {
    redirectWithFormError(path, "server_error")
  }

  revalidatePath("/dashboard/showcase")
  revalidatePath(path)
  revalidatePath("/showcase")
}
