import type { SupabaseClient } from "@supabase/supabase-js"

type TemplateScenePackItem = {
  purpose: "opener" | "product_emphasis" | "cta_close"
  motion_style: string
  visual_style: string
  caption_tone: string
}

type TemplateCtaPreset = {
  headline_prefix: string
  subheadline_text: string
  emphasis_style: "clean" | "bold" | "minimal"
}

type WorkerAdTemplateRecord = {
  id: string
  owner_id: string
  name: string
  style_key: string
  description: string
  scene_pack: TemplateScenePackItem[]
  cta_preset: TemplateCtaPreset
  is_default: boolean
  created_at: string
  updated_at: string
}

const templateSelection =
  "id, owner_id, name, style_key, description, scene_pack, cta_preset, is_default, created_at, updated_at"

const fallbackTemplate: Omit<
  WorkerAdTemplateRecord,
  "id" | "owner_id" | "created_at" | "updated_at"
> = {
  name: "Fallback Template",
  style_key: "fallback_template",
  description: "Fallback creative structure",
  is_default: true,
  scene_pack: [
    {
      purpose: "opener",
      motion_style: "clean reveal",
      visual_style: "premium product shot",
      caption_tone: "clear"
    },
    {
      purpose: "product_emphasis",
      motion_style: "detail glide",
      visual_style: "product emphasis frame",
      caption_tone: "direct"
    },
    {
      purpose: "cta_close",
      motion_style: "clean close",
      visual_style: "conversion end-card frame",
      caption_tone: "strong"
    }
  ],
  cta_preset: {
    headline_prefix: "Now",
    subheadline_text: "Built with AI Ad Studio",
    emphasis_style: "clean"
  }
}

function normalizeScenePack(value: unknown): TemplateScenePackItem[] {
  if (!Array.isArray(value)) {
    return fallbackTemplate.scene_pack
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null
      }

      const record = item as Record<string, unknown>
      const purpose = record.purpose
      const motionStyle = record.motion_style
      const visualStyle = record.visual_style
      const captionTone = record.caption_tone

      if (
        (purpose !== "opener" &&
          purpose !== "product_emphasis" &&
          purpose !== "cta_close") ||
        typeof motionStyle !== "string" ||
        typeof visualStyle !== "string" ||
        typeof captionTone !== "string"
      ) {
        return null
      }

      return {
        caption_tone: captionTone,
        motion_style: motionStyle,
        purpose,
        visual_style: visualStyle
      }
    })
    .filter((item): item is TemplateScenePackItem => item !== null)
}

function normalizeCtaPreset(value: unknown): TemplateCtaPreset {
  if (!value || typeof value !== "object") {
    return fallbackTemplate.cta_preset
  }

  const record = value as Record<string, unknown>
  const emphasisStyle = record.emphasis_style

  return {
    emphasis_style:
      emphasisStyle === "bold" || emphasisStyle === "minimal"
        ? emphasisStyle
        : "clean",
    headline_prefix:
      typeof record.headline_prefix === "string"
        ? record.headline_prefix
        : fallbackTemplate.cta_preset.headline_prefix,
    subheadline_text:
      typeof record.subheadline_text === "string"
        ? record.subheadline_text
        : fallbackTemplate.cta_preset.subheadline_text
  }
}

function normalizeTemplate(
  template: {
    id: string
    owner_id: string
    name: string
    style_key: string
    description: string
    scene_pack: unknown
    cta_preset: unknown
    is_default: boolean
    created_at: string
    updated_at: string
  } | null
): WorkerAdTemplateRecord {
  if (!template) {
    return {
      ...fallbackTemplate,
      created_at: "",
      id: "fallback-template",
      owner_id: "",
      updated_at: ""
    }
  }

  return {
    ...template,
    cta_preset: normalizeCtaPreset(template.cta_preset),
    scene_pack: normalizeScenePack(template.scene_pack)
  }
}

export async function getProjectTemplate(
  supabase: SupabaseClient,
  input: {
    ownerId: string
    templateId: string | null
  }
) {
  if (!input.templateId) {
    const { data, error } = await supabase
      .from("ad_templates")
      .select(templateSelection)
      .eq("owner_id", input.ownerId)
      .eq("is_default", true)
      .maybeSingle()

    if (error) {
      throw new Error("Failed to load default project template")
    }

    return normalizeTemplate(
      data as {
        id: string
        owner_id: string
        name: string
        style_key: string
        description: string
        scene_pack: unknown
        cta_preset: unknown
        is_default: boolean
        created_at: string
        updated_at: string
      } | null
    )
  }

  const { data, error } = await supabase
    .from("ad_templates")
    .select(templateSelection)
    .eq("id", input.templateId)
    .eq("owner_id", input.ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load project template")
  }

  return normalizeTemplate(
    data as {
      id: string
      owner_id: string
      name: string
      style_key: string
      description: string
      scene_pack: unknown
      cta_preset: unknown
      is_default: boolean
      created_at: string
      updated_at: string
    } | null
  )
}
