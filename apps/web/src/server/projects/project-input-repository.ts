import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ProjectBriefInput } from "@/features/projects/schemas/project-schema"
import type { ProjectInputRecord } from "@/server/database/types"

const projectInputSelection =
  "project_id, owner_id, product_name, product_description, offer_text, call_to_action, target_audience, brand_tone, visual_style, duration_seconds, aspect_ratio, created_at, updated_at"

function normalizeOptionalText(value: string | undefined) {
  const normalized = value?.trim() ?? ""
  return normalized.length > 0 ? normalized : null
}

export async function getProjectInputByProjectIdForOwner(
  projectId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("project_inputs")
    .select(projectInputSelection)
    .eq("project_id", projectId)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load project brief")
  }

  return (data ?? null) as ProjectInputRecord | null
}

export async function upsertProjectInput(input: {
  ownerId: string
  projectId: string
  brief: ProjectBriefInput
}) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("project_inputs")
    .upsert(
      {
        project_id: input.projectId,
        owner_id: input.ownerId,
        product_name: normalizeOptionalText(input.brief.productName),
        product_description: normalizeOptionalText(input.brief.productDescription),
        offer_text: normalizeOptionalText(input.brief.offerText),
        call_to_action: normalizeOptionalText(input.brief.callToAction),
        target_audience: normalizeOptionalText(input.brief.targetAudience),
        brand_tone: normalizeOptionalText(input.brief.brandTone),
        visual_style: normalizeOptionalText(input.brief.visualStyle)
      },
      {
        onConflict: "project_id"
      }
    )
    .select(projectInputSelection)
    .single()

  if (error) {
    throw new Error("Failed to save project brief")
  }

  return data as ProjectInputRecord
}
