"use client"

import { motion, useReducedMotion } from "motion/react"
import { CheckCircle2, Play, WandSparkles } from "lucide-react"
import { useI18n } from "@/lib/i18n/provider"

export function HeroPreview() {
  const shouldReduceMotion = useReducedMotion()
  const { t } = useI18n()
  const workflowHighlights = [
    {
      label: t("marketing.heroPreview.steps.brief.label"),
      title: t("marketing.heroPreview.steps.brief.title"),
      detail: t("marketing.heroPreview.steps.brief.detail"),
      icon: WandSparkles
    },
    {
      label: t("marketing.heroPreview.steps.review.label"),
      title: t("marketing.heroPreview.steps.review.title"),
      detail: t("marketing.heroPreview.steps.review.detail"),
      icon: CheckCircle2
    },
    {
      label: t("marketing.heroPreview.steps.publish.label"),
      title: t("marketing.heroPreview.steps.publish.title"),
      detail: t("marketing.heroPreview.steps.publish.detail"),
      icon: Play
    }
  ]
  const packageMeta = [
    {
      label: t("marketing.heroPreview.packageMeta.formats"),
      value: t("marketing.heroPreview.packageMeta.formatsValue")
    },
    {
      label: t("marketing.heroPreview.packageMeta.review"),
      value: t("marketing.heroPreview.packageMeta.reviewValue")
    },
    {
      label: t("marketing.heroPreview.packageMeta.surfaces"),
      value: t("marketing.heroPreview.packageMeta.surfacesValue")
    }
  ]

  return (
    <div className="theme-preview-shell theme-preview-shell-readable relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border lg:[margin-inline-start:auto]">
      <div className="theme-preview-glow absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent)]" />
      <div className="pointer-events-none absolute top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgb(var(--preview-glow-rgb)_/_0.2),transparent_68%)] blur-3xl [inset-inline-end:-5rem]" />
      <div className="pointer-events-none absolute -bottom-14 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgb(var(--page-secondary-glow-rgb)_/_0.14),transparent_72%)] blur-3xl [inset-inline-start:2rem]" />

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
        className="theme-surface-card relative z-10 m-4 rounded-[1.9rem] border p-4 shadow-[0_18px_56px_rgb(var(--shadow-rgb)_/_0.1)] sm:m-5 sm:p-6"
      >
        <div className="flex flex-col gap-4 border-b border-[rgba(15,23,42,0.08)] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-lg">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              {t("marketing.heroPreview.system")}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {t("marketing.heroPreview.systemDescription")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="theme-live-pill inline-flex rounded-full border px-3 py-1 text-xs font-medium">
              {t("marketing.heroPreview.reviewFirst")}
            </div>
            <div className="theme-status-pill inline-flex rounded-full border px-3 py-1 text-xs font-medium">
              {t("marketing.heroPreview.canonicalExport")}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_15.5rem]">
          <section className="theme-preview-panel rounded-[1.7rem] border p-5 sm:p-6">
            <div className="flex min-h-[23rem] flex-col justify-between gap-10">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="theme-marketing-eyebrow">
                    {t("marketing.heroPreview.canonicalWinner")}
                  </p>
                  <div className="theme-accent-pill inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t("marketing.heroPreview.readyToPublish")}
                  </div>
                </div>

                <div className="mt-6 max-w-md">
                  <h3 className="text-[1.95rem] font-semibold leading-[0.98] tracking-[-0.06em] text-[var(--foreground)] sm:text-[2.45rem]">
                    {t("marketing.heroPreview.packageTitle")}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                    {t("marketing.heroPreview.packageDescription")}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium text-[var(--soft-foreground)]">
                  {t("marketing.heroPreview.lockedDescription")}
                </p>

                <div className="grid gap-2 sm:grid-cols-3">
                  {packageMeta.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1.15rem] border border-[rgba(15,23,42,0.07)] bg-[rgba(255,255,255,0.58)] px-4 py-3"
                    >
                      <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-[var(--foreground)]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="theme-soft-panel rounded-[1.7rem] border p-4 sm:p-5">
            <div className="border-b border-[rgba(15,23,42,0.08)] pb-4">
              <p className="theme-marketing-eyebrow">{t("marketing.heroPreview.checkpoints")}</p>
              <p className="mt-2 text-base font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                {t("marketing.heroPreview.stepsCount")}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {workflowHighlights.map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.label}
                    className="rounded-[1.15rem] border border-[rgba(15,23,42,0.07)] bg-[rgba(255,255,255,0.62)] px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="theme-accent-pill flex h-9 w-9 shrink-0 items-center justify-center rounded-full border">
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-[var(--foreground)]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </aside>
        </div>
      </motion.div>
    </div>
  )
}
