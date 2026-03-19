import Link from "next/link"
import type { ShowcaseItemRecord } from "@/server/database/types"

type ShowcaseGalleryGridProps = {
  showcaseItems: ShowcaseItemRecord[]
}

type ShowcaseGalleryItem = ShowcaseItemRecord & {
  aspect_ratio?: string | null
  platform_preset?: string | null
  template_style_key?: string | null
  template_name?: string | null
  preview_data_url?: string | null
}

function readAspectRatio(item: ShowcaseItemRecord) {
  return (item as ShowcaseGalleryItem).aspect_ratio ?? null
}

function readPlatformPreset(item: ShowcaseItemRecord) {
  return (item as ShowcaseGalleryItem).platform_preset ?? null
}

function readTemplateStyleKey(item: ShowcaseItemRecord) {
  return (item as ShowcaseGalleryItem).template_style_key ?? null
}

function readTemplateName(item: ShowcaseItemRecord) {
  return (item as ShowcaseGalleryItem).template_name ?? null
}

function readPreviewDataUrl(item: ShowcaseItemRecord) {
  return (item as ShowcaseGalleryItem).preview_data_url ?? null
}

export function ShowcaseGalleryGrid({
  showcaseItems
}: ShowcaseGalleryGridProps) {
  if (showcaseItems.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-sm text-slate-400">
        No showcase items yet.
      </div>
    )
  }

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {showcaseItems.map((item) => {
        const templateStyleKey = readTemplateStyleKey(item)
        const previewDataUrl = readPreviewDataUrl(item)
        const aspectRatio = readAspectRatio(item)
        const platformPreset = readPlatformPreset(item)
        const templateName = readTemplateName(item)

        return (
          <Link
            key={item.id}
            href={`/showcase?template=${encodeURIComponent(templateStyleKey ?? "all")}`}
            className="block rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/20 hover:bg-white/[0.06]"
          >
            {previewDataUrl ? (
              <img
                alt={item.title}
                className="h-64 w-full rounded-[1.5rem] object-cover"
                src={previewDataUrl}
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center rounded-[1.5rem] bg-white/[0.04] text-sm text-slate-400">
                Preview unavailable
              </div>
            )}

            <div className="mt-4">
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                {item.summary}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {aspectRatio ? (
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                    {aspectRatio}
                  </span>
                ) : null}

                {platformPreset ? (
                  <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">
                    {platformPreset}
                  </span>
                ) : null}

                {templateName ? (
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100">
                    {templateName}
                  </span>
                ) : null}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
