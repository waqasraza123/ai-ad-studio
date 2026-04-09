import { PublicPageHeader } from "@/components/i18n/public-page-header"
import { PublicShowcaseGallery } from "@/features/showcase/components/public-showcase-gallery"
import { getServerI18n } from "@/lib/i18n/server"
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
  const { t } = await getServerI18n()
  const showcaseItems = await listPublishedShowcaseItems()

  return (
    <main className="theme-page-shell min-h-screen px-4 py-10 text-[var(--foreground)] sm:px-6 lg:px-8">
      <PublicPageHeader />
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="theme-surface-card rounded-[2rem] border p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
            {t("public.showcase.eyebrow")}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            {t("public.showcase.title")}
          </h1>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-[var(--muted-foreground)]">
            {t("public.showcase.description")}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <a
              className="theme-inline-secondary-button inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium"
              href="/showcase"
            >
              {t("common.actions.viewAll")}
            </a>
            <a
              className="theme-inline-secondary-button inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium"
              href="/showcase?aspectRatio=9:16"
            >
              9:16
            </a>
            <a
              className="theme-inline-secondary-button inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium"
              href="/showcase?aspectRatio=1:1"
            >
              1:1
            </a>
            <a
              className="theme-inline-secondary-button inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium"
              href="/showcase?aspectRatio=16:9"
            >
              16:9
            </a>
            <a
              className="theme-inline-secondary-button inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium"
              href="/showcase?platformPreset=instagram_reels"
            >
              Instagram Reels
            </a>
            <a
              className="theme-inline-secondary-button inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium"
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
