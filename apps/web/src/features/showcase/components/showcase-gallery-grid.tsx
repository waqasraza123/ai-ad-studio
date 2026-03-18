import Link from "next/link"
import type { ShowcaseItemRecord } from "@/server/database/types"

type ShowcaseGalleryGridProps = {
  showcaseItems: ShowcaseItemRecord[]
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
      {showcaseItems.map((item) => (
        <Link
          key={item.id}
          href={`/showcase?template=${encodeURIComponent(item.template_style_key ?? "all")}`}
          className="block rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/20 hover:bg-white/[0.06]"
        >
          {item.preview_data_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={item.title}
              className="h-64 w-full rounded-[1.5rem] object-cover"
              src={item.preview_data_url}
            />
          ) : (
            <div className="flex h-64 w-full items-center justify-center rounded-[1.5rem] bg-white/[0.04] text-sm text-slate-400">
              Preview unavailable
            </div>
          )}

          <div className="mt-4">
            <p className="text-sm font-medium text-white">{item.title}</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">{item.summary}</p>

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
        </Link>
      ))}
    </div>
  )
}
