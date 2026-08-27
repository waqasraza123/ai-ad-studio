import type { ShowcaseItemRecord } from "@/server/database/types"

type ShowcaseGalleryItem = ShowcaseItemRecord & {
  aspect_ratio?: string | null
  platform_preset?: string | null
  template_name?: string | null
  preview_data_url?: string | null
}

export type HomepageFeaturedShowcaseItem = {
  href: string
  id: string
  imageUrl: string | null
  summary: string
  tags: string[]
  title: string
}

function compactTagList(values: Array<string | null | undefined>) {
  return values.filter((value): value is string =>
    Boolean(value && value.trim().length > 0)
  )
}

export function mapHomepageFeaturedShowcaseItems(
  items: ShowcaseItemRecord[],
  limit = 3
): HomepageFeaturedShowcaseItem[] {
  return items.slice(0, limit).map((item) => {
    const showcaseItem = item as ShowcaseGalleryItem

    return {
      href: "/showcase",
      id: item.id,
      imageUrl: showcaseItem.preview_data_url ?? null,
      summary: item.summary,
      tags: compactTagList([
        showcaseItem.aspect_ratio,
        showcaseItem.platform_preset,
        showcaseItem.template_name
      ]),
      title: item.title
    }
  })
}
