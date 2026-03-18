import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  ExportRecord,
  ShowcaseItemRecord
} from "@/server/database/types"

const showcaseSelection =
  "id, owner_id, project_id, export_id, title, summary, preview_data_url, aspect_ratio, platform_preset, template_name, template_style_key, is_published, sort_order, created_at, updated_at"

export async function listShowcaseItemsByOwner(ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("showcase_items")
    .select(showcaseSelection)
    .eq("owner_id", ownerId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list showcase items")
  }

  return (data ?? []) as ShowcaseItemRecord[]
}

export async function listPublishedShowcaseItems() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("showcase_items")
    .select(showcaseSelection)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list published showcase items")
  }

  return (data ?? []) as ShowcaseItemRecord[]
}

export async function getShowcaseItemByExportIdForOwner(
  exportId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("showcase_items")
    .select(showcaseSelection)
    .eq("export_id", exportId)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load showcase item")
  }

  return (data ?? null) as ShowcaseItemRecord | null
}

export async function upsertShowcaseItem(input: {
  exportRecord: ExportRecord
  ownerId: string
  previewDataUrl: string | null
  projectName: string
  summary: string
}) {
  const supabase = await createSupabaseServerClient()

  const templateName =
    typeof input.exportRecord.render_metadata.templateName === "string"
      ? input.exportRecord.render_metadata.templateName
      : null

  const templateStyleKey =
    typeof input.exportRecord.render_metadata.templateStyleKey === "string"
      ? input.exportRecord.render_metadata.templateStyleKey
      : null

  const existing = await getShowcaseItemByExportIdForOwner(
    input.exportRecord.id,
    input.ownerId
  )

  const payload = {
    aspect_ratio: input.exportRecord.aspect_ratio,
    is_published: true,
    platform_preset: input.exportRecord.platform_preset,
    preview_data_url: input.previewDataUrl,
    project_id: input.exportRecord.project_id,
    summary: input.summary,
    template_name: templateName,
    template_style_key: templateStyleKey,
    title: input.projectName,
    updated_at: new Date().toISOString()
  }

  if (existing) {
    const { data, error } = await supabase
      .from("showcase_items")
      .update(payload)
      .eq("id", existing.id)
      .eq("owner_id", input.ownerId)
      .select(showcaseSelection)
      .single()

    if (error) {
      throw new Error("Failed to update showcase item")
    }

    return data as ShowcaseItemRecord
  }

  const { data, error } = await supabase
    .from("showcase_items")
    .insert({
      ...payload,
      export_id: input.exportRecord.id,
      owner_id: input.ownerId
    })
    .select(showcaseSelection)
    .single()

  if (error) {
    throw new Error("Failed to create showcase item")
  }

  return data as ShowcaseItemRecord
}

export async function unpublishShowcaseItem(input: {
  ownerId: string
  showcaseItemId: string
}) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("showcase_items")
    .update({
      is_published: false,
      updated_at: new Date().toISOString()
    })
    .eq("id", input.showcaseItemId)
    .eq("owner_id", input.ownerId)
    .select(showcaseSelection)
    .single()

  if (error) {
    throw new Error("Failed to unpublish showcase item")
  }

  return data as ShowcaseItemRecord
}
