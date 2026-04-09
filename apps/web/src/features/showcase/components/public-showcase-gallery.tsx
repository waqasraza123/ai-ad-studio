import { getServerI18n } from "@/lib/i18n/server"
import type { ShowcaseItemRecord } from "@/server/database/types"

type PublicShowcaseGalleryProps = {
  selectedAspectRatio: string
  selectedPlatformPreset: string
  selectedTemplate: string
  showcaseItems: ShowcaseItemRecord[]
}

type ShowcaseGalleryItem = ShowcaseItemRecord & {
  aspect_ratio?: string | null
  platform_preset?: string | null
  template_style_key?: string | null
  template_name?: string | null
  preview_data_url?: string | null
}

function matchesFilter(value: string | null, selected: string) {
  return selected === "all" || value === selected
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

export async function PublicShowcaseGallery({
  selectedAspectRatio,
  selectedPlatformPreset,
  selectedTemplate,
  showcaseItems
}: PublicShowcaseGalleryProps) {
  const { t } = await getServerI18n()
  const filteredItems = showcaseItems.filter((item) => {
    return (
      matchesFilter(readAspectRatio(item), selectedAspectRatio) &&
      matchesFilter(readPlatformPreset(item), selectedPlatformPreset) &&
      matchesFilter(readTemplateStyleKey(item), selectedTemplate)
    )
  })

  if (filteredItems.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-sm text-slate-400">
        {t("public.showcase.empty")}
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {filteredItems.map((item) => {
        const previewDataUrl = readPreviewDataUrl(item)
        const aspectRatio = readAspectRatio(item)
        const platformPreset = readPlatformPreset(item)
        const templateName = readTemplateName(item)

        return (
          <article
            key={item.id}
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]"
          >
            {previewDataUrl ? (
              <img
                alt={item.title}
                className="h-72 w-full object-cover"
                decoding="async"
                loading="lazy"
                src={previewDataUrl}
              />
            ) : (
              <div className="flex h-72 items-center justify-center bg-white/[0.04] text-sm text-slate-400">
                {t("public.showcase.previewUnavailable")}
              </div>
            )}

            <div className="p-5">
              <p className="text-lg font-semibold text-white">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
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
          </article>
        )
      })}
    </div>
  )
}
