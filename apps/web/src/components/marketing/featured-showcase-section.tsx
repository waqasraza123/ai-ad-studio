import Link from "next/link"
import { ArrowUpRight, GalleryVerticalEnd } from "lucide-react"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getServerI18n } from "@/lib/i18n/server"
import type { HomepageFeaturedShowcaseItem } from "./homepage-data"

type FeaturedShowcaseSectionProps = {
  items: HomepageFeaturedShowcaseItem[]
}

type ShowcaseSectionCard = {
  href: string | null
  imageUrl: string | null
  summary: string
  tags: string[]
  title: string
}

export async function FeaturedShowcaseSection({
  items
}: FeaturedShowcaseSectionProps) {
  const { t } = await getServerI18n()
  const fallbackCards: ShowcaseSectionCard[] = [
    {
      href: null,
      imageUrl: null,
      summary: t("marketing.showcase.fallback.one.summary"),
      tags: [
        t("marketing.showcase.fallback.one.tagOne"),
        t("marketing.showcase.fallback.one.tagTwo"),
        t("marketing.showcase.fallback.one.tagThree")
      ],
      title: t("marketing.showcase.fallback.one.title")
    },
    {
      href: null,
      imageUrl: null,
      summary: t("marketing.showcase.fallback.two.summary"),
      tags: [
        t("marketing.showcase.fallback.two.tagOne"),
        t("marketing.showcase.fallback.two.tagTwo"),
        t("marketing.showcase.fallback.two.tagThree")
      ],
      title: t("marketing.showcase.fallback.two.title")
    },
    {
      href: null,
      imageUrl: null,
      summary: t("marketing.showcase.fallback.three.summary"),
      tags: [
        t("marketing.showcase.fallback.three.tagOne"),
        t("marketing.showcase.fallback.three.tagTwo"),
        t("marketing.showcase.fallback.three.tagThree")
      ],
      title: t("marketing.showcase.fallback.three.title")
    }
  ]
  const hasItems = items.length > 0
  const cards: ShowcaseSectionCard[] = hasItems
    ? items.map((item) => ({
        href: item.href,
        imageUrl: item.imageUrl,
        summary: item.summary,
        tags: item.tags,
        title: item.title
      }))
    : fallbackCards

  return (
    <section id="samples" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="theme-marketing-eyebrow">{t("marketing.showcase.eyebrow")}</p>
            <h2 className="theme-marketing-title mt-4 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
              {t("marketing.showcase.title")}
            </h2>
            <p className="theme-marketing-copy mt-4">
              {t("marketing.showcase.description")}
            </p>
          </div>

          <Link
            href="/showcase"
            className="theme-inline-secondary-button inline-flex h-12 items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium"
          >
            {t("marketing.showcase.exploreFull")}
            <ArrowUpRight className="theme-directional-icon h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 xl:grid-cols-3">
          {cards.map((item) => (
            <SurfaceCard
              key={item.title}
              className="theme-marketing-card-lift overflow-hidden p-0"
            >
              <div className="relative h-80 overflow-hidden">
                {item.imageUrl ? (
                  <img
                    alt={item.title}
                    className="h-full w-full object-cover"
                    decoding="async"
                    loading="lazy"
                    src={item.imageUrl}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgb(var(--page-glow-rgb)_/_0.18),transparent_18rem),linear-gradient(180deg,var(--background-soft),var(--background-elevated))]">
                    <div className="theme-soft-panel flex h-20 w-20 items-center justify-center rounded-[1.7rem] border">
                      <GalleryVerticalEnd className="h-8 w-8 text-[rgb(var(--accent-rgb))]" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgb(0_0_0_/_0.18))]" />
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={`${item.title}-${tag}`}
                      className="theme-soft-panel rounded-full border px-3 py-1 text-xs text-[var(--soft-foreground)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="mt-5 text-xl font-semibold text-[var(--foreground)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                  {item.summary}
                </p>

                {hasItems && item.href ? (
                  <Link
                    href={item.href}
                    className="theme-marketing-link mt-5 inline-flex items-center gap-2 text-sm font-medium"
                  >
                    {t("marketing.showcase.viewInShowcase")}
                    <ArrowUpRight className="theme-directional-icon h-4 w-4" />
                  </Link>
                ) : (
                  <p className="mt-5 text-sm text-[var(--soft-foreground)]">
                    {t("marketing.showcase.publishNote")}
                  </p>
                )}
              </div>
            </SurfaceCard>
          ))}
        </div>
      </div>
    </section>
  )
}
