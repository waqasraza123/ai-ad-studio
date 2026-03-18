import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  AdTemplateRecord,
  TemplateCtaPreset,
  TemplateScenePackItem
} from "@/server/database/types"

const templateSelection =
  "id, owner_id, name, style_key, description, scene_pack, cta_preset, is_default, created_at, updated_at"

const defaultTemplates: Array<{
  name: string
  style_key: string
  description: string
  is_default: boolean
  scene_pack: TemplateScenePackItem[]
  cta_preset: TemplateCtaPreset
}> = [
  {
    name: "Premium Cinematic",
    style_key: "premium_cinematic",
    description: "Glossy premium lighting, smooth motion, elevated product framing.",
    is_default: true,
    scene_pack: [
      {
        purpose: "opener",
        motion_style: "slow cinematic reveal",
        visual_style: "premium glossy studio lighting",
        caption_tone: "confident"
      },
      {
        purpose: "product_emphasis",
        motion_style: "detail-focused glide",
        visual_style: "luxury close-up product framing",
        caption_tone: "refined"
      },
      {
        purpose: "cta_close",
        motion_style: "clean prestige finish",
        visual_style: "bold premium end-card setup",
        caption_tone: "direct"
      }
    ],
    cta_preset: {
      headline_prefix: "Now",
      subheadline_text: "Built with AI Ad Studio",
      emphasis_style: "clean"
    }
  },
  {
    name: "Fast Offer Ad",
    style_key: "fast_offer",
    description: "Quick direct-response pacing with stronger CTA emphasis.",
    is_default: false,
    scene_pack: [
      {
        purpose: "opener",
        motion_style: "fast snap-in reveal",
        visual_style: "bright ecommerce ad framing",
        caption_tone: "urgent"
      },
      {
        purpose: "product_emphasis",
        motion_style: "quick product showcase cuts",
        visual_style: "high-contrast performance ad look",
        caption_tone: "sales-driven"
      },
      {
        purpose: "cta_close",
        motion_style: "hard stop CTA finish",
        visual_style: "conversion-first end card",
        caption_tone: "urgent"
      }
    ],
    cta_preset: {
      headline_prefix: "Get",
      subheadline_text: "Limited-time style output",
      emphasis_style: "bold"
    }
  },
  {
    name: "Minimal Modern",
    style_key: "minimal_modern",
    description: "Clean composition, restrained motion, understated CTA treatment.",
    is_default: false,
    scene_pack: [
      {
        purpose: "opener",
        motion_style: "minimal fade reveal",
        visual_style: "clean soft-shadow studio look",
        caption_tone: "calm"
      },
      {
        purpose: "product_emphasis",
        motion_style: "subtle centered movement",
        visual_style: "balanced product composition",
        caption_tone: "minimal"
      },
      {
        purpose: "cta_close",
        motion_style: "quiet polished close",
        visual_style: "minimal end-card frame",
        caption_tone: "clear"
      }
    ],
    cta_preset: {
      headline_prefix: "Explore",
      subheadline_text: "Designed for modern product stories",
      emphasis_style: "minimal"
    }
  }
]

function normalizeTemplateRecord(record: {
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
}): AdTemplateRecord {
  return {
    ...record,
    cta_preset: (record.cta_preset ?? {}) as TemplateCtaPreset,
    scene_pack: Array.isArray(record.scene_pack)
      ? (record.scene_pack as TemplateScenePackItem[])
      : []
  }
}

export async function ensureDefaultTemplates(ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("ad_templates")
    .select(templateSelection)
    .eq("owner_id", ownerId)

  if (error) {
    throw new Error("Failed to load ad templates")
  }

  if ((data ?? []).length > 0) {
    return (data ?? []).map((record) =>
      normalizeTemplateRecord(record as {
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
      })
    )
  }

  const { data: inserted, error: insertError } = await supabase
    .from("ad_templates")
    .insert(
      defaultTemplates.map((template) => ({
        ...template,
        owner_id: ownerId
      }))
    )
    .select(templateSelection)

  if (insertError) {
    throw new Error("Failed to create default ad templates")
  }

  return (inserted ?? []).map((record) =>
    normalizeTemplateRecord(record as {
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
    })
  )
}

export async function listTemplatesByOwner(ownerId: string) {
  const templates = await ensureDefaultTemplates(ownerId)

  return templates.sort((left, right) => {
    if (left.is_default === right.is_default) {
      return left.name.localeCompare(right.name)
    }

    return left.is_default ? -1 : 1
  })
}

export async function getTemplateByIdForOwner(templateId: string, ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("ad_templates")
    .select(templateSelection)
    .eq("id", templateId)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load ad template")
  }

  if (!data) {
    return null
  }

  return normalizeTemplateRecord(
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
    }
  )
}

export async function getDefaultTemplateForOwner(ownerId: string) {
  const templates = await listTemplatesByOwner(ownerId)
  return templates.find((template) => template.is_default) ?? templates[0] ?? null
}
