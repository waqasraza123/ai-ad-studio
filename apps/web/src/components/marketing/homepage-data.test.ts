import { describe, expect, it } from "vitest"
import type { ShowcaseItemRecord } from "@/server/database/types"
import { mapHomepageFeaturedShowcaseItems } from "./homepage-data"

function buildShowcaseItem(
  overrides: Partial<ShowcaseItemRecord> & {
    aspect_ratio?: string | null
    platform_preset?: string | null
    preview_data_url?: string | null
    template_name?: string | null
  }
): ShowcaseItemRecord {
  return {
    created_at: overrides.created_at ?? "2026-04-08T00:00:00.000Z",
    export_id: overrides.export_id ?? crypto.randomUUID(),
    id: overrides.id ?? crypto.randomUUID(),
    is_published: overrides.is_published ?? true,
    owner_id: overrides.owner_id ?? "owner-1",
    project_id: overrides.project_id ?? "project-1",
    render_batch_id: overrides.render_batch_id ?? "batch-1",
    sort_order: overrides.sort_order ?? 0,
    summary: overrides.summary ?? "Summary",
    title: overrides.title ?? "Title",
    updated_at: overrides.updated_at ?? "2026-04-08T00:00:00.000Z",
    ...(overrides.aspect_ratio ? { aspect_ratio: overrides.aspect_ratio } : {}),
    ...(overrides.platform_preset
      ? { platform_preset: overrides.platform_preset }
      : {}),
    ...(overrides.preview_data_url
      ? { preview_data_url: overrides.preview_data_url }
      : {}),
    ...(overrides.template_name
      ? { template_name: overrides.template_name }
      : {})
  } as ShowcaseItemRecord
}

describe("mapHomepageFeaturedShowcaseItems", () => {
  it("limits homepage featured showcase items and derives tags", () => {
    const result = mapHomepageFeaturedShowcaseItems([
      buildShowcaseItem({
        aspect_ratio: "9:16",
        id: "item-1",
        platform_preset: "instagram_reels",
        preview_data_url: "https://example.com/preview-1.jpg",
        summary: "First summary",
        template_name: "Premium Cinematic",
        title: "First title"
      }),
      buildShowcaseItem({ id: "item-2", title: "Second title" }),
      buildShowcaseItem({ id: "item-3", title: "Third title" }),
      buildShowcaseItem({ id: "item-4", title: "Fourth title" })
    ])

    expect(result).toEqual([
      {
        href: "/showcase",
        id: "item-1",
        imageUrl: "https://example.com/preview-1.jpg",
        summary: "First summary",
        tags: ["9:16", "instagram_reels", "Premium Cinematic"],
        title: "First title"
      },
      {
        href: "/showcase",
        id: "item-2",
        imageUrl: null,
        summary: "Summary",
        tags: [],
        title: "Second title"
      },
      {
        href: "/showcase",
        id: "item-3",
        imageUrl: null,
        summary: "Summary",
        tags: [],
        title: "Third title"
      }
    ])
  })

  it("returns an empty array when there are no showcase items", () => {
    expect(mapHomepageFeaturedShowcaseItems([])).toEqual([])
  })
})
