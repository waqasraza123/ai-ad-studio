import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { PublicSectionFrame } from "@/components/layout/page-frame"
import { getServerI18n } from "@/lib/i18n/server"

export async function FaqCtaSection() {
  const { t } = await getServerI18n()
  const faqs = [
    {
      answer: t("marketing.faq.questions.ads.answer"),
      question: t("marketing.faq.questions.ads.question")
    },
    {
      answer: t("marketing.faq.questions.editor.answer"),
      question: t("marketing.faq.questions.editor.question")
    },
    {
      answer: t("marketing.faq.questions.review.answer"),
      question: t("marketing.faq.questions.review.question")
    },
    {
      answer: t("marketing.faq.questions.surfaces.answer"),
      question: t("marketing.faq.questions.surfaces.question")
    }
  ]

  return (
    <section id="faq" className="pb-28 pt-8">
      <PublicSectionFrame className="space-y-10">
        <div className="grid gap-10 lg:grid-cols-[0.62fr_1.38fr]">
          <div className="max-w-md">
            <p className="theme-marketing-eyebrow">{t("marketing.faq.eyebrow")}</p>
            <h2 className="theme-marketing-title mt-4 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
              {t("marketing.faq.title")}
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((item) => (
              <article
                key={item.question}
                className="theme-surface-card theme-marketing-card-lift rounded-[1.75rem] border p-6"
              >
                <h3 className="text-lg font-medium text-[var(--foreground)]">
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="theme-accent-panel overflow-hidden rounded-[2.5rem] border p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="theme-marketing-eyebrow">{t("marketing.faq.finalCtaEyebrow")}</p>
              <h2 className="theme-marketing-title mt-4 text-4xl font-semibold text-[var(--foreground)] sm:text-5xl">
                {t("marketing.faq.finalCtaTitle")}
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--soft-foreground)]">
                {t("marketing.faq.finalCtaDescription")}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/dashboard">
                <span className="theme-button-primary inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-medium">
                  {t("marketing.faq.enterDashboard")}
                  <ArrowRight className="theme-directional-icon h-4 w-4" />
                </span>
              </Link>
              <Link
                href="/showcase"
                className="theme-inline-secondary-button inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-medium"
              >
                {t("marketing.faq.browseShowcase")}
                <ArrowUpRight className="theme-directional-icon h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </PublicSectionFrame>
    </section>
  )
}
