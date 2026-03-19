import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  ExportAspectRatio,
  ExportRecord,
  PlatformPresetKey,
  ShowcaseItemRecord
} from "@/server/database/types"

const showcaseSelection =
  "id, owner_id, project_id, export_id, render_batch_id, title, summary, is_published, sort_order, created_at, updated_at"

type EnrichedShowcaseItemRecord = ShowcaseItemRecord & {
  aspect_ratio: ExportAspectRatio | null
  platform_preset: PlatformPresetKey | null
  template_style_key: string | null
  template_name: string | null
  preview_data_url: string | null
}

type ShowcaseBaseRecord = ShowcaseItemRecord

type AssetPreviewRecord = {
  id: string
  metadata: Record<string, unknown>
}

function normalizeShowcaseItem(
  record: ShowcaseBaseRecord,
  exportRecord?: ExportRecord | null,
  previewDataUrl?: string | null
): EnrichedShowcaseItemRecord {
  return {
    ...record,
    aspect_ratio: exportRecord?.aspect_ratio ?? null,
    platform_preset: exportRecord?.platform_preset ?? null,
    template_style_key:
      typeof exportRecord?.render_metadata.templateStyleKey === "string"
        ? exportRecord.render_metadata.templateStyleKey
        : null,
    template_name:
      typeof exportRecord?.render_metadata.templateName === "string"
        ? exportRecord.render_metadata.templateName
        : null,
    preview_data_url: previewDataUrl ?? null
  }
}

async function enrichShowcaseItems(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  items: ShowcaseBaseRecord[]
) {
  if (items.length === 0) {
    return [] as EnrichedShowcaseItemRecord[]
  }

  const exportIds = [...new Set(items.map((item) => item.export_id))]
  const { data: exportRows, error: exportError } = await supabase
    .from("exports")
    .select(
      "id, project_id, concept_id, owner_id, asset_id, status, version, variant_key, aspect_ratio, platform_preset, render_metadata, created_at, updated_at"
    )
    .in("id", exportIds)

  if (exportError) {
    throw new Error("Failed to load showcase exports")
  }

  const exportRecords = (exportRows ?? []) as ExportRecord[]
  const exportsById = new Map(
    exportRecords.map((exportRecord) => [exportRecord.id, exportRecord])
  )

  const assetIds = [
    ...new Set(
      exportRecords
        .map((exportRecord) => exportRecord.asset_id)
        .filter((assetId): assetId is string => Boolean(assetId))
    )
  ]

  const assetRowsResult = assetIds.length
    ? await supabase.from("assets").select("id, metadata").in("id", assetIds)
    : { data: [] as AssetPreviewRecord[], error: null }

  if (assetRowsResult.error) {
    throw new Error("Failed to load showcase assets")
  }

  const previewByAssetId = new Map(
    ((assetRowsResult.data ?? []) as AssetPreviewRecord[]).map(
      (assetRecord) => [
        assetRecord.id,
        typeof assetRecord.metadata.previewDataUrl === "string"
          ? assetRecord.metadata.previewDataUrl
          : null
      ]
    )
  )

  return items.map((item) => {
    const exportRecord = exportsById.get(item.export_id) ?? null
    const previewDataUrl =
      exportRecord?.asset_id != null
        ? (previewByAssetId.get(exportRecord.asset_id) ?? null)
        : null

    return normalizeShowcaseItem(item, exportRecord, previewDataUrl)
  })
}

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

  return enrichShowcaseItems(supabase, (data ?? []) as ShowcaseBaseRecord[])
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

  return enrichShowcaseItems(supabase, (data ?? []) as ShowcaseBaseRecord[])
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

  if (!data) {
    return null
  }

  const [item] = await enrichShowcaseItems(supabase, [
    data as ShowcaseBaseRecord
  ])

  return item ?? null
}

export async function upsertShowcaseItem(input: {
  exportRecord: ExportRecord
  ownerId: string
  projectName: string
  renderBatchId: string
  summary: string
}) {
  const supabase = await createSupabaseServerClient()

  const existing = await getShowcaseItemByExportIdForOwner(
    input.exportRecord.id,
    input.ownerId
  )

  if (existing) {
    const { data, error } = await supabase
      .from("showcase_items")
      .update({
        is_published: true,
        render_batch_id: input.renderBatchId,
        summary: input.summary,
        title: input.projectName,
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id)
      .eq("owner_id", input.ownerId)
      .select(showcaseSelection)
      .single()

    if (error) {
      throw new Error("Failed to update showcase item")
    }

    const [item] = await enrichShowcaseItems(supabase, [
      data as ShowcaseBaseRecord
    ])
    return item
  }

  const { data, error } = await supabase
    .from("showcase_items")
    .insert({
      export_id: input.exportRecord.id,
      owner_id: input.ownerId,
      project_id: input.exportRecord.project_id,
      render_batch_id: input.renderBatchId,
      summary: input.summary,
      title: input.projectName
    })
    .select(showcaseSelection)
    .single()

  if (error) {
    throw new Error("Failed to create showcase item")
  }

  const [item] = await enrichShowcaseItems(supabase, [
    data as ShowcaseBaseRecord
  ])
  return item
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

  const [item] = await enrichShowcaseItems(supabase, [
    data as ShowcaseBaseRecord
  ])
  return item
}
