import Link from "next/link"
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react"
import { Button } from "@/components/primitives/button"
import { getServerI18n } from "@/lib/i18n/server"
import { HeroPreview } from "./hero-preview"

type HeroSectionProps = {
  featuredSampleCount: number
}

export async function HeroSection({ featuredSampleCount }: HeroSectionProps) {
  const { t } = await getServerI18n()
  const outcomePills = [
    t("marketing.hero.outcomeWorkflow"),
    t("marketing.hero.outcomeReview"),
    t("marketing.hero.outcomeDelivery")
  ]
  const badgeSuffix =
    featuredSampleCount > 0
      ? t("marketing.hero.badgeSuffix", { count: featuredSampleCount })
      : ""

  return (
    <section className="theme-marketing-subtle-grid relative overflow-hidden px-4 pb-24 pt-12 sm:px-6 lg:px-8 lg:pb-32 lg:pt-16">
      <div className="mx-auto max-w-7xl relative">
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="theme-accent-pill inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4" />
              <span>{t("marketing.hero.badge", { suffix: badgeSuffix })}</span>
            </div>

            <h1 className="theme-marketing-title mt-8 text-5xl font-semibold text-[var(--foreground)] sm:text-6xl lg:text-[4.8rem]">
              {t("marketing.hero.title")}
            </h1>

            <p className="theme-marketing-copy mt-6 max-w-2xl text-[1.06rem]">
              {t("marketing.hero.description")}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              {outcomePills.map((item) => (
                <span
                  key={item}
                  className="theme-soft-panel theme-marketing-card-lift inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-[var(--soft-foreground)]"
                >
                  <CheckCircle2 className="h-4 w-4 text-[rgb(var(--accent-rgb))]" />
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard">
                <Button size="lg">
                  {t("header.marketing.enterDashboard")}
                  <ArrowRight className="theme-directional-icon ms-2 h-4 w-4" />
                </Button>
              </Link>

              <Link
                href="/showcase"
                className="theme-inline-secondary-button inline-flex h-12 items-center justify-center rounded-full border px-6 text-sm font-medium"
              >
                {t("marketing.hero.browseShowcase")}
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <div className="theme-soft-panel theme-marketing-card-lift rounded-[1.5rem] border p-5">
                <p className="theme-marketing-eyebrow">{t("marketing.hero.briefs")}</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                  {t("marketing.hero.briefsValue")}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  {t("marketing.hero.briefsDescription")}
                </p>
              </div>
              <div className="theme-soft-panel theme-marketing-card-lift rounded-[1.5rem] border p-5">
                <p className="theme-marketing-eyebrow">{t("marketing.hero.reviews")}</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                  {t("marketing.hero.reviewsValue")}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  {t("marketing.hero.reviewsDescription")}
                </p>
              </div>
              <div className="theme-soft-panel theme-marketing-card-lift rounded-[1.5rem] border p-5">
                <p className="theme-marketing-eyebrow">{t("marketing.hero.delivery")}</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                  {t("marketing.hero.deliveryValue")}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  {t("marketing.hero.deliveryDescription")}
                </p>
              </div>
            </div>
          </div>

          <HeroPreview />
        </div>
      </div>
    </section>
  )
}
