import type { ShowcaseItemRecord } from "@/server/database/types"

type PublicShowcaseGalleryProps = {
  selectedAspectRatio: string
  selectedPlatformPreset: string
  selectedTemplate: string
  showcaseItems: ShowcaseItemRecord[]
}

function matchesFilter(value: string | null, selected: string) {
  return selected === "all" || value === selected
}

export function PublicShowcaseGallery({
  selectedAspectRatio,
  selectedPlatformPreset,
  selectedTemplate,
  showcaseItems
}: PublicShowcaseGalleryProps) {
  const filteredItems = showcaseItems.filter((item) => {
    return (
      matchesFilter(item.aspect_ratio, selectedAspectRatio) &&
      matchesFilter(item.platform_preset, selectedPlatformPreset) &&
      matchesFilter(item.template_style_key, selectedTemplate)
    )
  })

  if (filteredItems.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-sm text-slate-400">
        No showcase items match the current filters.
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {filteredItems.map((item) => (
        <article
          key={item.id}
          className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]"
        >
          {item.preview_data_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={item.title}
              className="h-72 w-full object-cover"
              src={item.preview_data_url}
            />
          ) : (
            <div className="flex h-72 items-center justify-center bg-white/[0.04] text-sm text-slate-400">
              Preview unavailable
            </div>
          )}

          <div className="p-5">
            <p className="text-lg font-semibold text-white">{item.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">{item.summary}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                {item.aspect_ratio}
              </span>
              <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">
                {item.platform_preset}
              </span>
              {item.template_name ? (
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100">
                  {item.template_name}
                </span>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
