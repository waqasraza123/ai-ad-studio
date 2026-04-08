import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"

const faqs = [
  {
    answer:
      "AI Ad Studio is built for product marketing ads: concept generation, preview review, final exports, and public handoff surfaces.",
    question: "What kind of ads does this create?"
  },
  {
    answer:
      "No. The workflow is intentionally constrained so teams can move through a repeatable path instead of managing a blank-canvas editor.",
    question: "Is this a general-purpose editor?"
  },
  {
    answer:
      "Yes. The workflow includes preview checkpoints so teams can compare outputs before committing to final rendering.",
    question: "Can teams review outputs before final rendering?"
  },
  {
    answer:
      "Approved winners can move into public showcase, campaign, delivery, and lighter share-link surfaces depending on plan access.",
    question: "What public surfaces exist after approval?"
  }
]

export function FaqCtaSection() {
  return (
    <section id="faq" className="px-4 pb-28 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="grid gap-10 lg:grid-cols-[0.62fr_1.38fr]">
          <div className="max-w-md">
            <p className="theme-marketing-eyebrow">FAQ</p>
            <h2 className="theme-marketing-title mt-4 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
              The main objections should be answered on the page
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
              <p className="theme-marketing-eyebrow">Final CTA</p>
              <h2 className="theme-marketing-title mt-4 text-4xl font-semibold text-[var(--foreground)] sm:text-5xl">
                Move from product brief to approved ad output without turning
                the workflow into chaos
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--soft-foreground)]">
                The homepage now ends where it should: a clear path into the
                product and a proof surface for teams that want to inspect
                output quality first.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/dashboard">
                <span className="theme-button-primary inline-flex h-12 items-center justify-center rounded-full border px-6 text-sm font-medium">
                  Enter dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>
              <Link
                href="/showcase"
                className="theme-inline-secondary-button inline-flex h-12 items-center justify-center rounded-full border px-6 text-sm font-medium"
              >
                Browse showcase
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
