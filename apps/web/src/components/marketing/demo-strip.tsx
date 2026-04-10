import {
  Clapperboard,
  LayoutTemplate,
  ScanSearch,
  WandSparkles
} from "lucide-react"
import { PublicSectionFrame } from "@/components/layout/page-frame"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getServerI18n } from "@/lib/i18n/server"

export async function WorkflowStrip() {
  const { t } = await getServerI18n()
  const workflowSteps = [
    {
      icon: ScanSearch,
      title: t("marketing.workflow.steps.brief.title"),
      description: t("marketing.workflow.steps.brief.description")
    },
    {
      icon: WandSparkles,
      title: t("marketing.workflow.steps.generate.title"),
      description: t("marketing.workflow.steps.generate.description")
    },
    {
      icon: LayoutTemplate,
      title: t("marketing.workflow.steps.review.title"),
      description: t("marketing.workflow.steps.review.description")
    },
    {
      icon: Clapperboard,
      title: t("marketing.workflow.steps.publish.title"),
      description: t("marketing.workflow.steps.publish.description")
    }
  ]

  return (
    <section id="workflow" className="py-24">
      <PublicSectionFrame>
        <div className="grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:items-start">
          <div className="max-w-md">
            <p className="theme-marketing-eyebrow">{t("marketing.workflow.eyebrow")}</p>
            <h2 className="theme-marketing-title mt-4 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
              {t("marketing.workflow.title")}
            </h2>
            <p className="theme-marketing-copy mt-4">
              {t("marketing.workflow.description")}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflowSteps.map((step) => {
              const Icon = step.icon

              return (
                <SurfaceCard
                  key={step.title}
                  className="theme-marketing-card-lift relative overflow-hidden p-6"
                >
                  <div className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(var(--primary-rgb)_/_0.35),transparent)]" />
                  <div className="theme-icon-chip flex h-12 w-12 items-center justify-center rounded-2xl border">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-medium text-[var(--foreground)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                    {step.description}
                  </p>
                </SurfaceCard>
              )
            })}
          </div>
        </div>
      </PublicSectionFrame>
    </section>
  )
}
