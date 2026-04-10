import {
  BadgeCheck,
  PackageCheck,
  Presentation,
  Sparkles,
  UploadCloud
} from "lucide-react"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { PublicSectionFrame } from "@/components/layout/page-frame"
import { getServerI18n } from "@/lib/i18n/server"

export async function FeatureGrid() {
  const { t } = await getServerI18n()
  const features = [
    {
      icon: Sparkles,
      title: t("marketing.feature.constrained.title"),
      description: t("marketing.feature.constrained.description")
    },
    {
      icon: Presentation,
      title: t("marketing.feature.review.title"),
      description: t("marketing.feature.review.description")
    },
    {
      icon: BadgeCheck,
      title: t("marketing.feature.winner.title"),
      description: t("marketing.feature.winner.description")
    },
    {
      icon: PackageCheck,
      title: t("marketing.feature.delivery.title"),
      description: t("marketing.feature.delivery.description")
    },
    {
      icon: UploadCloud,
      title: t("marketing.feature.inputs.title"),
      description: t("marketing.feature.inputs.description")
    },
    {
      icon: Sparkles,
      title: t("marketing.feature.teams.title"),
      description: t("marketing.feature.teams.description")
    }
  ]
  return (
    <section className="pb-24 pt-8">
      <PublicSectionFrame>
        <div className="max-w-2xl">
          <p className="theme-marketing-eyebrow">{t("marketing.featureGrid.eyebrow")}</p>
          <h2 className="theme-marketing-title mt-4 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
            {t("marketing.featureGrid.title")}
          </h2>
          <p className="theme-marketing-copy mt-4">
            {t("marketing.featureGrid.description")}
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <SurfaceCard
                key={feature.title}
                className="theme-marketing-card-lift h-full p-6"
              >
                <div className="theme-icon-chip flex h-12 w-12 items-center justify-center rounded-2xl border">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-medium text-[var(--foreground)]">
                  {feature.title}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
                  {feature.description}
                </p>
              </SurfaceCard>
            )
          })}
        </div>
      </PublicSectionFrame>
    </section>
  )
}
