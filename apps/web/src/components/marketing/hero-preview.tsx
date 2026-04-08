"use client"

import { motion, useReducedMotion } from "motion/react"
import { CheckCircle2, Play, Sparkles, WandSparkles } from "lucide-react"

const workflowStages = [
  {
    label: "Brief",
    title: "Normalize the request",
    detail:
      "Product goals, assets, and constraints are locked before generation.",
    icon: WandSparkles
  },
  {
    label: "Concepts",
    title: "Compare directions early",
    detail:
      "Multiple scripts and visual routes are reviewed before final spend.",
    icon: Sparkles
  },
  {
    label: "Previews",
    title: "Approve frames with evidence",
    detail:
      "Teams select the winner from preview-ready frames instead of raw prompts.",
    icon: CheckCircle2
  },
  {
    label: "Promotion",
    title: "Publish the canonical export",
    detail:
      "The approved winner moves into showcase and delivery surfaces intact.",
    icon: Play
  }
]

const exportSummary = [
  {
    label: "Formats",
    value: "9:16, 1:1, 16:9"
  },
  {
    label: "Review lock",
    value: "Owner and external"
  },
  {
    label: "Destinations",
    value: "Showcase and delivery"
  }
]

const readinessStates = ["Concept board", "Preview frame", "Export handoff"]

const destinationCards = [
  {
    label: "Showcase gallery",
    title: "Curated public winners",
    detail: "Approved exports grouped by template, format, and campaign preset.",
    icon: Sparkles
  },
  {
    label: "Delivery handoff",
    title: "Client-ready export package",
    detail: "Canonical files, captions, and notes move into the handoff surface.",
    icon: Play
  }
]

export function HeroPreview() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="theme-preview-shell theme-preview-shell-readable relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border lg:ml-auto">
      <div className="theme-preview-glow absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent)]" />
      <div className="pointer-events-none absolute -right-20 top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgb(var(--preview-glow-rgb)_/_0.2),transparent_68%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-14 left-8 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgb(var(--page-secondary-glow-rgb)_/_0.14),transparent_72%)] blur-3xl" />

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
        className="theme-surface-card relative z-10 m-4 rounded-[1.9rem] border p-4 shadow-[0_24px_72px_rgb(var(--shadow-rgb)_/_0.12)] sm:m-5 sm:p-6"
      >
        <div className="flex flex-col gap-5 border-b border-[var(--border)] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              Studio system
            </p>
            <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-2xl">
              Approved output moves through one clean campaign package
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
              A single approved winner carries its framing, review state, and
              delivery details forward without being rebuilt for showcase or
              client handoff.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <div className="theme-live-pill inline-flex rounded-full border px-3 py-1 text-xs font-medium">
              Review-first workflow
            </div>
            <div className="theme-status-pill inline-flex rounded-full border px-3 py-1 text-xs font-medium">
              Canonical export only
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.28fr)_minmax(20rem,0.88fr)]">
          <div className="grid gap-4">
            <section className="theme-preview-panel theme-marketing-card-lift rounded-[1.7rem] border p-5 sm:p-6">
              <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-xl">
                  <p className="theme-marketing-eyebrow">Canonical winner</p>
                  <h4 className="mt-3 text-[1.9rem] font-semibold leading-[1.02] tracking-[-0.05em] text-[var(--foreground)] sm:text-[2.3rem]">
                    Approved campaign package
                  </h4>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                    The approved winner stays intact across public promotion and
                    handoff instead of splintering into separate downstream
                    versions.
                  </p>
                </div>

                <div className="theme-accent-pill inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Ready for publish
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.12fr)_minmax(17rem,0.88fr)]">
                <div className="theme-preview-canvas relative overflow-hidden rounded-[1.45rem] border p-5 sm:p-6">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgb(255_255_255_/_0.42),transparent_44%),linear-gradient(180deg,transparent,rgba(34,21,26,0.05))]" />
                  <div className="relative flex h-full min-h-[26rem] flex-col justify-between">
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Winner locked",
                        "Copy and CTA aligned",
                        "Handoff ready"
                      ].map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-[rgb(var(--primary-rgb)_/_0.16)] bg-[rgba(255,255,255,0.76)] px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-[var(--soft-foreground)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="max-w-lg">
                      <p className="theme-marketing-eyebrow">Active output</p>
                      <p className="mt-3 text-[2rem] font-semibold leading-[1.02] tracking-[-0.05em] text-[var(--foreground)] sm:text-[2.45rem]">
                        Final export stays consistent across publish and
                        delivery
                      </p>
                      <p className="mt-4 max-w-md text-sm leading-7 text-[var(--soft-foreground)]">
                        Framing, captions, and handoff notes move forward as
                        one approved package, preserving the same winner across
                        every external surface.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.2rem] border border-[var(--border)] bg-[rgba(255,255,255,0.78)] p-4">
                        <p className="theme-marketing-eyebrow">Campaign master</p>
                        <p className="mt-2 text-sm font-medium leading-6 text-[var(--foreground)]">
                          Headline treatment, CTA emphasis, and framing remain
                          pinned to the approved winner.
                        </p>
                      </div>
                      <div className="rounded-[1.2rem] border border-[var(--border)] bg-[rgba(255,255,255,0.78)] p-4">
                        <p className="theme-marketing-eyebrow">Delivery package</p>
                        <p className="mt-2 text-sm font-medium leading-6 text-[var(--foreground)]">
                          Formats, captions, and notes travel with the export
                          into client-ready handoff.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="theme-soft-panel rounded-[1.25rem] border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="theme-marketing-eyebrow">Release package</p>
                      <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                        Locked metadata
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {exportSummary.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-[1rem] border border-[rgba(15,23,42,0.07)] bg-[rgba(255,255,255,0.56)] px-4 py-3"
                        >
                          <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                            {item.label}
                          </p>
                          <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="theme-soft-panel rounded-[1.25rem] border p-4">
                    <p className="theme-marketing-eyebrow">Why it holds up</p>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                      Review happens before final promotion, so showcase,
                      campaign delivery, and handoff surfaces all inherit the
                      same approved asset package.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {readinessStates.map((label) => (
                  <div
                    key={label}
                    className="theme-soft-panel rounded-[1.15rem] border px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                      Ready state preserved
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-4">
            <section className="theme-soft-panel theme-marketing-card-lift rounded-[1.7rem] border p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                <div>
                  <p className="theme-marketing-eyebrow">Workflow checkpoints</p>
                  <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                    4 gated phases
                  </p>
                </div>
                <span className="rounded-full border border-[rgba(15,23,42,0.08)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  Scannable flow
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {workflowStages.map((item, index) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.label}
                      className="rounded-[1.2rem] border border-[var(--border)] bg-[rgba(255,255,255,0.68)] p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-2 pt-0.5">
                          <div className="theme-accent-pill flex h-10 w-10 items-center justify-center rounded-full border">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                            {item.label}
                          </p>
                          <p className="mt-2 text-base font-semibold leading-6 text-[var(--foreground)]">
                            {item.title}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="theme-soft-panel theme-marketing-card-lift rounded-[1.7rem] border p-5 sm:p-6">
              <div className="border-b border-[var(--border)] pb-4">
                <p className="theme-marketing-eyebrow">Promotion surfaces</p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                  The approved winner publishes outward without translation
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                {destinationCards.map((item) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.label}
                      className="rounded-[1.2rem] border border-[var(--border)] bg-[rgba(255,255,255,0.7)] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="theme-status-pill flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                            {item.label}
                          </p>
                          <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                            {item.title}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
