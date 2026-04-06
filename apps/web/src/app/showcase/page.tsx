import { PublicShowcaseGallery } from "@/features/showcase/components/public-showcase-gallery"
import { listPublishedShowcaseItems } from "@/server/showcase/showcase-repository"

type PublicShowcasePageProps = {
  searchParams: Promise<{
    aspectRatio?: string
    platformPreset?: string
    template?: string
  }>
}

export default async function PublicShowcasePage({
  searchParams
}: PublicShowcasePageProps) {
  const params = await searchParams
  const showcaseItems = await listPublishedShowcaseItems()

  return (
    <main className="theme-page-shell min-h-screen px-4 py-10 text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Public showcase
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
            Generated ad gallery
          </h1>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">
            Browse generated exports grouped by branded template, aspect ratio, and platform preset.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <a
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
              href="/showcase"
            >
              All
            </a>
            <a
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
              href="/showcase?aspectRatio=9:16"
            >
              9:16
            </a>
            <a
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
              href="/showcase?aspectRatio=1:1"
            >
              1:1
            </a>
            <a
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
              href="/showcase?aspectRatio=16:9"
            >
              16:9
            </a>
            <a
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
              href="/showcase?platformPreset=instagram_reels"
            >
              Instagram Reels
            </a>
            <a
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
              href="/showcase?platformPreset=youtube_landscape"
            >
              YouTube Landscape
            </a>
          </div>
        </section>

        <PublicShowcaseGallery
          selectedAspectRatio={params.aspectRatio ?? "all"}
          selectedPlatformPreset={params.platformPreset ?? "all"}
          selectedTemplate={params.template ?? "all"}
          showcaseItems={showcaseItems}
        />
      </div>
    </main>
  )
}
